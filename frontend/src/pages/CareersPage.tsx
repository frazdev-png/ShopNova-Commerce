export default function CareersPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">Careers</span>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mt-2 mb-3">
          Join the SHOPNOVA Team
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          We're building the future of ecommerce. If you're passionate, driven, and love working with great people, we'd love to hear from you.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Why Join Us?</h3>
          <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
            {[
              "Remote-first culture with flexible hours",
              "Competitive salary and equity packages",
              "Health, dental, and vision insurance",
              "Annual learning & development budget",
              "Latest tools and equipment provided",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Open Positions</h3>
          <div className="space-y-3">
            {[
              { role: "Senior Full-Stack Engineer", type: "Remote" },
              { role: "Product Designer", type: "Remote" },
              { role: "Customer Success Lead", type: "Hybrid" },
            ].map((job) => (
              <div key={job.role} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{job.role}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{job.type}</p>
                </div>
                <span className="text-xs font-medium text-primary-600 dark:text-primary-400">Apply →</span>
              </div>
            ))}
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center pt-2">
              No open positions right now? Send your resume to <span className="text-primary-600 dark:text-primary-400">careers@shopnova.com</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
