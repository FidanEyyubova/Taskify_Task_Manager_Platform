"use client";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import {
  ArrowRight,
  CornerUpLeft,
  Ellipsis,
  Filter,
} from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBoards } from "@/lib/hooks/useBoards";
import { Badge } from "./ui/badge";

interface Props {
  boardTitle?: string;
  boardColor?: string;
  onEditBoard?: () => void;
  onFilterClick?: () => void;
  filterCount?: number;
}

const Navbar = ({
  boardTitle,
  boardColor,
  onEditBoard,
  onFilterClick,
  filterCount = 0,
}: Props) => {
  const pathname = usePathname();
  const { isSignedIn, user } = useUser();
  
  const isDashboardPage = pathname === "/dashboard";
  const isBoardPage = pathname.startsWith("/boards");
  console.log("NAVBAR-A GELEN FILTER SAYI:", filterCount);

  // Filter aktivdirmi?
  const hasFilters = filterCount > 0;

  if (isDashboardPage) {
    return (
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl sm:text-2xl font-bold">
              <Link href="/">
                <span className="text-[#FFA239]">Task</span>ify
              </Link>
            </span>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <UserButton />
          </div>
        </div>
      </header>
    );
  }

  if (isBoardPage) {
    return (
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
              <Link
                href="/dashboard"
                className="flex items-center space-x-1 sm:space-x-2 text-gray-600 hover:text-gray-900 shrink-0"
              >
                <CornerUpLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Back to Dashboard</span>
              </Link>
              <div className="h-4 sm:h-6 w-px bg-gray-300 hidden sm:block" />
              <div className="flex items-center space-x-2 min-w-0">
                <div
                  className="w-4 h-4 rounded shrink-0"
                  style={{ backgroundColor: boardColor || "#ccc" }}
                />
                <span className="text-lg font-medium text-gray-900 truncate">
                  {boardTitle}
                </span>
                {onEditBoard && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 shrink-0"
                    onClick={onEditBoard}
                  >
                    <Ellipsis className="h-6 w-6" />
                  </Button>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              {onFilterClick && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onFilterClick}
                  className={`text-xs sm:text-sm transition-colors ${
                    hasFilters 
                      ? "bg-red-100! !border-red-300 text-red-700! hover:!bg-red-200" 
                      : ""
                  }`}
                >
                  <Filter className={`h-3 w-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 ${hasFilters ? "!text-red-700" : ""}`} />
                  <span className="hidden sm:inline">Filter</span>
                  {hasFilters && (
                    <Badge
                      variant="secondary"
                      className="text-xs ml-1 sm:ml-2 !bg-blue-600 !text-white border-none"
                    >
                      {filterCount}
                    </Badge>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-2xl font-bold">
            <Link href="/">
              <span className="text-[#FFA239]">Task</span>ify
            </Link>
          </span>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          {isSignedIn ? (
            <div className="flex items-center space-x-4">
              <span className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                Welcome, {user.firstName ?? user.fullName}
              </span>
              <Link href="/dashboard">
                <Button size="sm" className="text-xs sm:text-sm">
                  Go to Dashboard <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <UserButton />
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <SignInButton>
                <Button variant="ghost" size="sm">Sign In</Button>
              </SignInButton>
              <SignUpButton>
                <Button size="sm">Sign Up</Button>
              </SignUpButton>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;