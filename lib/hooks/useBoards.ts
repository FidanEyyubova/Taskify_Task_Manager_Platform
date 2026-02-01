"use client";

import {
  boardDataServices,
  boardServices,
  columnServices,
  taskServices,
} from "../services";
import { useEffect, useState } from "react";
import { Board, Column, ColumnWithTasks, Task } from "../supabase/models";
import { useSupabase } from "../supabase/SupabaseProvider";
import { useUser } from "@clerk/nextjs";

export function useBoards() {
  const { user } = useUser();
  const { supabase } = useSupabase();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadBoards();
    }
  }, [user, supabase]);

  async function loadBoards() {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const data = await boardServices.getBoards(supabase!, user.id);
      setBoards(data);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to load boards!",
      );
    } finally {
      setLoading(false);
    }
  }

  async function createBoard(boardData: {
    title: string;
    description?: string;
    color?: string;
  }) {
    if (!user) throw new Error("User not authenticated");
    try {
      const newBoard = await boardDataServices.createBoardWithDefaultColumns(
        supabase!,
        {
          ...boardData,
          userId: user.id,
        },
      );
      setBoards((prev) => [newBoard, ...prev]);
      return newBoard;
    } catch (errormessage) {
      setError(
        errormessage instanceof Error
          ? errormessage.message
          : "Failed to create board!",
      );
    }
  }

  return { createBoard, loading, error, boards, setBoards };
}

export function useBoard(boardId: string) {
  const { user } = useUser();
  const { supabase } = useSupabase();
  const [board, setBoard] = useState<Board | null>(null);
  const [column, setColumn] = useState<ColumnWithTasks[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (boardId) {
      loadBoard();
    }
  }, [boardId, supabase]);

  async function loadBoard() {
    if (!boardId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await boardDataServices.getBoardWithColumns(
        supabase!,
        boardId,
      );
      setBoard(data.board);
      setColumn(data.columnsWithTasks);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to load boards!",
      );
    } finally {
      setLoading(false);
    }
  }

  async function updateBoard(boardId: string, updates: Partial<Board>) {
    try {
      const updatedBoard = await boardServices.updateBoard(
        supabase!,
        boardId,
        updates,
      );
      setBoard(updatedBoard);
      return updatedBoard;
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to update the boards!",
      );
    }
  }

  async function createRealTask(
    columnId: string,
    taskData: {
      title: string;
      description?: string | null;
      assignee?: string | null;
      dueDate?: string | null;
      priority?: "low" | "medium" | "high";
    },
  ) {
    try {
      const newTask = await taskServices.createTask(supabase!, {
        title: taskData.title,
        description: taskData.description ?? null,
        assignee: taskData.assignee ?? null,
        due_date: taskData.dueDate ?? null,
        column_id: columnId,
        sort_order:
          column.find((col) => col.id === columnId)?.tasks.length ?? 0,
        priority: taskData.priority ?? "medium",
      });

      setColumn((prev) =>
        prev.map((col) =>
          col.id === columnId
            ? { ...col, tasks: [...col.tasks, newTask] }
            : col,
        ),
      );

      return newTask;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create the task.",
      );
    }
  }
  async function moveTask(
    taskId: string,
    newColumnId: string,
    newOrder: number,
  ) {
    try {
      await taskServices.moveTask(supabase!, taskId, newColumnId, newOrder);

      setColumn((prev) => {
        const newColumns = [...prev];

        let taskToMove: Task | null = null;
        for (const col of newColumns) {
          const taskIndex = col.tasks.findIndex((task) => task.id === taskId);
          if (taskIndex !== -1) {
            taskToMove = col.tasks[taskIndex];
            col.tasks.splice(taskIndex, 1);
            break;
          }
        }

        if (taskToMove) {
          const targetColumn = newColumns.find((col) => col.id === newColumnId);
          if (targetColumn) {
            targetColumn.tasks.splice(newOrder, 0, taskToMove);
          }
        }

        return newColumns;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to move task.");
    }
  }

  async function createColumn(title: string) {
    if (!board || !user) throw new Error("Board not loaded");

    try {
      const newColumn = await columnServices.createColumn(supabase!, {
        title,
        board_id: board.id,
        sort_order: column.length,
        user_id: user.id,
      });

      setColumn((prev) => [...prev, { ...newColumn, tasks: [] }]);
      return newColumn;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create column.");
    }
  }

  async function updateColumn(columnId: string, title: string) {
    try {
      const updatedColumn = await columnServices.updateColumnTitle(
        supabase!,
        columnId,
        title,
      );

      setColumn((prev) =>
        prev.map((col) =>
          col.id === columnId ? { ...col, ...updatedColumn } : col,
        ),
      );

      return updatedColumn;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create column.");
    }
  }

  return {
    board,
    column,
    error,
    loading,
    updateBoard,
    createRealTask,
    moveTask,
    setColumn,
    updateColumn,
    createColumn,
  };
}
