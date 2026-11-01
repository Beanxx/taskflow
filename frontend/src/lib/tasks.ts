import type { Task, TaskStatus } from '../components/TaskTable'
import { clearToken, getToken } from './auth'

export class UnauthorizedError extends Error {}

export interface NewTask {
  title: string
  description?: string
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api/tasks${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
  })

  if (res.status === 401) {
    clearToken()
    throw new UnauthorizedError()
  }
  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new Error(data?.error ?? '요청에 실패했습니다.')
  }
  return res.status === 204 ? (undefined as T) : res.json()
}

export const fetchTasks = () => request<Task[]>('')

export const createTask = (task: NewTask) =>
  request<Task>('', { method: 'POST', body: JSON.stringify(task) })

export const updateTaskStatus = (id: number, status: TaskStatus) =>
  request<Task>(`/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) })

export const deleteTask = (id: number) => request<void>(`/${id}`, { method: 'DELETE' })
