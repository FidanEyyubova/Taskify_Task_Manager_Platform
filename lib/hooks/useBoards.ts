"use client";

import { useUser } from "@clerk/nextjs";
import { boardDataServices, boardServices } from "../services";
import { useEffect, useState } from "react";
import { Board } from "../supabase/models";
import { useSupabase } from "../supabase/SupabaseProvider";

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
