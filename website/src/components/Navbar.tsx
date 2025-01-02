import Link from "next/link";
import { GithubIcon } from "@/components/icons";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                BiliMusic
              </span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link 
                href="/download" 
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
              >
                下载
              </Link>
              <Link 
                href="/docs" 
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
              >
                文档
              </Link>
              <Link 
                href="/blog" 
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
              >
                博客
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <a
              href="https://github.com/your-repo"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-700"
            >
              <GithubIcon className="h-6 w-6" />
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
} 