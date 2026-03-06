/**
 * Pagination – renders previous / next controls and page indicator.
 *
 * Props:
 *   page         – current 1-based page number
 *   totalPages   – total number of pages
 *   onPageChange – callback(newPage: number)
 */
export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      {/* Previous */}
      <button
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
        aria-label="Previous page"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Page numbers (collapse to ellipsis for large page counts) */}
      {pages.map((p) => {
        const isActive = p === page
        const showPage =
          p === 1 || p === totalPages || Math.abs(p - page) <= 1

        if (!showPage) {
          // Render ellipsis only once between gaps
          const prevShown =
            p - 1 === 1 || Math.abs(p - 1 - page) <= 1
          if (!prevShown) return null
          return (
            <span key={p} className="px-2 text-gray-400 text-sm select-none">
              …
            </span>
          )
        }

        return (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
              isActive
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {p}
          </button>
        )
      })}

      {/* Next */}
      <button
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
        aria-label="Next page"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}
