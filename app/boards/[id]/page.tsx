"use client";

import Navbar from "@/components/navbar";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useBoard } from "@/lib/hooks/useBoards";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { Plus } from "lucide-react";

import { useParams } from "next/navigation";
import React, { useState } from "react";

const BoardPage = () => {
  const { id } = useParams<{ id: string }>();
  const { board, updateBoard,column } = useBoard(id);

  const [editTitle, setEditTitle] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newColor, setNewColor] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

  async function handleUpdateBoard(e: React.FormEvent) {
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
                    className={`w-8 h-8 rounded-full border transition hover:scale-110 cursor-pointer
        ${color === newColor ? "ring-2 ring-offset-2 ring-gray-900" : ""}
      `}
                    onClick={() => setNewColor(color)}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-8">
              <Button
                className="cursor-pointer"
                type="button"
                variant="outline"
                onClick={() => setEditTitle(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="cursor-pointer">
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>









      <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
        <DialogContent
          showCloseButton={false}
          className="w-[95vw] max-w-106.25 mx-auto"
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
            {/* <div className="space-y-2">
              <Label>Assignee</Label>
              <div className="flex flex-wrap gap-2">
                {["low", "medium", "high"].map((priority, key) => (
                  <Button key={key} variant="outline" size="sm">
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </Button>
                ))}
              </div>
            </div> */}
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input type="date" />
            </div>
            <div className="flex justify-between pt-4">
              <Button>Clear</Button>
              <div>
                <Button
                  className="cursor-pointer"
                  type="button"
                  variant="outline"
                  onClick={() => setFilterOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="cursor-pointer">Apply</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>









      {/* Board Content */}
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:psace-y-0 mb-6">
          <div className="flex flex-wrap ietms-center gap-4 sm:gap-6">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Total tasks: </span>
              {column.reduce((sum,col) => sum + col.tasks.length, 0)}
            </div>
          </div>
          {/* Add task dialog */}
          <Dialog>
            <DialogTrigger>
              <Button className="w-full sm:w-auto">
                <Plus/>
                Add task
              </Button>
            </DialogTrigger>
            <DialogContent
          showCloseButton={false}
          className="w-[95vw] max-w-106.25 mx-auto"
        >
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <p className="text-sm text-gray-600">
              Add a task to the board
            </p>
          </DialogHeader>
         <form className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input id="title"
            name="title"
            placeholder="Enter task title"
            className="focus-visible:outline-none focus-visible:ring-0"
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea id="decsription"
            name="decsription"
            placeholder="Enter task decsription"
            rows={3}
            className="focus-visible:outline-none focus-visible:ring-0"
            />
          </div>
          <div className="space-y-2">
            <Label>Assignee</Label>
            <Input id="assignee"
            name="assignee"
            placeholder="Who should do this?"
            className="focus-visible:outline-none focus-visible:ring-0"
            />
          </div>
           <div className="space-y-2">
            <Label>Priority</Label>
            <Select name="priority" defaultValue="medium">
              <SelectTrigger>
                <SelectValue/>
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
            <Input type="date" id="dueDate" name="dueDate"
            className="focus-visible:outline-none focus-visible:ring-0"
            />
          </div>
          <div className="flex justify-between items-center mt-5">
             <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
            <Button type="submit">Create Task</Button>
          </div>
         </form>
        </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
};

export default BoardPage;
