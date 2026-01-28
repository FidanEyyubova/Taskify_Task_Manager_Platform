"use client";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import {
  ArrowRight,
  CornerUpLeft,
  Ellipsis,
  LayoutDashboard,
  LayoutGrid,
  LayoutList,
  Settings2,
} from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBoards } from "@/lib/hooks/useBoards";

interface Props {
  boardTitle?: string;
  boardColor?: string;
  onEditBoard?: () => void;
}

const Navbar = ({ boardTitle, boardColor, onEditBoard }: Props) => {
  const pathname = usePathname();

  const { isSignedIn, user } = useUser();
  const { boards } = useBoards();
  const DashboardPage = pathname === "/dashboard";
  const BoardPage = pathname.startsWith("/boards");

  if (DashboardPage) {
    return (
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* <LayoutList className="h-6 w-6 sm:h-8 sm:w-8 text-[#FFA239]" /> */}
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

  if (BoardPage) {
    return (
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="lex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
              <Link
                href="/dashboard"
                className="flex items-center space-x-1 sm:space-x-2 text-gray-600 hover:text-gray-900 shrink-0"
              >
                <CornerUpLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Back to the Dashboard</span>
                <span className="sm:hidden"></span>
              </Link>
              <div className="h-4 sm:h-6 w-px bg-gray-300 hidden sm:block" />
              <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
                   <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: boardColor }}
                        />
                <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
                  <span className="text-lg font-medium text-gray-900 truncate">
                    {boardTitle}
                  </span>

                  {onEditBoard && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 shrink-0 hover:bg-transparent cursor-pointer"
                      onClick={onEditBoard}
                    >
                      <Ellipsis className="h-6 w-6 sm:h-7 sm:w-7 mt-1 " />
                    </Button>
                  )}
                </div>
              </div>
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
          {/* <LayoutList className="h-6 w-6 sm:h-8 sm:w-8 text-[#FFA239]" /> */}
          <span className="text-xl sm:text-2xl font-bold">
            <Link href="/">
              <span className="text-[#FFA239]">Task</span>ify
            </Link>
          </span>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          {isSignedIn ? (
            <div className="flex flex-column sm:flex-row items-end sm:items-center space-y-1 sm:space-y-0 sm:space-x-4">
              <span className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                Welcome, {user.firstName ?? user.fullName}
              </span>
              <Link href="/dashboard">
                <Button size="sm" className="text-xs sm:text-sm">
                  Go to Dashboard <ArrowRight />
                </Button>
              </Link>
            </div>
          ) : (
            <div>
              <div>
                <SignInButton>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs sm:text-sm"
                  >
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton>
                  <Button className="text-xs sm:text-sm">Sign Up</Button>
                </SignUpButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
