import { useId, useState, type FormEvent } from 'react'
import { ErrorMessage, inputClass } from './FormField'
import type { NewTask } from '../lib/tasks'

interface TaskFormModalProps {
  onSubmit: (task: NewTask) => Promise<void>
  onClose: () => void
}

export default function TaskFormModal({ onSubmit, onClose }: TaskFormModalProps) {
  const titleId = useId()
  const descriptionId = useId()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [titleError, setTitleError] = useState<string>()
  const [formError, setFormError] = useState<string>()
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setTitleError('제목을 입력해주세요.')
      return
    }

    setSubmitting(true)
    setFormError(undefined)
    try {
      await onSubmit({ title: trimmedTitle, description: description.trim() || undefined })
    } catch (err) {
      setFormError(err instanceof Error ? err.message : '태스크를 추가하지 못했습니다.')
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 px-4">
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${titleId}-heading`}
        onSubmit={handleSubmit}
        noValidate
        className="w-full max-w-md space-y-4 rounded-lg bg-white p-6 shadow-lg"
      >
        <h2 id={`${titleId}-heading`} className="text-lg font-semibold text-gray-900">
          새 태스크 추가
        </h2>

        <div>
          <label htmlFor={titleId} className="block text-sm font-medium text-gray-700">
            제목
          </label>
          <input
            id={titleId}
            name="taskTitle"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              setTitleError(undefined)
            }}
            aria-invalid={titleError ? true : undefined}
            aria-describedby={titleError ? `${titleId}-error` : undefined}
            className={inputClass(!!titleError)}
          />
          <ErrorMessage id={`${titleId}-error`} message={titleError} />
        </div>

        <div>
          <label htmlFor={descriptionId} className="block text-sm font-medium text-gray-700">
            설명
          </label>
          <textarea
            id={descriptionId}
            name="taskDescription"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={inputClass(false)}
          />
        </div>

        {formError && (
          <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {formError}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            추가
          </button>
        </div>
      </form>
    </div>
  )
}
