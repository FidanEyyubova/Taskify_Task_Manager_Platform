"use client";

import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBoard} from "@/lib/hooks/useBoards";

import { useParams } from "next/navigation";
import React, { useState } from "react";

const BoardPage = () => {
  const { id } = useParams<{ id: string }>();
  const { board, updateBoard } = useBoard(id);

  const [editTitle, setEditTitle] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newColor, setNewColor] = useState("");

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
    </div>
  );
};

export default BoardPage;
