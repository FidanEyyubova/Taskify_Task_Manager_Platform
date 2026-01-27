import { createClient } from "@/lib/supabase/client";
import { SupabaseClient } from "@supabase/supabase-js";
import { Board, Column } from "./supabase/models";

const supabase = createClient();

//BOARD SERVICES
export const boardServices = {
  async getBoards(supabase: SupabaseClient, userId: string): Promise<Board[]> {
    const { data, error } = await supabase
      .from("boards")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data || [];
  },
  async createBoards(
    supabase: SupabaseClient,
    board: Omit<Board, "id" | "created_at" | "updated_at">,
  ): Promise<Board> {
    const { data, error } = await supabase
      .from("boards")
      .insert(board)
      .select()
      .single();
    if (error) throw error;

    return data;
  },
};

//COLUMN SERVICE
export const columnServices = {
  async createColumn(
    supabase: SupabaseClient,
    column: Omit<Column, "id" | "created_at">,
  ): Promise<Column> {
    const { data, error } = await supabase
      .from("columns")
      .insert(column)
      .select()
      .single();
    if (error) throw error;

    return data;
  },
};

//BOARD WITH DEFAULT COLUMNS
export const boardDataServices = {
  async createBoardWithDefaultColumns(boardData: {
    title: string;
    description?: string;
    color?: string;
    userId: string;
  }) {
    const board = await boardServices.createBoards(supabase, {
      title: boardData.title,
      description: boardData.description || null,
      color: boardData.color || "#FFA239",
      user_id: boardData.userId,
    });

    const defaultColumns = [
      { title: "To Do", sort_order: 0 },
      { title: "In Progress", sort_order: 1 },
      { title: "Salam", sort_order: 2 },
      { title: "Sagol", sort_order: 3 },
    ];
    await Promise.all(
      defaultColumns.map((column) =>
        columnServices.createColumn(supabase, {
          ...column,
          board_id: board.id,
        }),
      ),
    );
    return board;
  },
};
