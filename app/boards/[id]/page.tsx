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
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  rectIntersection,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function DroppableColumn({
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
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  return (
    <div ref={setNodeRef} className={`w-full lg:shrink-0 lg:w-80 `}>
      <div
        className={`bg-white rounded-lg shadow-sm border transition-all relative ${
          isOver
            ? "z-50  outline-3 outline-orange-400 -outline-offset-4 border-transparent"
            : "border-gray-200 z-0"
        }`}
      >
        <div className="p-3 sm:p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                {column.title}
              </h3>
              <Badge variant="secondary" className="text-xs shrink-0">
                {column.tasks.length}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0"
              onClick={() => onEditColumn?.(column)}
            >
              <MoreHorizontal />
            </Button>
          </div>
        </div>

        {}
        <div className="p-3">{children}</div>
      </div>
    </div>
  );
}

function SortableTask({ task }: { task: Task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });
  const styles = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
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
    <div ref={setNodeRef} {...listeners} {...attributes} style={styles}>
      <Card className="cursor-pointer hover:shadow-md transition-shadow">
        <CardContent className="p-3 sm:p-4">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-start justify-between">
              <h4 className="font-medium text-gray-900 text-sm leading-tight flex-1 min-w-0 pr-2">
                {task.title}
              </h4>
            </div>

            <p className="text-xs text-gray-600 line-clamp-2">
              {task.description || "No description."}
            </p>

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
                  task.priority || "medium",
                )}`}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const BoardPage = () => {
  const { id } = useParams<{ id: string }>();
  const {
    board,
    updateBoard,
    column,
    createRealTask,
    moveTask,
    setColumn,
    updateColumn,
    createColumn,
  } = useBoard(id);

  const [editTitle, setEditTitle] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newColor, setNewColor] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [isCreateColumn, setIsCreateColumn] = useState(false);
  const [editColumn, isEditColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [editingColumnTitle, setEditingColumnTitle] = useState("");
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [editingColumn, setEditingColumn] = useState<ColumnWithTasks | null>(
    null,
  );

  const [filterTask, setFilterTask] = useState({
    priority: [] as string[],
    assignee: [] as string[],
    dueDate: null as string | null,
  });

  function handleFilterChange(
    type: "priority" | "assignee" | "dueDate",
    value: string | string[] | null,
  ) {
    setFilterTask((prev) => ({
      ...prev,
      [type]: value,
    }));
  }

  function clearFilterTask() {
    setFilterTask({
      priority: [] as string[],
      assignee: [] as string[],
      dueDate: null as string | null,
    });
  }

  const filteredColumns = column.map((column) => ({
    ...column,
    tasks: column.tasks.filter((task) => {
      if (
        filterTask.priority.length > 0 &&
        (!task.priority || !filterTask.priority.includes(task.priority))
      ) {
        return false;
      }

      if (filterTask.dueDate && task.due_date) {
        const taskDate = new Date(task.due_date).toDateString();
        const filterDate = new Date(filterTask.dueDate).toDateString();

        if (taskDate !== filterDate) {
          return false;
        }
      }

      return true;
    }),
  }));
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

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

  async function handleColumnTaskCreate(e: React.FormEvent<HTMLFormElement>) {
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

  function handleDragStart(event: DragStartEvent) {
    const taskId = event.active.id as string;
    const task = column
      .flatMap((col) => col.tasks)
      .find((task) => task.id === taskId);

    if (task) {
      setActiveTask(task);
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const sourceColumn = column.find((col) =>
      col.tasks.some((task) => task.id === activeId),
    );

    const targetColumn = column.find((col) =>
      col.tasks.some((task) => task.id === overId),
    );

    if (!sourceColumn || !targetColumn) return;

    if (sourceColumn.id === targetColumn.id) {
      const activeIndex = sourceColumn.tasks.findIndex(
        (task) => task.id === activeId,
      );

      const overIndex = targetColumn.tasks.findIndex(
        (task) => task.id === overId,
      );

      if (activeIndex !== overIndex) {
        setColumn((prev: ColumnWithTasks[]) => {
          const newColumns = [...prev];
          const column = newColumns.find((col) => col.id === sourceColumn.id);
          if (column) {
            const tasks = [...column.tasks];
            const [removed] = tasks.splice(activeIndex, 1);
            tasks.splice(overIndex, 0, removed);
            column.tasks = tasks;
          }
          return newColumns;
        });
      }
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    const targetColumn = column.find((col) => col.id === overId);
    if (targetColumn) {
      const sourceColumn = column.find((col) =>
        col.tasks.some((task) => task.id === taskId),
      );

      if (sourceColumn && sourceColumn.id !== targetColumn.id) {
        await moveTask(taskId, targetColumn.id, targetColumn.tasks.length);
      }
    } else {
      const sourceColumn = column.find((col) =>
        col.tasks.some((task) => task.id === taskId),
      );

      const targetColumn = column.find((col) =>
        col.tasks.some((task) => task.id === overId),
      );

      if (sourceColumn && targetColumn) {
        const oldIndex = sourceColumn.tasks.findIndex(
          (task) => task.id === taskId,
        );

        const newIndex = targetColumn.tasks.findIndex(
          (task) => task.id === overId,
        );

        if (oldIndex !== newIndex) {
          await moveTask(taskId, targetColumn.id, newIndex);
        }
      }
    }
  }
  async function handleCreateColumn(e: React.FormEvent) {
    e.preventDefault();

    if (!newColumnTitle.trim()) return;

    await createColumn(newColumnTitle.trim());

    setNewColumnTitle("");
    setIsCreateColumn(false);
  }

  async function handleUpdateColumn(e: React.FormEvent) {
    e.preventDefault();

    if (!editingColumnTitle.trim() || !editingColumn) return;

    await updateColumn(editingColumn.id, editingColumnTitle.trim());

    setEditingColumnTitle("");
    isEditColumn(false);
    setEditingColumn(null);
  }

  function handleEditColumn(column: ColumnWithTasks) {
    isEditColumn(true);
    setEditingColumn(column);
    setEditingColumnTitle(column.title);
  }

  const activeFilterCount = [
    filterTask.priority.length > 0,
    filterTask.assignee.length > 0,
    filterTask.dueDate !== null,
  ].filter(Boolean).length;

  return (
    <>
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
          filterCount={activeFilterCount}
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
              <div className="flex justify-between space-x-2 mt-8">
                <Button
                  type="submit"
                  className="bg-red-700 cursor-pointer hover:bg-red-700"
                >
                  Delete Board
                </Button>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setEditTitle(false)}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="cursor-pointer">
                    Save Changes
                  </Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
          <DialogContent className="w-[95vw] max-w-106.25 mx-auto">
            <DialogHeader>
              <DialogTitle>Filter Tasks</DialogTitle>
              <p className="text-sm text-gray-600">
                Filter tasks by priority, assignee, or due date
              </p>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <div className="flex flex-wrap gap-2">
                  {["low", "medium", "high"].map((priority, key) => (
                    <Button
                      onClick={() => {
                        const newPriorities = filterTask.priority.includes(
                          priority,
                        )
                          ? filterTask.priority.filter((p) => p !== priority)
                          : [...filterTask.priority, priority];

                        handleFilterChange("priority", newPriorities);
                      }}
                      key={key}
                      variant={
                        filterTask.priority.includes(priority)
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={filterTask.dueDate || ""}
                  onChange={(e) =>
                    handleFilterChange("dueDate", e.target.value || null)
                  }
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant={"outline"}
                  onClick={clearFilterTask}
                >
                  Clear Filters
                </Button>
                <Button type="button" onClick={() => setFilterOpen(false)}>
                  Apply Filters
                </Button>
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
                  <p className="text-sm text-gray-600">
                    Add a task to the board
                  </p>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleColumnTaskCreate}>
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
                            {priority.charAt(0).toUpperCase() +
                              priority.slice(1)}
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

          <DndContext
            sensors={sensors}
            collisionDetection={rectIntersection}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragMove={handleDragOver}
          >
            <div
              className="flex flex-col lg:flex-row lg:space-x-6 lg:overflow-x-auto 
            lg:pb-6 lg:px-2 lg:-mx-2 lg:[&::-webkit-scrollbar]:h-2 
            lg:[&::-webkit-scrollbar-track]:bg-gray-100 
            lg:[&::-webkit-scrollbar-thumb]:bg-gray-300 lg:[&::-webkit-scrollbar-thumb]:rounded-full 
            space-y-4 lg:space-y-0"
            >
              {filteredColumns.map((col, key) => (
                <DroppableColumn
                  key={key}
                  column={col}
                  onCreateTask={handleColumnTaskCreate}
                  onEditColumn={handleEditColumn}
                >
                  <SortableContext
                    items={col.tasks.map((task) => task.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3">
                      {col.tasks.map((task, key) => (
                        <SortableTask task={task} key={key} />
                      ))}
                    </div>
                  </SortableContext>
                </DroppableColumn>
              ))}
              <div className="w-full lg:shrink-0 lg:w-80">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateColumn(true)}
                  className="w-full h-30 border-dashed border-2 text-gray-500 hover:text-gray-700"
                >
                  <Plus />
                  Add another list
                </Button>
              </div>
            </div>
          </DndContext>
        </main>
      </div>
      <Dialog open={isCreateColumn} onOpenChange={setIsCreateColumn}>
        <DialogContent
          className="w-[95vw] max-w-106.25 mx-auto"
          showCloseButton={false}
        >
          <DialogHeader>
            <DialogTitle>Create New Column</DialogTitle>
            <p className="text-sm text-gray-600">
              Add new column to organuze your tasks
            </p>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleCreateColumn}>
            <div className="space-y-2">
              <Label>Column Title</Label>
              <Input
                id="columnTitle"
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                className="focus-visible:outline-none focus-visible:ring-0"
                placeholder="Enter column title..."
              />
            </div>
            <div className="space-y-2  flex justify-end gap-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <Button type="submit">Create Column</Button>
              </DialogClose>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!editingColumn}
        onOpenChange={(open) => {
          if (!open) setEditingColumn(null);
        }}
      >
        <DialogContent className="w-[95vw] max-w-106.25 mx-auto">
          <DialogHeader>
            <DialogTitle>Edit Column</DialogTitle>
            <p className="text-sm text-gray-600">
              Update the title of your column
            </p>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleUpdateColumn}>
            <div className="space-y-2">
              <Label>Column Title</Label>
              <Input
                id="columnTitle"
                value={editingColumnTitle}
                onChange={(e) => setEditingColumnTitle(e.target.value)}
                placeholder="Enter column title..."
                required
              />
            </div>
            <div className="space-x-2 flex justify-end">
              <Button
                type="submit"
                className="bg-red-700 cursor-pointer hover:bg-red-700"
              >
                Delete Column
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setEditingColumn(null);
                  setEditingColumnTitle("");
                  setEditingColumn(null);
                }}
                variant="outline"
              >
                Cancel
              </Button>
              <div>
                <Button type="submit">Edit Column</Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BoardPage;
