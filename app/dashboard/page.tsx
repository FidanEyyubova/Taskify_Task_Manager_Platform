"use client";
import Navbar from "@/components/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useBoards } from "@/lib/hooks/useBoards";
import { Board } from "@/lib/supabase/models";
import { useUser } from "@clerk/nextjs";
import { Label } from "@radix-ui/react-label";
import {
  ChartColumn,
  CheckCheck,
  CircleX,
  Filter,
  LayoutDashboard,
  LayoutGrid,
  List,
  Loader2,
  Plus,
  Search,
  StickyNote,
  Trash,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const DashboardPage = () => {
  const { user } = useUser();
  const { createBoard, boards, loading, error } = useBoards();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [filters, setFilters] = useState({
    search: "",
    dateRange: {
      start: null as string | null,
      end: null as string | null,
    },
  });
  const boardsWithTaskCount = boards.map((board: Board) => ({
    ...board,
    taskCount: 0,
  }));

  const filteredBoards = boardsWithTaskCount.filter((board: Board) => {
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

  function clearFilters() {
    setFilters({
      search: "",
      dateRange: {
        start: null as string | null,
        end: null as string | null,
      },
    });
  }

  const handleCreateBoard = async () => {
    await createBoard({ title: "New Board" });
  };
  const totalTasksCount = boards.reduce((acc, board) => {
    const boardTasksCount =
      board.columns?.reduce((sum, col) => sum + (col.tasks?.length || 0), 0) ||
      0;
    return acc + boardTasksCount;
  }, 0);

  if (loading) {
    return (
      <div>
        <Loader2 />
        <span>Loading your boards...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <CircleX />
        <span>Boards isnt available</span>
      </div>
    );
  }

  const activeFilterCount = [
    filters.search !== "",
    filters.dateRange.start !== null,
    filters.dateRange.end !== null,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Welcome back,
            {user?.firstName ?? user?.emailAddresses[0].emailAddress}!👋🏻
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your boards today
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card
            className=" transition-shadow duration-300 ease-in-out
    hover:shadow-lg hover:shadow-orange-200/40 cursor-pointer"
          >
            <CardContent className="p-4 sm:p-6 ">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">
                    Total Boards
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {boards.length}
                  </p>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <LayoutDashboard className="h-5 w-5 sm:h-6 sm:w-6 text-orange-400 " />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card
            className="transition-shadow duration-300 ease-in-out
    hover:shadow-lg hover:shadow-red-200/40 cursor-pointer"
          >
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">
                    Recent Activity
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {
                      boards.filter((board) => {
                        const updatedAt = new Date(board.updated_at);
                        const oneWeekAgo = new Date();
                        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                        return updatedAt > oneWeekAgo;
                      }).length
                    }
                  </p>
                </div>

                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <ChartColumn className="h-5 w-5 sm:h-6 sm:w-6 text-red-400 " />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card
            className="transition-shadow duration-300 ease-in-out
    hover:shadow-lg hover:shadow-green-200/40 cursor-pointer"
          >
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">
                    Active Projects
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {boards.length}
                  </p>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <StickyNote className="h-5 w-5 sm:h-6 sm:w-6 text-green-700 " />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card
            className="transition-shadow duration-300 ease-in-out
    hover:shadow-lg hover:shadow-blue-200/40 cursor-pointer"
          >
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">
                    Total Tasks
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {totalTasksCount}
                  </p>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CheckCheck className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500 " />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-4 sm:space-y-0">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Your boards
              </h2>
              <p className="text-gray-600">Manage your projects and tasks</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row items-strech sm:justify-center space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-2 bg-white border rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="cursor-pointer"
                >
                  <LayoutGrid />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="cursor-pointer"
                >
                  <List />
                </Button>
              </div>
              <Button
                variant={activeFilterCount > 0 ? "default" : "outline"}
                size="sm"
                onClick={() => setIsFilterOpen(true)}
                className={
                  activeFilterCount > 0
                    ? "bg-orange-400 hover:bg-orange-400 text-white border-orange-400 h-9 cursor-pointer"
                    : "h-9 cursor-pointer"
                }
              >
                <Filter className="h-4 w-4" />
                Filter {activeFilterCount > 0 && `(${activeFilterCount})`}
              </Button>
              <Button onClick={handleCreateBoard} className="cursor-pointer">
                <Plus className="h-4 w-4 " />
                Create Board
              </Button>
            </div>
          </div>

          <div className="relative mb-4 sm:mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="search"
              placeholder="Search boards..."
              className="pl-10"
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
            />
          </div>

          {boards.length === 0 ? (
            <div className="font-semibold text-base sm:text-lg">
              No boards yet
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredBoards.map((board, key) => (
                <Link href={`/boards/${board.id}`} key={key}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: board.color }}
                        />
                        <Button
                          size="sm"
                          className="  bg-white hover:scale-111 text-red-700 hover:text-white  hover:bg-red-700 transition-transform cursor-pointer"
                        >
                          <Trash className="h-5 w-5 " />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                      <CardTitle className="text-base sm:text-lg mb-2">
                        {board.title}
                      </CardTitle>
                      <CardDescription className="mb-4 text-sm">
                        {board.description}
                      </CardDescription>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500 space-y-1 sm:space-y-0">
                        <span>
                          Created{" "}
                          {new Date(board.created_at).toLocaleDateString()}
                        </span>
                        <span>
                          Updated{" "}
                          {new Date(board.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
              <Card
                onClick={handleCreateBoard}
                className="
    group
    border-2 border-dashed border-gray-300
    cursor-pointer
    transition-all duration-300 ease-in-out
    hover:border-orange-300
  "
              >
                <CardContent className="p-4 sm:p-6 flex flex-col items-center justify-center h-full min-h-42">
                  <Plus
                    className="
        h-6 w-6 sm:h-8 sm:w-8
        text-gray-400 mb-2
        transition-colors duration-300 ease-in-out
        group-hover:text-orange-400
      "
                  />
                  <p
                    className="
        text-sm sm:text-base font-medium
        text-gray-600
        transition-colors duration-300 ease-in-out
        group-hover:text-orange-500
      "
                  >
                    Create new board
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div>
              {filteredBoards.map((board, key) => (
                <div className={key > 0 ? "mt-4" : ""} key={key}>
                  <Link href={`/boards/${board.id}`} key={board.id}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: board.color }}
                          />
                          <Button
                            size="sm"
                            className="  bg-white hover:scale-111 text-red-700 hover:text-white  hover:bg-red-700 transition-transform cursor-pointer"
                          >
                            <Trash className="h-5 w-5 " />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 sm:p-6">
                        <CardTitle className="text-base sm:text-lg mb-2  transition-colors">
                          {board.title}
                        </CardTitle>
                        <CardDescription className="mb-4 text-sm">
                          {board.description}
                        </CardDescription>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500 space-y-1 sm:space-y-0">
                          <span>
                            Created{" "}
                            {new Date(board.created_at).toLocaleDateString()}
                          </span>
                          <span>
                            Updated{" "}
                            {new Date(board.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              ))}
              <Card
                onClick={handleCreateBoard}
                className=" mt-4
    group
    border-2 border-dashed border-gray-300
    cursor-pointer
    transition-all duration-300 ease-in-out
    hover:border-orange-300
  "
              >
                <CardContent className="p-4 sm:p-6 flex flex-col items-center justify-center h-full min-h-43">
                  <Plus
                    className="
        h-6 w-6 sm:h-8 sm:w-8
        text-gray-400 mb-2
        transition-colors duration-300 ease-in-out
        group-hover:text-orange-400
      "
                  />
                  <p
                    className="
        text-sm sm:text-base font-medium
        text-gray-600
        transition-colors duration-300 ease-in-out
        group-hover:text-orange-500
      "
                  >
                    Create new board
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DialogContent className="w-[95vw] max-w-106.25 mx-auto">
          <DialogHeader>
            <DialogTitle>Filter Boards</DialogTitle>
            <p className="text-sm text-gray-600">
              Filter boards by title, date, or task count.
            </p>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3">
              <Label className="mb-2">Search</Label>
              <Input
                id="search"
                placeholder="Search board titles..."
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                className="focus-visible:outline-none focus-visible:ring-0"
              />
            </div>
            <div className="space-y-3">
              <Label>Date Range</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Start Date</Label>
                  <Input
                    type="date"
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        dateRange: {
                          ...prev.dateRange,
                          start: e.target.value || null,
                        },
                      }))
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs">End Date</Label>
                  <Input
                    type="date"
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        dateRange: {
                          ...prev.dateRange,
                          end: e.target.value || null,
                        },
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between pt-4 space-y-2 sm:space-y-0 sm:space-x-2">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="cursor-pointer"
              >
                Clear Filters
              </Button>

              <Button
                onClick={() => setIsFilterOpen(false)}
                className="cursor-pointer"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardPage;
