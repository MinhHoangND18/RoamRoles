"use client";
import { usePathname, useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  LogOut,
  FileText,
  Book,
  ChevronDown,
  Users,
  FolderOpen,
  Menu, 
  X,
  ClipboardList,
} from "lucide-react";
import { signOut } from "next-auth/react";

export default function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [isContentOpen, setIsContentOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // SỬA LỖI TẠI ĐÂY: 
  useEffect(() => {
    if (isMobileOpen) {
      const timer = setTimeout(() => {
        setIsMobileOpen(false);
      }, 0); 
      
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white border border-slate-200 rounded-lg shadow-sm"
      >
        <Menu className="w-6 h-6 text-slate-600" />
      </button>

      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-[60] lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-[70] h-screen bg-white border-r border-slate-200 flex flex-col transition-transform duration-300
          w-64 
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-800 text-lg tracking-tight">
              Job Manager
            </span>
          </div>
          <button onClick={() => setIsMobileOpen(false)} className="lg:hidden p-1 text-slate-400">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1">
            <li>
              <Link
                href="/accounts"
                className={`flex items-center gap-3 px-4 py-2.5 text-sm font-bold transition-colors ${
                  pathname.startsWith("/accounts")
                    ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Users className="w-4 h-4" /> Accounts
              </Link>
            </li>

            <li className="px-4 pt-4 pb-2">
              <button
                onClick={() => setIsContentOpen(!isContentOpen)}
                className="flex items-center justify-between w-full text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-slate-600"
              >
                Content Manager
                <ChevronDown className={`w-3 h-3 transition-transform ${isContentOpen ? "" : "-rotate-90"}`} />
              </button>
            </li>

            {isContentOpen && (
              <div className="space-y-1">
                {[
                  { name: "Posts", path: "/posts", icon: FileText },
                  { name: "Pages", path: "/pages", icon: Book },
                  { name: "Categories", path: "/categories", icon: FolderOpen }, 
                  { name: "Survey", path: "/survey", icon: ClipboardList },
                ].map((item) => (
                  <li key={item.path}>
                    <Link
                      href={item.path}
                      className={`flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors ${
                        pathname.startsWith(item.path)
                          ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <item.icon className="w-4 h-4" /> {item.name}
                    </Link>
                  </li>
                ))}
              </div>
            )}

            <li className="pt-4 border-t border-slate-100 mx-2">
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
}