import { useState } from "react";
import { ColumnWithTasks, Task } from "../supabase/models";

export const taskFunctions = (
  columns: ColumnWithTasks[],
  createRealTask: (columnId: string, data: any) => Promise<any>,
  updateTask: (id: string, data: any) => Promise<any>,
  deleteTask: (id: string) => Promise<any>,
) => {
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const createTask = async (taskData: any) => {
    const targetColumn = columns[0];
    if (!targetColumn) throw new Error("No column available");
    await createRealTask(targetColumn.id, taskData);
  };

  const handleColumnTaskCreate = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const taskData = {
      title: (formData.get("title") as string)?.trim() || "",
      description: (formData.get("description") as string) || undefined,
      assignee: (formData.get("assignee") as string) || undefined,
      dueDate: (formData.get("dueDate") as string) || undefined,
      priority:
        (formData.get("priority") as "low" | "medium" | "high") || "medium",
    };

    if (!taskData.title) return;

    try {
      await createTask(taskData);
      e.currentTarget.reset();
    } catch (err) {
      console.error("Error creating task:", err);
    }
  };

  const handleUpdateTask = async (task: Task) => {
    if (!task) return;
    try {
      await updateTask(task.id, {
        title: task.title,
        description: task.description ?? null,
        priority: task.priority,
        due_date: task.due_date ?? null,
      });
      setTaskDialogOpen(false);
      setEditingTask(null);
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  return {
    taskDialogOpen,
    setTaskDialogOpen,
    editingTask,
    setEditingTask,
    handleColumnTaskCreate,
    handleUpdateTask,
  };
};
