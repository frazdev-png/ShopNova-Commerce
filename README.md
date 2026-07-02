# ShopWave - Ecommerce Platform

A production-grade ecommerce platform built with **React (Vite + TypeScript)** frontend and **FastAPI (Python)** backend.

## Tech Stack

| Layer     | Technology                        |
| --------- | --------------------------------- |
| Frontend  | React 19, Vite, TypeScript, Tailwind CSS |
| Backend   | FastAPI, SQLAlchemy (async), PostgreSQL |
| Auth      | JWT *(coming soon)*               |
| Real-time | WebSockets *(coming soon)*        |

---

## Project Structure

```
ecommerce/
├── frontend/          # React + Vite + TypeScript
│   ├── src/
│   │   ├── pages/        # Page components
│   │   ├── components/   # Reusable UI components
│   │   ├── services/     # API client
│   │   ├── store/        # State management
│   │   └── assets/       # Static assets
│   └── ...
├── backend/           # FastAPI Python backend
│   ├── app/
│   │   ├── core/         # Config, settings
│   │   ├── models/       # SQLAlchemy models
│   │   ├── routes/       # API routes
│   │   ├── schemas/      # Pydantic schemas
│   │   └── db/           # Database session
│   └── ...
├── database/          # SQL schemas
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- Python 3.11+
- PostgreSQL 16+

---

### Backend Setup

```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
# source .venv/bin/activate

pip install -r requirements.txt

# Copy env and edit values
copy .env.example .env

# Run
uvicorn app.main:app --reload --port 8000
```

API available at `http://localhost:8000`  
Swagger docs at `http://localhost:8000/docs`

---

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend available at `http://localhost:5173`

---

### Database Setup

```sql
-- Connect to PostgreSQL and run:
CREATE DATABASE ecommerce;
-- Then apply the schema:
\i database/schema.sql
```

---

## Development

Both servers can be run simultaneously for local development.  
The frontend proxies or directly calls the backend at `http://localhost:8000/api`.
