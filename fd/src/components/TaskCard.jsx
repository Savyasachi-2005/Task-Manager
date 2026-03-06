/**
 * TaskCard – displays a single task with edit and delete actions.
 */
export default function TaskCard({ task, isAdmin, onEdit, onDelete }) {
  const dateStr = new Date(task.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  
  // Truncate user_id for display
  const ownerIdShort = task.user_id?.toString().slice(0, 8) || 'Unknown'

  return (
    <div className={`bg-white border rounded-xl p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow group ${
      isAdmin ? 'border-amber-200 bg-amber-50/30' : 'border-gray-200'
    }`}>
      {/* Title */}
      <h3 className="font-semibold text-gray-900 leading-snug line-clamp-2">
        {task.title}
      </h3>

      {/* Description */}
      {task.description ? (
        <p className="text-sm text-gray-500 line-clamp-3 flex-1">
          {task.description}
        </p>
      ) : (
        <p className="text-sm text-gray-300 italic flex-1">No description</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-100 mt-auto">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-gray-400">{dateStr}</span>
          {isAdmin && (
            <span className="text-xs text-amber-600 font-mono" title={`Owner: ${task.user_id}`}>
              User: {ownerIdShort}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Edit */}
          <button
            onClick={onEdit}
            title="Edit task"
            className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>

          {/* Delete */}
          <button
            onClick={onDelete}
            title="Delete task"
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
