import { useState } from "react";
import { ColumnWithTasks } from "../supabase/models";

export const columnFunctions = (
  createColumn: (title: string) => Promise<any>,
  updateColumn: (id: string, title: string) => Promise<any>,
  deleteColumn: (id: string) => Promise<any>
) => {
  const [isCreateColumn, setIsCreateColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [editingColumn, setEditingColumn] = useState<ColumnWithTasks | null>(null);
  const [editingColumnTitle, setEditingColumnTitle] = useState("");

  const handleCreateColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColumnTitle.trim()) return;
    try {
      await createColumn(newColumnTitle.trim());
      setNewColumnTitle("");
      setIsCreateColumn(false);
    } catch (err) {
      console.error("Column creation error:", err);
    }
  };

  const handleUpdateColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingColumnTitle.trim() || !editingColumn) return;
    try {
      await updateColumn(editingColumn.id, editingColumnTitle.trim());
      setEditingColumnTitle("");
      setEditingColumn(null);
    } catch (err) {
      console.error("Column update error:", err);
    }
  };

  const handleEditColumn = (column: ColumnWithTasks) => {
    setEditingColumn(column);
    setEditingColumnTitle(column.title);
  };

  const handleDeleteColumn = async () => {
    if (!editingColumn) return;
    try {
      await deleteColumn(editingColumn.id);
      setEditingColumn(null);
      setEditingColumnTitle("");
    } catch (err) {
      console.error("Column deletion error:", err);
    }
  };

  return {
    isCreateColumn,
    setIsCreateColumn,
    newColumnTitle,
    setNewColumnTitle,
    editingColumn,
    setEditingColumn,
    editingColumnTitle,
    setEditingColumnTitle,
    handleCreateColumn,
    handleUpdateColumn,
    handleEditColumn,
    handleDeleteColumn,
  };
};