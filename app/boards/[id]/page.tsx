"use client";

import Navbar from "@/components/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useBoard } from "@/lib/hooks/useBoards";
import { ColumnWithTasks, Task } from "@/lib/supabase/models";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { Calendar, MoreHorizontal, Plus } from "lucide-react";

import { useParams } from "next/navigation";
import React, { useState } from "react";

function Column({
  column,
  children,
  onCreateTask,
  onEditColumn,
}: {
  column: ColumnWithTasks;
  children?: React.ReactNode;
  onCreateTask?: (taskData: any) => Promise<void>;
  onEditColumn?: (column: ColumnWithTasks) => void;
}) {
  return (
    <div className="w-full lg:shrink-0 lg:w-80">
      <div className="bg-white rounded-lg shadow-sm border flex flex-col min-h-37.5">
        <div className="p-3 sm:p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                {column.title}
              </h3>
              <Badge variant="secondary" className="text-xs shrink-0">
                {column.tasks.length}
              </Badge>
            </div>
            <Button variant="ghost" size="sm" className="shrink-0" onClick={() => onEditColumn?.(column)}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-2 space-y-2 flex-1 overflow-y-auto">
          {children}
        </div>

        <div className="p-2 border-t mt-auto">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" className="w-full flex items-center justify-center gap-2 text-gray-600 hover:bg-gray-50">
                <Plus className="h-4 w-4" />
                Add task
              </Button>
            </DialogTrigger>
            <DialogContent
              className="w-[95vw] max-w-106.25 mx-auto"
              showCloseButton={false}
            >
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <p className="text-sm text-gray-600">Add a task to the board</p>
              </DialogHeader>
              <form 
                className="space-y-4" 
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const taskData = {
                    title: formData.get("title") as string,
                    description: formData.get("description") as string,
                    assignee: formData.get("assignee") as string,
                    priority: formData.get("priority") as string,
                    dueDate: formData.get("dueDate") as string,
                  };
                  await onCreateTask?.(taskData);
                }}
              >
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input id="title" name="title" placeholder="Enter task title" required />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea id="description" name="description" placeholder="Enter task description" rows={3} />
                </div>
                <div className="space-y-2">
                  <Label>Assignee</Label>
                  <Input id="assignee" name="assignee" placeholder="Who should do this?" />
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select name="priority" defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["low", "medium", "high"].map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input type="date" id="dueDate" name="dueDate" />
                </div>
                <div className="flex justify-between items-center mt-5">
                  <DialogClose asChild>
                    <Button variant="outline" type="button">Cancel</Button>
                  </DialogClose>
                    <DialogClose asChild>
                    <Button type="submit">Create Task</Button>
                  </DialogClose>
                  
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}

function TaskOverlay({ task }: { task: Task }) {
  function getPriorityColor(priority: "low" | "medium" | "high"): string {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-yellow-500";
    }
  }
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardContent className="p-3 sm:p-4">
        <div className="space-y-2 sm:space-y-3">
          {/* Task Header */}
          <div className="flex items-start justify-between">
            <h4 className="font-medium text-gray-900 text-sm leading-tight flex-1 min-w-0 pr-2">
              {task.title}
            </h4>
          </div>

          {/* Task Description */}
          <p className="text-xs text-gray-600 line-clamp-2">
            {task.description || "No description."}
          </p>

          {/* Task Meta */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
             
              {task.due_date && (
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  <span className="truncate">{task.due_date}</span>
                </div>
              )}
            </div>
            <div
  className={`w-2 h-2 rounded-full shrink-0 ${getPriorityColor(
    task.priority || "medium"
  )}`}
/>

          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const BoardPage = () => {
  const { id } = useParams<{ id: string }>();
  const { board, updateBoard, column, createRealTask } = useBoard(id);
  const [editTitle, setEditTitle] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newColor, setNewColor] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

  async function handleUpdateBoard(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!board) return;

    try {
      await updateBoard(board.id, {
        title: newTitle.trim() || board.title,
        color: newColor || board.color,
      });
      setEditTitle(false);
    } catch (error) {
      console.error(error);
    }
  }

  async function createTask(taskData: {
    title: string;
    description?: string;
    assignee?: string;
    dueDate?: string;
    priority: "low" | "medium" | "high";
  }) {
    const targetColumn = column[0];
    if (!targetColumn) throw new Error("No column available");

    await createRealTask(targetColumn.id, taskData);
  }

  async function handleCreateTask(e: React.FormEvent<HTMLFormElement>) {
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
  }

  return (
    <div>
      <Navbar
        boardTitle={board?.title}
        boardColor={board?.color}
        onEditBoard={() => {
          setNewTitle(board?.title ?? "");
          setNewColor(board?.color ?? "");
          setEditTitle(true);
        }}
        onFilterClick={() => setFilterOpen(true)}
        filterCount={0}
      />

      <Dialog open={editTitle} onOpenChange={setEditTitle}>
        <DialogContent
          className="w-[95vw] max-w-106.25 mx-auto"
          showCloseButton={false}
        >
          <DialogHeader>
            <DialogTitle className="text-lg">Edit Board</DialogTitle>
          </DialogHeader>
          <form className="space-y-6" onSubmit={handleUpdateBoard}>
            <div className="space-y-4">
              <Label className="text-md">Board Title</Label>
              <Input
                id="boardTitle"
                placeholder="Enter board title..."
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="focus-visible:outline-none focus-visible:ring-0"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-md">Board Color</Label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 place-items-center">
                {[
                  "#C3110C",
                  "#BBCB2E",
                  "#56DFCF",
                  "#F075AE",
                  "#B153D7",
                  "#FFA239",
                  "#FBE580",
                  "#0046FF",
                  "#FFCDC9",
                  "#5D2F77",
                  "#73C8D2",
                  "#ABE7B2",
                ].map((color) => (
                  <button
                    key={color}
                    type="button"
                    style={{ backgroundColor: color }}
                    className={`w-8 h-8 rounded-full border transition hover:scale-110 cursor-pointer ${
                      color === newColor
                        ? "ring-2 ring-offset-2 ring-gray-900"
                        : ""
                    }`}
                    onClick={() => setNewColor(color)}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-8">
              <Button
                variant="outline"
                type="button"
                onClick={() => setEditTitle(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
        <DialogContent
          className="w-[95vw] max-w-106.25 mx-auto"
          showCloseButton={false}
        >
          <DialogHeader>
            <DialogTitle>Filter Tasks</DialogTitle>
            <p className="text-sm text-gray-600">
              Filter tasks by priority, assignee, or due date
            </p>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Priority filtering</Label>
              <div className="flex flex-wrap gap-2">
                {["low", "medium", "high"].map((priority, key) => (
                  <Button key={key} variant="outline" size="sm">
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input type="date" />
            </div>
            <div className="flex justify-between pt-4">
              <Button>Clear</Button>
              <div>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setFilterOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Apply</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-6">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Total tasks: </span>
              {column.reduce((sum, col) => sum + col.tasks.length, 0)}
            </div>
          </div>

          <Dialog>
            <DialogTrigger>
              <Button className="w-full sm:w-auto flex items-center gap-2">
                <Plus />
                Add task
              </Button>
            </DialogTrigger>
            <DialogContent
              className="w-[95vw] max-w-106.25 mx-auto"
              showCloseButton={false}
            >
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <p className="text-sm text-gray-600">Add a task to the board</p>
              </DialogHeader>
              <form className="space-y-4" onSubmit={handleCreateTask}>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Enter task title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Enter task description"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Assignee</Label>
                  <Input
                    id="assignee"
                    name="assignee"
                    placeholder="Who should do this?"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select name="priority" defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["low", "medium", "high"].map((priority, key) => (
                        <SelectItem key={key} value={priority}>
                          {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input type="date" id="dueDate" name="dueDate" />
                </div>
                <div className="flex justify-between items-center mt-5">
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button type="submit">Create Task</Button>
                  </DialogClose>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col lg:flex-row lg:space-x-6 lg:overflow-x-auto 
            lg:pb-6 lg:px-2 lg:-mx-2 lg:[&::-webkit-scrollbar]:h-2 
            lg:[&::-webkit-scrollbar-track]:bg-gray-100 
            lg:[&::-webkit-scrollbar-thumb]:bg-gray-300 lg:[&::-webkit-scrollbar-thumb]:rounded-full 
            space-y-4 lg:space-y-0">
          {column.map((col, key) => (
            <Column
  key={key}
  column={col}
  onCreateTask={createTask}
  onEditColumn={() => {}}
>
  <div className="space-y-2">
    {col.tasks.map((task, tKey) => (
      <TaskOverlay key={tKey} task={task} />
    ))}
  </div>
</Column>

          ))}
        </div>
      </main>
    </div>
  );
};

export default BoardPage;
