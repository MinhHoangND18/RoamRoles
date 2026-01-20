"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Search,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Loader2,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import { Post, Account } from "@/types";
import { getPosts, getAccounts } from "@/lib/api/admin";

export const dynamic = "force-dynamic";

function AdminPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isRowsOpen, setIsRowsOpen] = useState(false);

  const activeType = searchParams.get("type");
  const activeCategory = searchParams.get("category");
  const activeMenu = searchParams.get("menu");

  useEffect(() => {
    if (!activeType && !activeCategory && !activeMenu) {
      router.push("/admin?type=post");
    } else {
      setCurrentPage(1);
      const fetchData = async () => {
        setLoading(true);
        try {
          if (activeMenu === "accounts") {
            const data = await getAccounts();
            setAccounts(data);
          } else {
            const data = await getPosts();
            setPosts(data);
          }
        } catch (err) {
          setError("Failed to fetch data");
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [activeType, activeCategory, activeMenu, router]);

  const stripHtml = (html: string) => {
    if (!html) return "";
    return html.replace(/<[^>]*>?/gm, "").trim();
  };

  const filteredPosts = posts.filter((post: Post) => {
    const matchesSearch = (post.title_header || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    if (activeCategory)
      return (
        matchesSearch &&
        (post.category?.slug === activeCategory ||
          (post.type?.slug === "category" && post.slug === activeCategory))
      );
    if (activeType) return matchesSearch && post.type?.slug === activeType;
    return matchesSearch;
  });

  const filteredAccounts = accounts.filter((acc) =>
    acc.account.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayData =
    activeMenu === "accounts" ? filteredAccounts : filteredPosts;
  const totalPages = Math.ceil(displayData.length / pageSize);
  const paginatedData = displayData.slice(
    (currentPage - 1) * pageSize,
    (currentPage - 1) * pageSize + pageSize
  );

  // const generateFrontendUrl = (post: Post) => {
  //   const NEXT_PUBLIC_FRONTEND_URL = "http://localhost:3000";
  //   if (post.type?.slug === "page" && post.slug === "about")
  //     return `${NEXT_PUBLIC_FRONTEND_URL}/home/about`;
  //   return `${NEXT_PUBLIC_FRONTEND_URL}/${post.slug}`;
  // };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-800 font-sans">
      <main className="flex-1 p-6">
        <div className="max-w-5xl mx-auto">
          <header className="mb-12 text-left">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              {activeMenu === "accounts"
                ? "Accounts Management"
                : "Content Manager"}
            </h1>
          </header>

          <div className="flex flex-col md:flex-row gap-4 mb-10">
            <div className="relative flex-1">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-white border border-slate-200 py-4 pl-14 pr-6 text-[15px] shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 transition-all font-medium"
              />
            </div>
            <button
              onClick={() => {
                if (activeMenu === "accounts") {
                  router.push("/admin/accounts/add");
                } else {
                  router.push("/admin/add");
                }
              }}
              className="bg-blue-500 text-white font-black text-[12px] uppercase tracking-widest py-4 px-8 shadow-sm hover:bg-blue-600 transition-all"
            >
              {activeMenu === "accounts" ? "Add Account" : "Add Post"}
            </button>
          </div>

          <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex items-center justify-center p-20">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
              ) : (
                <table className="w-full text-left border-collapse table-fixed">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[11px] uppercase tracking-[1.5px] font-black">
                      {activeMenu === "accounts" ? (
                        <>
                          <th className="px-10 py-5">Account</th>
                          <th className="px-10 py-5 text-right w-40">Status</th>
                        </>
                      ) : (
                        <>
                          <th className="px-10 py-5">Title</th>
                          <th className="px-10 py-5 w-35 text-right">Status</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeMenu === "accounts"
                      ? (paginatedData as Account[]).map((acc) => {
                          const isMe = session?.user?.email === acc.account;

                          return (
                            <tr
                              key={acc.id}
                              onClick={() => {
                                if (!isMe) {
                                  router.push(`/admin/accounts/${acc.id}`);
                                }
                              }}
                              className={`transition-all group border-b border-slate-100 ${
                                isMe
                                  ? "bg-slate-50/50 cursor-not-allowed opacity-70" 
                                  : "hover:bg-slate-50/80 cursor-pointer" 
                              }`}
                            >
                              <td className="px-10 py-6">
                                <div className="flex items-center gap-2">
                                  <span className="text-[15px] font-bold text-slate-700">
                                    {acc.account}
                                  </span>
                                  {isMe && (
                                    <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 font-black uppercase tracking-widest">
                                      You
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-10 py-6 text-right">
                                <span
                                  className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                                    acc.status === "active"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {acc.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      : (paginatedData as Post[]).map((post) => {
                          // const displayTitle = stripHtml(post.title_header);
                          return (
                            <tr
                              key={post.id}
                              onClick={() =>
                                router.push(
                                  `/admin/${post.slug}?type=${post.type_id}`
                                )
                              }
                              className="hover:bg-slate-50/80 transition-all group cursor-pointer"
                            >
                              <td className="px-10 py-6">
                                <span className="text-[15px] font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                                  {(() => {
                                    const title =
                                      post.title_header || "(No title)";
                                    return title.includes(":")
                                      ? title
                                          .split(":")
                                          .slice(1)
                                          .join(":")
                                          .trim()
                                      : title;
                                  })()}
                                </span>
                              </td>
                              <td className="px-10 py-6 text-right">
                                <span
                                  className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                                    post.status === "active"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {post.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                  </tbody>
                </table>
              )}
            </div>

            {!loading && filteredPosts.length > 0 && (
              <div className="px-10 py-6 bg-slate-50/50 border-t border-slate-100 flex justify-end items-center gap-2">
                <span className="text-slate-400 font-black uppercase text-[10px] tracking-widest">
                  Rows:
                </span>
                <div className="relative">
                  <button
                    onClick={() => setIsRowsOpen(!isRowsOpen)}
                    className="flex items-center gap-1 bg-white border border-slate-200 px-4 py-2 shadow-sm hover:bg-slate-50 transition-all font-bold text-slate-700 text-sm"
                  >
                    {pageSize}{" "}
                    <ChevronDown
                      className={`w-3 h-3 transition-transform ${
                        isRowsOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isRowsOpen && (
                    <ul className="absolute bottom-full mb-2 left-0 w-full bg-white border border-slate-100 shadow-2xl py-1 z-20 font-bold text-sm">
                      {[10, 25, 50].map((size) => (
                        <li
                          key={size}
                          onClick={() => {
                            setPageSize(size);
                            setIsRowsOpen(false);
                            setCurrentPage(1);
                          }}
                          className="px-4 py-2 cursor-pointer hover:bg-blue-50 text-slate-600 hover:text-blue-600 text-center"
                        >
                          {size}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <span className="text-slate-400 font-bold text-[11px] uppercase tracking-widest">
                  Page <span className="text-slate-900">{currentPage}</span> of{" "}
                  {totalPages}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="p-2.5 bg-white border border-slate-200 shadow-sm disabled:opacity-30 hover:bg-slate-50 transition-all"
                  >
                    <ChevronLeft className="w-5 h-5 text-slate-600" />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="p-2.5 bg-white border border-slate-200 shadow-sm disabled:opacity-30 hover:bg-slate-50 transition-all"
                  >
                    <ChevronRight className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        </div>
      }
    >
      <AdminPageContent />
    </Suspense>
  );
}
