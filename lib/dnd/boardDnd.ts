import {
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { ColumnWithTasks, Task } from "@/lib/supabase/models";

type UseBoardDndProps = {
  columns: ColumnWithTasks[];
  setColumns: React.Dispatch<React.SetStateAction<ColumnWithTasks[]>>;
  moveTask: (
    taskId: string,
    columnId: string,
    position: number,
  ) => Promise<void>;
  setActiveTask: React.Dispatch<React.SetStateAction<Task | null>>;
};

export function useBoardDnd({
  columns,
  setColumns,
  moveTask,
  setActiveTask,
}: UseBoardDndProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  function handleDragStart(event: DragStartEvent) {
    const taskId = event.active.id as string;

    const task = columns
      .flatMap((col) => col.tasks)
      .find((t) => t.id === taskId);

    if (task) {
      setActiveTask(task);
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const sourceColumn = columns.find((col) =>
      col.tasks.some((task) => task.id === activeId),
    );

    const targetColumn = columns.find((col) =>
      col.tasks.some((task) => task.id === overId),
    );

    if (!sourceColumn || !targetColumn) return;

    if (sourceColumn.id !== targetColumn.id) return;

    const activeIndex = sourceColumn.tasks.findIndex(
      (task) => task.id === activeId,
    );
    const overIndex = targetColumn.tasks.findIndex(
      (task) => task.id === overId,
    );

    if (activeIndex === overIndex) return;

    setColumns((prev) => {
      const newColumns = structuredClone(prev);
      const column = newColumns.find((c) => c.id === sourceColumn.id);

      if (!column) return prev;

      const [moved] = column.tasks.splice(activeIndex, 1);
      column.tasks.splice(overIndex, 0, moved);

      return newColumns;
    });
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    const sourceColumn = columns.find((col) =>
      col.tasks.some((task) => task.id === taskId),
    );

    if (!sourceColumn) return;

    const targetColumn =
      columns.find((col) => col.id === overId) ||
      columns.find((col) => col.tasks.some((task) => task.id === overId));

    if (!targetColumn) return;

    const newIndex = targetColumn.tasks.findIndex((task) => task.id === overId);

    if (sourceColumn.id !== targetColumn.id) {
      await moveTask(taskId, targetColumn.id, targetColumn.tasks.length);
    } else {
      await moveTask(taskId, targetColumn.id, newIndex);
    }
  }

  return {
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
}
