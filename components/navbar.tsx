"use client";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { ArrowRight, LayoutList } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const pathname = usePathname();

  const { isSignedIn, user } = useUser();
  const DashboardPage = pathname === "/dashboard";
  const BoardPage = pathname.startsWith("/boards");

  if (DashboardPage) {
    return (
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* <LayoutList className="h-6 w-6 sm:h-8 sm:w-8 text-[#FFA239]" /> */}
            <span className="text-xl sm:text-2xl font-bold">
              <Link href="/"><span className="text-[#FFA239]">Task</span>ify</Link>
            </span>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <UserButton />
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
             <Link href="/"><span className="text-[#FFA239]">Task</span>ify</Link>
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
