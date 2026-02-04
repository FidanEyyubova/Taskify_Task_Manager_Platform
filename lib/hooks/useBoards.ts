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
import { useRouter } from "next/navigation";

export function useBoards() {
  const { user } = useUser();
  const { supabase } = useSupabase();
  const route = useRouter();
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
  async function deleteBoard(boardId: string) {
    setBoards((prev) => prev.filter((b) => b.id !== boardId));

    const error = await boardServices.deleteBoards(supabase!, boardId);
    route.replace("/dashboard");
    if (error) {
      loadBoards();
      throw error;
    }
  }

  return { createBoard, loading, error, boards, setBoards, deleteBoard };
}

export function useBoard(boardId: string) {
  const { user } = useUser();
  const { supabase } = useSupabase();
  const route = useRouter();
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
  async function deleteColumn(columnId: string) {
    const previousColumns = [...column];

    setColumn((prev) => prev.filter((b) => b.id !== columnId));

    try {
      await columnServices.deleteColumns(supabase!, columnId);
    } catch (error: any) {
      setColumn(previousColumns);
      alert("Sütunu silmək mümkün olmadı. Xəta: " + error.message);
      throw error;
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


  async function updateTask(taskId: string, updates: Partial<Task>) {
  const previousColumns = [...column];

  // 1. Optimistic update - İstifadəçi dərhal dəyişikliyi görsün
  setColumn((prev) =>
    prev.map((col) => ({
      ...col,
      tasks: col.tasks.map((t) =>
        t.id === taskId ? { ...t, ...updates } : t
      ),
    }))
  );

  try {
    const updatedTask = await taskServices.updateTask(supabase!, taskId, updates);
    
    // 2. loadBoard() çağırmaq əvəzinə, sadəcə state-i gələn real data ilə tamamlamaq kifayətdir.
    // Əgər loadBoard() çağırırsınızsa, aşağıdakı setColumn-a ehtiyac yoxdur.
    // Amma ən yaxşısı budur:
    return updatedTask;
  } catch (err) {
    // Xəta olarsa, dərhal əvvəlki vəziyyətə qaytar
    setColumn(previousColumns);
    throw err;
  }
}



  async function deleteTask(taskId: string) {
    const previousColumns = [...column];

    setColumn((prev) =>
      prev.map((col) => ({
        ...col,
        tasks: col.tasks.filter((task) => task.id !== taskId),
      })),
    );

    try {
      await taskServices.deleteTask(supabase!, taskId);
    } catch (err) {
      setColumn(previousColumns);
      setError(err instanceof Error ? err.message : "Failed to delete task.");
      throw err;
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
    deleteColumn,
    updateTask,
    deleteTask,
  };
}
