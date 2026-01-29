"use client";

import Navbar from "@/components/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { ColumnWithTasks } from "@/lib/supabase/models";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { MoreHorizontal, Plus } from "lucide-react";

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
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-3 sm:p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{column.title}</h3>
              <Badge variant="secondary" className="text-xs shrink-0">
                {column.tasks.length}
              </Badge>
            </div>
            <Button variant="ghost" size="sm" className="shrink-0">
              <MoreHorizontal />
            </Button>
          </div>
        </div>
        {/* col content */}
        <div className="p-2">{children}</div>
      </div>
    </div>
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
      priority: (formData.get("priority") as "low" | "medium" | "high") || "medium",
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
        <DialogContent className="w-[95vw] max-w-106.25 mx-auto" showCloseButton={false}>
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
                      color === newColor ? "ring-2 ring-offset-2 ring-gray-900" : ""
                    }`}
                    onClick={() => setNewColor(color)}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-8">
              <Button variant="outline" type="button" onClick={() => setEditTitle(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
        <DialogContent className="w-[95vw] max-w-106.25 mx-auto" showCloseButton={false}>
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
                <Button variant="outline" type="button" onClick={() => setFilterOpen(false)}>
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
            <DialogContent className="w-[95vw] max-w-106.25 mx-auto" showCloseButton={false}>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <p className="text-sm text-gray-600">Add a task to the board</p>
              </DialogHeader>
              <form className="space-y-4" onSubmit={handleCreateTask}>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input id="title" name="title" placeholder="Enter task title" required />
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
                  <Input id="assignee" name="assignee" placeholder="Who should do this?" />
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

        <div className="flex flex-wrap gap-4">
          {column.map((col, key) => (
            <Column key={key} column={col}>
              {col.tasks.map((task, tKey) => (
                <div key={tKey} className="p-2 bg-gray-50 rounded mb-2">
                  {task.title}
                </div>
              ))}
            </Column>
          ))}
        </div>
      </main>
    </div>
  );
};

export default BoardPage;
