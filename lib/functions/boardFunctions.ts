import { useState, useEffect, useMemo } from "react";
import AOS from "aos";
import { useUser } from "@clerk/nextjs";
import { useBoard, useBoards } from "../hooks/useBoards";
import { useDashboardFilters } from "../filters/useFilters";
import { useParams } from "next/navigation";

export interface DashboardFilters {
  search: string;
  dateRange: {
    start: string | null;
    end: string | null;
  };
}

export const boardFunctions = () => {
  const { user } = useUser();
  const { id } = useParams<{ id: string }>();
  const { createBoard, boards, loading, error } = useBoards();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { board, updateBoard } = useBoard(id!);
  const { deleteBoard } = useBoards();
  const [editTitle, setEditTitle] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newColor, setNewColor] = useState("");

  const {
    setFilters,
    isFilterOpenBoard,
    setIsFilterOpenBoard,
    filteredBoards,
    clearFiltersBoard,
    activeFilterCountBoard,
  } = useDashboardFilters(boards);

  const openEditDialog = () => {
    if (board) {
      setNewTitle(board.title);
      setNewColor(board.color);
      setEditTitle(true);
    }
  };

  const handleUpdateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!board) return;

    try {
      await updateBoard(board.id, {
        title: newTitle.trim() || board.title,
        color: newColor || board.color,
      });
      setEditTitle(false);
    } catch (error) {
      console.error("Board yenilənərkən xəta:", error);
    }
  };

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  const handleCreateBoard = async () => {
    await createBoard({ title: "New Board" });
  };

  const totalTasksCount = useMemo(() => {
    return boards.reduce((acc, board) => {
      const boardTasksCount =
        board.columns?.reduce(
          (sum, col) => sum + (col.tasks?.length || 0),
          0,
        ) || 0;
      return acc + boardTasksCount;
    }, 0);
  }, [boards]);

  const recentActivityCount = useMemo(() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    return boards.filter((board) => {
      const updatedAt = new Date(board.updated_at);
      return updatedAt > oneWeekAgo;
    }).length;
  }, [boards]);

  return {
    user,
    loading,
    error,
    viewMode,
    setViewMode,
    boards,
    filteredBoards,
    totalTasksCount,
    recentActivityCount,
    setFilters,
    isFilterOpenBoard,
    setIsFilterOpenBoard,
    clearFiltersBoard,
    activeFilterCountBoard,
    handleCreateBoard,
    board,
    editTitle,
    setEditTitle,
    newTitle,
    setNewTitle,
    newColor,
    setNewColor,
    handleUpdateBoard,
  };
};
