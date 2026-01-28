import { SupabaseClient } from "@supabase/supabase-js";
import { Board, Column, Task } from "./supabase/models";

//BOARD SERVICES
export const boardServices = {
  async getBoard(supabase: SupabaseClient, boardId: string): Promise<Board> {
    const { data, error } = await supabase
      .from("boards")
      .select("*")
      .eq("id", boardId)
      .single();

    if (error) throw error;

    return data;
  },
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
  async updateBoard(
    supabase: SupabaseClient,
    boardId: string,
    updates: Partial<Board>,
  ): Promise<Board> {
    const { data, error } = await supabase
      .from("boards")
      .update({ ...updates, updated_at: new Date().toLocaleDateString() })
      .eq("id", boardId)
      .select()
      .single();
    if (error) throw error;

    return data;
  },
};

//COLUMN SERVICE
export const columnServices = {
  async getColumns(
    supabase: SupabaseClient,
    boardId: string,
  ): Promise<Column[]> {
    const { data, error } = await supabase
      .from("columns")
      .select("*")
      .eq("board_id", boardId)
      .order("sort_order", { ascending: false });

    if (error) throw error;

    return data || [];
  },

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

export const taskServices = {
  async getTaskByBoard(
    supabase: SupabaseClient,
    boardId: string,
  ): Promise<Task[]> {
    const { data, error } = await supabase
      .from("tasks")
      .select(`*,columns!inner(board_id)`)
      .eq("columns.board_id", boardId)
      .order("sort_order", { ascending: false });

    if (error) throw error;

    return data || [];
  },

  // async createColumn(
  //   supabase: SupabaseClient,
  //   column: Omit<Column, "id" | "created_at">,
  // ): Promise<Column> {
  //   const { data, error } = await supabase
  //     .from("columns")
  //     .insert(column)
  //     .select()
  //     .single();
  //   if (error) throw error;

  //   return data;
  // },
};

//BOARD WITH DEFAULT COLUMNS
export const boardDataServices = {
  async getBoardWithColumns(supabase: SupabaseClient, boardId: string) {
    const [board, column] = await Promise.all([
      boardServices.getBoard(supabase, boardId),
      columnServices.getColumns(supabase, boardId),
    ]);
    if (!board) throw new Error("Board not found");
    const tasks = await taskServices.getTaskByBoard(supabase, boardId);
    const columnsWithTasks = column.map((column) => ({
      ...column,
      tasks: tasks.filter((task) => task.column_id === column.id),
    }));
    return {
      board,
      columnsWithTasks,
    };
  },

  async createBoardWithDefaultColumns(
    supabase: SupabaseClient,
    boardData: {
      title: string;
      description?: string;
      color?: string;
      userId: string;
    },
  ) {
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
          user_id: boardData.userId,
        }),
      ),
    );
    return board;
  },
};
