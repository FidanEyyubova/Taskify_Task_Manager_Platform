"use client";

import { useUser } from "@clerk/nextjs";
import { boardDataServices } from "../services";
import { useState } from "react";
import { Board } from "../supabase/models";

export function useBoards() {
  const { user } = useUser();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  async function createBoard(boardData: {
    title: string;
    description?: string;
    color?: string;
  }) {
    if (!user) throw new Error("User not authenticated");
    try {
      const newBoard = await boardDataServices.createBoardWithDefaultColumns({
        ...boardData,
        userId: user.id,
      });
      setBoards((prev) => [newBoard, ...prev]);
    } catch (errormessage) {
      setError(
        errormessage instanceof Error
          ? errormessage.message
          : "Failed to create board!",
      );
    }
  }
  return { createBoard, loading, error, boards };
}
