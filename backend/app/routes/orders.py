import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.dependencies import get_current_user, require_admin
from app.core.notification_manager import notification_manager
from app.db.session import get_db
from app.models.cart import CartItem
from app.models.notification import Notification
from app.models.order import Order, OrderItem, OrderStatus
from app.models.product import Product
from app.models.shipping_address import ShippingAddress
from app.models.user import User
from app.schemas.order import CreateOrderRequest, OrderListResponse, OrderResponse, StatusUpdateRequest

router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("/create", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    body: CreateOrderRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    cart_result = await db.execute(
        select(CartItem).where(CartItem.user_id == current_user.id)
    )
    cart_items = cart_result.scalars().all()

    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    # Validate shipping address
    addr = await db.get(ShippingAddress, uuid.UUID(body.shipping_address_id))
    if not addr or addr.user_id != current_user.id:
        raise HTTPException(status_code=400, detail="Invalid shipping address")

    # Validate payment method
    valid_payments = ["cod", "bank_transfer", "stripe", "paypal"]
    if body.payment_method not in valid_payments:
        raise HTTPException(status_code=400, detail=f"Invalid payment method. Choose from: {', '.join(valid_payments)}")

    subtotal = 0.0
    order_items_data = []
    product_updates = []

    for ci in cart_items:
        product = await db.get(Product, ci.product_id)
        if not product or not product.is_active:
            raise HTTPException(
                status_code=400,
                detail=f"Product {ci.product_id} is no longer available",
            )
        if product.stock < ci.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Not enough stock for {product.title}. Available: {product.stock}",
            )

        price = product.price
        subtotal += price * ci.quantity

        order_items_data.append(
            {
                "product_id": product.id,
                "product_title": product.title,
                "quantity": ci.quantity,
                "price_snapshot": price,
            }
        )
        product_updates.append((product, ci.quantity))

    shipping_fee = 0.0 if subtotal >= settings.free_shipping_threshold else 9.99
    tax = round(subtotal * 0.08, 2)
    total = round(subtotal + shipping_fee + tax, 2)

    order = Order(
        user_id=current_user.id,
        subtotal=round(subtotal, 2),
        shipping_fee=shipping_fee,
        tax=tax,
        total_price=total,
        payment_method=body.payment_method,
        notes=body.notes,
        shipping_address_id=addr.id,
        status=OrderStatus.PENDING,
    )
    db.add(order)
    await db.flush()

    for data in order_items_data:
        db.add(OrderItem(order_id=order.id, **data))

    for product, qty in product_updates:
        product.stock -= qty

    for ci in cart_items:
        await db.delete(ci)

    await db.commit()
    await db.refresh(order)

    # Create admin notification
    notif = Notification(
        title="New Order",
        message=f"Order #{str(order.id)[:8]} placed by {current_user.name} — ${total}",
        notification_type="new_order",
    )
    db.add(notif)
    await db.commit()

    # Broadcast via WebSocket
    await notification_manager.send_order_event(
        order_id=str(order.id),
        status="pending",
        customer_name=current_user.name,
        total=total,
    )

    result = await db.execute(
        select(OrderItem).where(OrderItem.order_id == order.id)
    )
    items = result.scalars().all()

    return OrderResponse(
        id=order.id,
        user_id=order.user_id,
        subtotal=order.subtotal,
        shipping_fee=order.shipping_fee,
        tax=order.tax,
        total_price=order.total_price,
        payment_method=order.payment_method,
        notes=order.notes,
        status=order.status.value,
        created_at=order.created_at,
        items=[
            {
                "id": i.id,
                "product_id": i.product_id,
                "product_title": i.product_title,
                "quantity": i.quantity,
                "price_snapshot": i.price_snapshot,
            }
            for i in items
        ],
    )


@router.get("/my", response_model=OrderListResponse)
async def my_orders(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    count_result = await db.execute(
        select(func.count(Order.id)).where(Order.user_id == current_user.id)
    )
    total = count_result.scalar() or 0

    result = await db.execute(
        select(Order)
        .where(Order.user_id == current_user.id)
        .order_by(Order.created_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
    )
    orders = result.scalars().all()

    response = []
    for order in orders:
        items_result = await db.execute(
            select(OrderItem).where(OrderItem.order_id == order.id)
        )
        items = items_result.scalars().all()
        response.append(
            OrderResponse(
                id=order.id,
                user_id=order.user_id,
                subtotal=order.subtotal,
                shipping_fee=order.shipping_fee,
                tax=order.tax,
                total_price=order.total_price,
                payment_method=order.payment_method,
                notes=order.notes,
                status=order.status.value,
                created_at=order.created_at,
                items=[
                    {
                        "id": i.id,
                        "product_id": i.product_id,
                        "product_title": i.product_title,
                        "quantity": i.quantity,
                        "price_snapshot": i.price_snapshot,
                    }
                    for i in items
                ],
            )
        )

    return OrderListResponse(items=response, total=total, page=page, per_page=per_page)


@router.get("/all", response_model=OrderListResponse)
async def all_orders(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    count_result = await db.execute(select(func.count(Order.id)))
    total = count_result.scalar() or 0

    result = await db.execute(
        select(Order)
        .order_by(Order.created_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
    )
    orders = result.scalars().all()

    response = []
    for order in orders:
        items_result = await db.execute(
            select(OrderItem).where(OrderItem.order_id == order.id)
        )
        items = items_result.scalars().all()
        response.append(
            OrderResponse(
                id=order.id,
                user_id=order.user_id,
                subtotal=order.subtotal,
                shipping_fee=order.shipping_fee,
                tax=order.tax,
                total_price=order.total_price,
                payment_method=order.payment_method,
                notes=order.notes,
                status=order.status.value,
                created_at=order.created_at,
                items=[
                    {
                        "id": i.id,
                        "product_id": i.product_id,
                        "product_title": i.product_title,
                        "quantity": i.quantity,
                        "price_snapshot": i.price_snapshot,
                    }
                    for i in items
                ],
            )
        )

    return OrderListResponse(items=response, total=total, page=page, per_page=per_page)


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    order = await db.get(Order, uuid.UUID(order_id))
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    items_result = await db.execute(
        select(OrderItem).where(OrderItem.order_id == order.id)
    )
    items = items_result.scalars().all()
    return OrderResponse(
        id=order.id,
        user_id=order.user_id,
        subtotal=order.subtotal,
        shipping_fee=order.shipping_fee,
        tax=order.tax,
        total_price=order.total_price,
        payment_method=order.payment_method,
        notes=order.notes,
        status=order.status.value,
        created_at=order.created_at,
        items=[{"id": i.id, "product_id": i.product_id, "product_title": i.product_title, "quantity": i.quantity, "price_snapshot": i.price_snapshot} for i in items],
    )


@router.put("/status/{order_id}", response_model=OrderResponse)
async def update_order_status(
    order_id: str,
    body: StatusUpdateRequest,
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    order = await db.get(Order, uuid.UUID(order_id))
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    try:
        new_status = OrderStatus(body.status)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid status: {body.status}")

    order.status = new_status
    await db.commit()
    await db.refresh(order)

    # Create notification for customer
    notif = Notification(
        user_id=order.user_id,
        title="Order Status Updated",
        message=f"Your order #{str(order.id)[:8]} is now {body.status}",
        notification_type="order_status",
    )
    db.add(notif)
    await db.commit()

    items_result = await db.execute(
        select(OrderItem).where(OrderItem.order_id == order.id)
    )
    items = items_result.scalars().all()

    return OrderResponse(
        id=order.id,
        user_id=order.user_id,
        subtotal=order.subtotal,
        shipping_fee=order.shipping_fee,
        tax=order.tax,
        total_price=order.total_price,
        payment_method=order.payment_method,
        notes=order.notes,
        status=order.status.value,
        created_at=order.created_at,
        items=[
            {
                "id": i.id,
                "product_id": i.product_id,
                "product_title": i.product_title,
                "quantity": i.quantity,
                "price_snapshot": i.price_snapshot,
            }
            for i in items
        ],
    )
