"use client";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { Puzzle, CheckCircle, Zap, ArrowRight, Notebook } from "lucide-react";
import Link from "next/link";
import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";




const Home = () => {
  useEffect(() => {
  AOS.init({
    duration: 1000,
    once: true,     
  });
}, []);
  const { isSignedIn } = useUser();
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="relative overflow-hidden flex flex-col items-center justify-center text-center px-4 py-24 sm:py-32">
        <div className="absolute inset-0 bg-linear-to-br from-orange-100 via-white to-orange-200" />
        <div className="absolute -top-24 -left-24 h-72 w-72 bg-orange-300/40 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-72 w-72 bg-orange-400/30 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-3xl w-full animate__animated animate__backInLeft" >
          <h1 className="text-3xl sm:text-5xl font-bold text-gray-900">
            <span className="text-[#FFA239]">Task</span>ify – Smart Task
            Management Made Simple
          </h1>

          <p className="mt-4 text-gray-600 text-base sm:text-lg max-w-xl mx-auto font-semibold">
            Taskify helps you organize your tasks, boost productivity, and stay
            focused every single day.
          </p>

          <div className="mt-8 flex justify-center">
            {isSignedIn ? (
              <Link href="/dashboard">
                <Button className="px-8 py-6 text-base cursor-pointer">
                  Go to Dashboard <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <SignInButton>
                <Button className="px-8 py-6 text-base cursor-pointer">
                  Sign In Now
                </Button>
              </SignInButton>
            )}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col justify-start mb-12">
            <h2 className="text-2xl sm:text-4xl font-semibold text-gray-900">
              Work Smarter
            </h2>
            <p className="mt-2 text-gray-600 font-semibold">
              Do more with Taskify
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"  data-aos="fade-down">
            <Card
              className="transition-shadow duration-300 ease-in-out
    hover:shadow-lg hover:shadow-orange-200/40 cursor-pointer"
            >
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Zap className="h-10 w-10 text-orange-500 mb-4" />
                <h3 className="font-semibold text-lg">Fast & Simple</h3>
                <p className="text-sm text-gray-600 mt-2">
                  Create and manage tasks with an intuitive interface.
                </p>
              </CardContent>
            </Card>

            <Card
              className="transition-shadow duration-300 ease-in-out
    hover:shadow-lg hover:shadow-orange-200/40 cursor-pointer"
            >
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Notebook className="h-10 w-10 text-orange-500 mb-4" />
                <h3 className="font-semibold text-lg">Effortless Planning</h3>
                <p className="text-sm text-gray-600 mt-2">
                  Plan your day in seconds and stay ahead of your tasks.
                </p>
              </CardContent>
            </Card>

            <Card
              className="transition-shadow duration-300 ease-in-out
    hover:shadow-lg hover:shadow-orange-200/40 cursor-pointer"
            >
              <CardContent className="p-6 flex flex-col items-center text-center">
                <CheckCircle className="h-10 w-10 text-orange-500 mb-4" />
                <h3 className="font-semibold text-lg">Stay Organized</h3>
                <p className="text-sm text-gray-600 mt-2">
                  Track progress and never miss important tasks.
                </p>
              </CardContent>
            </Card>

            <Card
              className="transition-shadow duration-300 ease-in-out
    hover:shadow-lg hover:shadow-orange-200/40 cursor-pointer"
            >
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Puzzle className="h-10 w-10 text-orange-500 mb-4" />
                <h3 className="font-semibold text-lg">Boost Productivity</h3>
                <p className="text-sm text-gray-600 mt-2">
                  Focus on what matters most and get things done faster.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="px-4 py-10 bg-linear-to-r from-orange-600 to-orange-300 text-white text-center">
        <h2 className="text-xl sm:text-4xl font-semibold">
          Get Started with Taskify
        </h2>
      </section>
      <Footer />
    </div>
  );
};

export default Home;
