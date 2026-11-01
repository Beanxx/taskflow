import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import ConfirmDialog from '../components/ConfirmDialog'
import TaskFormModal from '../components/TaskFormModal'
import TaskTable, { type Task, type TaskStatus } from '../components/TaskTable'
import { clearToken, getToken } from '../lib/auth'
import {
  createTask,
  deleteTask,
  fetchTasks,
  UnauthorizedError,
  updateTaskStatus,
  type NewTask,
} from '../lib/tasks'

function Dashboard() {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<Task[]>([])
  const [error, setError] = useState<string>()
  const [creating, setCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<number>()

  // 토큰이 만료되었거나 유효하지 않으면 로그인 페이지로 보낸다.
  const showError = (err: unknown) => {
    if (err instanceof UnauthorizedError) navigate('/login')
    else setError(err instanceof Error ? err.message : '요청에 실패했습니다.')
  }

  useEffect(() => {
    fetchTasks()
      .then(setTasks)
      .catch(showError)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCreate = async (task: NewTask) => {
    try {
      const created = await createTask(task)
      setTasks((prev) => [...prev, created])
      setCreating(false)
    } catch (err) {
      // 인증 실패는 이동으로 처리하고, 나머지는 모달이 에러를 표시하도록 다시 던진다.
      if (!(err instanceof UnauthorizedError)) throw err
      navigate('/login')
    }
  }

  const handleStatusChange = async (id: number, status: TaskStatus) => {
    setError(undefined)
    try {
      const updated = await updateTaskStatus(id, status)
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)))
    } catch (err) {
      showError(err)
    }
  }

  const handleDelete = async () => {
    const id = deletingId
    if (id === undefined) return
    setError(undefined)
    try {
      await deleteTask(id)
      setTasks((prev) => prev.filter((t) => t.id !== id))
    } catch (err) {
      showError(err)
    } finally {
      setDeletingId(undefined)
    }
  }

  const handleLogout = () => {
    clearToken()
    navigate('/login')
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            새 태스크 추가
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            로그아웃
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-6">
        <TaskTable
          tasks={tasks}
          onStatusChange={handleStatusChange}
          onDelete={setDeletingId}
        />
      </div>

      {creating && <TaskFormModal onSubmit={handleCreate} onClose={() => setCreating(false)} />}
      {deletingId !== undefined && (
        <ConfirmDialog
          message="이 태스크를 삭제할까요?"
          onConfirm={handleDelete}
          onCancel={() => setDeletingId(undefined)}
        />
      )}
    </main>
  )
}

export default function DashboardPage() {
  if (!getToken()) return <Navigate to="/login" replace />
  return <Dashboard />
}
