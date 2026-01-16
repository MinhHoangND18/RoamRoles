"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  FileText,
  Tag,
  Book,
  ChevronDown,
  Users,
  FolderOpen, 
} from "lucide-react";
import { signOut } from "next-auth/react";

export default function Sidebar() {
  const searchParams = useSearchParams();
  const activeType = searchParams.get("type");
  const activeCategory = searchParams.get("category");
  const activeMenu = searchParams.get("menu");

  const [isContentOpen, setIsContentOpen] = useState(true);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const categories = [
    { name: "Career Stories", slug: "career-stories" },
    { name: "Guides", slug: "guides" },
    { name: "Job Listings", slug: "job-listings" },
    { name: "Planning", slug: "planning" },
    { name: "Remote Work", slug: "remote-work" },
    { name: "Tips", slug: "tips" },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-slate-800 text-lg tracking-tight">
            Job Manager
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1">
          <li>
            <Link
              href="/admin?menu=accounts"
              className={`flex items-center gap-3 px-4 py-2.5 text-sm font-bold transition-colors ${
                activeMenu === "accounts"
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
              <ChevronDown
                className={`w-3 h-3 transition-transform ${
                  isContentOpen ? "" : "-rotate-90"
                }`}
              />
            </button>
          </li>

          {isContentOpen && (
            <div className="space-y-1">
              {[
                { name: "Posts", slug: "post", icon: FileText },
                { name: "Pages", slug: "page", icon: Book },
                { name: "Tags", slug: "tag", icon: Tag },
              ].map((type) => (
                <li key={type.slug}>
                  <Link
                    href={`/admin?type=${type.slug}`}
                    className={`flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors ${
                      activeType === type.slug && !activeMenu
                        ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <type.icon className="w-4 h-4" /> {type.name}
                  </Link>
                </li>
              ))}

              <li>
                <button
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  className={`flex items-center justify-between w-full px-4 py-2 text-sm font-medium transition-colors ${
                    activeCategory ? "text-blue-600" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FolderOpen className="w-4 h-4" /> Categories
                  </div>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform ${
                      isCategoryOpen ? "" : "-rotate-90"
                    }`}
                  />
                </button>
              </li>

              {isCategoryOpen && (
                <div className="space-y-1 ml-4 border-l border-slate-100">
                  {categories.map((cat) => (
                    <li key={cat.slug}>
                      <Link
                        href={`/admin?category=${cat.slug}`}
                        className={`flex items-center gap-3 px-4 py-1.5 text-sm font-medium transition-colors ${
                          activeCategory === cat.slug && !activeMenu
                            ? "text-blue-600 font-bold"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        <div
                          className={`w-1 h-1 rounded-full ${
                            activeCategory === cat.slug ? "bg-blue-600" : "bg-slate-300"
                          }`}
                        />
                        {cat.name}
                      </Link>
                    </li>
                  ))}
                </div>
              )}
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
  );
}