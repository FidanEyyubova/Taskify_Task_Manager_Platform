export interface Board{
    id : string;
    created_at : string;
    title : string;
    description: string | null;
    color : string;
    user_id : string;
    updated_at : string;
}

export interface Column{
    id : string;
    created_at : string;
    board_id : string;
    title : string;
    sort_order : number;
    user_id : string;
}

export interface Task {
    id : string;
    created_at : string;
    updated_at : string;
    title : string;
    description: string | null;
    assignee : string | null;
    due_date : string | null;
    priority : "low" | "medium" | "high";
    sort_order : number;
    column_id : string;
}