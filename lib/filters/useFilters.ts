"use client";
import { useMemo, useState } from "react";
import { ColumnWithTasks } from "../supabase/models";

export const useFilters = (columns: ColumnWithTasks[]) => {
  const [filterTask, setFilterTask] = useState({
    priority: [] as string[],
    assignee: [] as string[],
    dueDate: null as string | null,
  });

  const [filterOpen, setFilterOpen] = useState(false);

  const handleFilterChange = (
    type: "priority" | "assignee" | "dueDate",
    value: string | string[] | null,
  ) => {
    setFilterTask((prev) => ({ ...prev, [type]: value }));
  };

  const clearFilterTask = () => {
    setFilterTask({
      priority: [],
      assignee: [],
      dueDate: null,
    });
  };

  const filteredColumns = useMemo(() => {
    return columns.map((column) => ({
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
          if (taskDate !== filterDate) return false;
        }

        return true;
      }),
    }));
  }, [columns, filterTask]);

  const activeFilterCount = [
    filterTask.priority.length > 0,
    filterTask.assignee.length > 0,
    filterTask.dueDate !== null,
  ].filter(Boolean).length;

  return {
    filterTask,
    filterOpen,
    setFilterOpen,
    filteredColumns,
    handleFilterChange,
    clearFilterTask,
    activeFilterCount,
  };
};





export const useDashboardFilters = (boards: any[]) => {
  const [isFilterOpenBoard, setIsFilterOpenBoard] = useState<boolean>(false);
  const [filters, setFilters] = useState({
    search: "",
    dateRange: {
      start: null as string | null,
      end: null as string | null,
    },
  });

  const filteredBoards = useMemo(() => {
    return boards.filter((board) => {
      const matchesSearch = board.title
        .toLowerCase()
        .includes(filters.search.toLowerCase());

      const matchesDateRange =
        (!filters.dateRange.start ||
          new Date(board.created_at) >= new Date(filters.dateRange.start)) &&
        (!filters.dateRange.end ||
          new Date(board.created_at) <= new Date(filters.dateRange.end));

      return matchesSearch && matchesDateRange;
    });
  }, [boards, filters]);

  const clearFiltersBoard = () => {
    setFilters({
      search: "",
      dateRange: { start: null, end: null },
    });
  };

  const activeFilterCountBoard = [
    filters.search !== "",
    filters.dateRange.start !== null,
    filters.dateRange.end !== null,
  ].filter(Boolean).length;

  return {
    filters,
    setFilters,
    isFilterOpenBoard,
    setIsFilterOpenBoard,
    filteredBoards,
    clearFiltersBoard,
    activeFilterCountBoard,
  };
};
