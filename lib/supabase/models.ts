export interface Board {
  id: string;
  created_at: string;
  title: string;
  description: string | null;
  color: string;
  user_id: string;
  updated_at: string;
}

export interface Column {
  id: string;
  title: string;
  board_id: string;
  sort_order: number;
  user_id: string;
  created_at?: string;
}

export interface Task {
  id: string;
  title: string;
  column_id: string;
  description?: string;
  sort_order: number;
  created_at?: string;
  due_date?: string;     
  priority?: "low" | "medium" | "high";
}

export type ColumnWithTasks = Column & {
  tasks: Task[];
};

