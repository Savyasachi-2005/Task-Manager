import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { tasksAPI } from '../api'
import TaskCard from '../components/TaskCard'
import TaskModal from '../components/TaskModal'
import Pagination from '../components/Pagination'

const PAGE_SIZE = 8

export default function Dashboard() {
  const navigate = useNavigate()
  
  // ── user role ────────────────────────────────────────────────────────────
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || 'user')
  const isAdmin = userRole === 'admin'

  // ── task list state ──────────────────────────────────────────────────────
  const [tasks, setTasks] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState('')

  // ── modal state ──────────────────────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null) // null = create mode

  // ── fetch tasks ──────────────────────────────────────────────────────────
  const fetchTasks = useCallback(async (pageNum = 1) => {
    setLoading(true)
    setListError('')
    try {
      const { data } = await tasksAPI.list(pageNum, PAGE_SIZE)
      setTasks(data.tasks)
      setTotal(data.total)
      setTotalPages(data.total_pages)
      setPage(pageNum)
    } catch {
      setListError('Failed to load tasks. Please refresh.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTasks(1)
  }, [fetchTasks])

  // ── handlers ─────────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userId')
    navigate('/login')
  }

  const openCreate = () => {
    setEditingTask(null)
    setModalOpen(true)
  }

  const openEdit = (task) => {
    setEditingTask(task)
    setModalOpen(true)
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setEditingTask(null)
  }

  const handleSaved = () => {
    handleModalClose()
    fetchTasks(page)
  }

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task? This action cannot be undone.')) return
    try {
      await tasksAPI.remove(taskId)
      // If deleted the last item on a later page, go back one page
      const newPage = tasks.length === 1 && page > 1 ? page - 1 : page
      fetchTasks(newPage)
    } catch {
      alert('Failed to delete task. Please try again.')
    }
  }

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="font-bold text-gray-900 text-lg">Task Manager</span>
            
            {/* Admin Badge */}
            {isAdmin && (
              <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full border border-amber-200">
                Admin Mode
              </span>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isAdmin ? 'All Tasks' : 'My Tasks'}
            </h2>
            <p className="text-gray-500 text-sm mt-0.5">
              {total} task{total !== 1 ? 's' : ''} total
              {isAdmin && ' (across all users)'}
            </p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Task
          </button>
        </div>

        {/* Error state */}
        {listError && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-6">
            {listError}
          </div>
        )}

        {/* Loading skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                <div className="h-3 bg-gray-100 rounded w-full mb-2" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          /* Empty state */
          <div className="text-center py-24">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-gray-700 font-semibold text-lg mb-1">No tasks yet</h3>
            <p className="text-gray-400 text-sm mb-5">Create your first task to get started.</p>
            <button
              onClick={openCreate}
              className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition"
            >
              Create Task
            </button>
          </div>
        ) : (
          <>
            {/* Task grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isAdmin={isAdmin}
                  onEdit={() => openEdit(task)}
                  onDelete={() => handleDelete(task.id)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={(p) => fetchTasks(p)}
              />
            )}
          </>
        )}
      </main>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <TaskModal
          task={editingTask}
          onClose={handleModalClose}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}
