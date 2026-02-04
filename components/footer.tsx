import { Puzzle, Twitter, Linkedin, Github, Mail } from "lucide-react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-gray-100 text-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col items-center gap-3">
        {}
        <div className="flex items-center gap-2 text-black font-bold text-2xl">
          <Link href="/">
            <span className="text-[#FFA239]">Task</span>ify
          </Link>
        </div>
        <p className="text-black text-center max-w-md">
          Smart task management to help you stay productive every day.
        </p>

        {}
        <div className="flex flex-col items-center gap-3">
          <p className="font-medium text-black">Follow Us</p>
          <div className="flex gap-4">
            <a
              href="https://twitter.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-orange-400 transition-colors text-black"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a
              href="https://www.linkedin.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-orange-400 transition-colors text-black"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <a
              href="https://github.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-orange-400 transition-colors text-black"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href="mailto:info@taskify.com"
              className="hover:text-orange-400 transition-colors text-black"
            >
              <Mail className="h-5 w-5" />
            </a>
          </div>
        </div>

        {}
        <p className="text-gray-500 text-xs mt-3 text-center">
          © {new Date().getFullYear()} Taskify. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
