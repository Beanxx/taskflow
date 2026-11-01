import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import TaskTable from "../src/components/TaskTable";

describe("TaskTable Component", () => {
  const mockTasks = [
    {
      id: 1,
      title: "태스크 1",
      status: "pending",
      description: "설명 1",
    },
    {
      id: 2,
      title: "태스크 2",
      status: "completed",
      description: "설명 2",
    },
  ];

  test("태스크 목록을 렌더링한다", () => {
    // Arrange
    render(
      <TaskTable
        tasks={mockTasks}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    // Act (없음)

    // Assert
    expect(screen.getByText("태스크 1")).toBeInTheDocument();
    expect(screen.getByText("태스크 1")).toBeInTheDocument();
    expect(screen.getByText("대기중")).toBeInTheDocument();
    expect(screen.getByText("완료")).toBeInTheDocument();
  });

  test("상태 배지를 눌러 원하는 상태를 선택하면 onStatusChange를 호출한다", () => {
    // Arrange
    const mockOnStatusChange = vi.fn();
    render(
      <TaskTable
        tasks={mockTasks}
        onStatusChange={mockOnStatusChange}
        onDelete={vi.fn()}
      />,
    );

    // Act
    fireEvent.click(screen.getByText("대기중"));
    fireEvent.click(screen.getAllByRole("button", { name: "완료" })[0]);

    // Assert
    expect(mockOnStatusChange).toHaveBeenCalledWith(1, "completed");
  });

  test("상태 변경 클릭시 onStatusChange 콜백을 호출한다", () => {
    // Arrange
    const mockOnStatusChange = vi.fn();
    render(
      <TaskTable
        tasks={mockTasks}
        onStatusChange={mockOnStatusChange}
        onDelete={vi.fn()}
      />,
    );

    // Act
    const statusButton = screen.getAllByRole("button", {
      name: "상태 변경",
    })[0];
    fireEvent.click(statusButton);

    // Assert
    expect(mockOnStatusChange).toHaveBeenCalledWith(1, "in_progress");
  });

  test("삭제 클릭시 onDelete 콜백을 호출한다", () => {
    // Arrange
    const mockOnDelete = vi.fn();
    render(
      <TaskTable
        tasks={mockTasks}
        onStatusChange={vi.fn()}
        onDelete={mockOnDelete}
      />,
    );

    // Act
    const deleteButton = screen.getAllByRole("button", { name: "삭제" })[0];
    fireEvent.click(deleteButton);

    // Assert
    expect(mockOnDelete).toHaveBeenCalledWith(1);
  });
});
