import { useState } from "react";

export type TaskStatus = "pending" | "in_progress" | "completed";

export interface Task {
  id: number;
  title: string;
  description?: string | null;
  status: string;
}

interface TaskTableProps {
  tasks: Task[];
  onStatusChange: (id: number, nextStatus: TaskStatus) => void;
  onDelete: (id: number) => void;
}

const NEXT_STATUS: Record<TaskStatus, TaskStatus> = {
  pending: "in_progress",
  in_progress: "completed",
  completed: "pending",
};

const BADGE_CLASS: Record<TaskStatus, string> = {
  pending: "bg-gray-100 text-gray-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
};

const STATUSES: TaskStatus[] = ["pending", "in_progress", "completed"];

const STATUS_LABEL: Record<TaskStatus, string> = {
  pending: "대기중",
  in_progress: "진행중",
  completed: "완료",
};

const isTaskStatus = (status: string): status is TaskStatus =>
  status in NEXT_STATUS;

const getNextStatus = (status: string): TaskStatus =>
  isTaskStatus(status) ? NEXT_STATUS[status] : "pending";

const statusLabel = (status: string) =>
  isTaskStatus(status) ? STATUS_LABEL[status] : status;

const badgeClass = (status: string) =>
  isTaskStatus(status) ? BADGE_CLASS[status] : "bg-gray-100 text-gray-800";

const headerCell =
  "px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500";

export default function TaskTable({
  tasks,
  onStatusChange,
  onDelete,
}: TaskTableProps) {
  // 상태 배지를 눌러 직접 상태를 고르는 중인 태스크
  const [editingId, setEditingId] = useState<number>();

  if (tasks.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-500">
        태스크가 없습니다
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className={headerCell}>
              제목
            </th>
            <th scope="col" className={headerCell}>
              설명
            </th>
            <th scope="col" className={headerCell}>
              상태
            </th>
            <th scope="col" className={headerCell}>
              액션
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {tasks.map((task) => (
            <tr key={task.id} className="task-item">
              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                {task.title}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {task.description}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm">
                {editingId === task.id ? (
                  <div className="flex gap-1">
                    {STATUSES.map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => {
                          setEditingId(undefined);
                          if (status !== task.status) onStatusChange(task.id, status);
                        }}
                        className={`rounded-full px-2 py-1 text-xs font-medium ring-1 ring-gray-300 hover:ring-blue-500 ${badgeClass(status)}`}
                      >
                        {STATUS_LABEL[status]}
                      </button>
                    ))}
                  </div>
                ) : (
                  <button
                    type="button"
                    data-testid={`status-${task.status}`}
                    onClick={() => setEditingId(task.id)}
                    className={`rounded-full px-2 py-1 text-xs font-medium ${badgeClass(task.status)}`}
                  >
                    {statusLabel(task.status)}
                  </button>
                )}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      onStatusChange(task.id, getNextStatus(task.status))
                    }
                    className="text-blue-600 hover:text-blue-800"
                  >
                    상태 변경
                  </button>
                  <button
                    type="button"
                    data-testid="delete-button"
                    onClick={() => onDelete(task.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    삭제
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
