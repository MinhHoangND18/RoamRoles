"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ChevronRight,
  ChevronLeft,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { Post, Category } from "@/types";
import { getPosts } from "@/lib/api/admin";
import { getCategories } from "@/lib/api/categories";

export const dynamic = "force-dynamic";

function PostFormContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const handleAddClick = () => {
    setIsAdding(true);
    router.push("/posts/add");
  };

  const handleEditClick = (id: number) => {
    setEditingId(id);
    router.push(`/posts/${id}`);
  };
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "",
  );
  const [selectedStatus, setSelectedStatus] = useState(
    searchParams.get("status") || "",
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isRowsOpen, setIsRowsOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  const categoryRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const currentSearch = params.get("search");
    const currentCategory = params.get("category");
    const currentStatus = params.get("status");

    let changed = false;
    if (searchQuery && searchQuery !== currentSearch) {
      params.set("search", searchQuery);
      changed = true;
    } else if (!searchQuery && currentSearch) {
      params.delete("search");
      changed = true;
    }

    if (selectedCategory && selectedCategory !== currentCategory) {
      params.set("category", selectedCategory);
      changed = true;
    } else if (!selectedCategory && currentCategory) {
      params.delete("category");
      changed = true;
    }

    if (selectedStatus && selectedStatus !== currentStatus) {
      params.set("status", selectedStatus);
      changed = true;
    } else if (!selectedStatus && currentStatus) {
      params.delete("status");
      changed = true;
    }

    if (changed) {
      router.push(`${pathname}?${params.toString()}`);
    }
  }, [
    searchQuery,
    selectedCategory,
    selectedStatus,
    pathname,
    router,
    searchParams,
  ]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [postsData, categoriesData] = await Promise.all([
          getPosts(),
          getCategories(),
        ]);
        setPosts(postsData);
        setCategories(categoriesData);
      } catch (err) {
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedStatus]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryRef.current &&
        !categoryRef.current.contains(event.target as Node)
      ) {
        setIsCategoryOpen(false);
      }
      if (
        statusRef.current &&
        !statusRef.current.contains(event.target as Node)
      ) {
        setIsStatusOpen(false);
      }
      if (
        rowsRef.current &&
        !rowsRef.current.contains(event.target as Node)
      ) {
        setIsRowsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCategoryOpen, isStatusOpen, isRowsOpen]);

  const filteredPosts = posts
    .filter((post) => post.type?.slug === "post")
    .filter((post: Post) => {
      const matchesSearch = (post.title_header || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory
        ? post.category?.id === parseInt(selectedCategory, 10)
        : true;
      const matchesStatus = selectedStatus
        ? (selectedStatus === "1" && post.status === "active") ||
          (selectedStatus === "2" && post.status === "inactive")
        : true;
      return matchesSearch && matchesCategory && matchesStatus;
    });

  const totalPages = Math.ceil(filteredPosts.length / pageSize);
  const paginatedData = filteredPosts.slice(
    (currentPage - 1) * pageSize,
    (currentPage - 1) * pageSize + pageSize,
  );

  const selectedCategoryName =
    categories.find((c) => c.id.toString() === selectedCategory)?.title ||
    "All Categories";

  const statusOptions = [
    { value: "1", label: "Active" },
    { value: "2", label: "Inactive" },
  ];

  const selectedStatusName =
    statusOptions.find((s) => s.value === selectedStatus)?.label ||
    "All Status";

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-800 font-sans">
      <main className="flex-1 p-6">
        <div className=" mx-auto">
          <header className="mb-12 text-left">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Posts Management
            </h1>
          </header>

          <div className="flex flex-col md:flex-row gap-4 mb-10">
            <div className="relative flex-1">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                }}
                className="w-full bg-white border border-slate-200 py-4 pl-14 pr-6 text-[15px] shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 transition-all font-medium"
              />
            </div>
            <div className="relative" ref={categoryRef}>
                <button onClick={() => setIsCategoryOpen(!isCategoryOpen)} className="flex items-center justify-between w-full md:w-40 bg-white border border-slate-200  py-4 px-4 text-[15px] shadow-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 transition-all"
              >
                <span className="text-left">{selectedCategoryName}</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform text-slate-400 ${
                    isCategoryOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isCategoryOpen && (
                <ul className="absolute top-full mt-2 left-0 w-full bg-white border border-slate-200 shadow-lg py-1 z-20 font-medium text-sm">
                  <li
                    onClick={() => {
                      setSelectedCategory("");
                      setIsCategoryOpen(false);
                    }}
                    className="px-4 py-2 cursor-pointer hover:bg-blue-50 text-slate-600 hover:text-blue-600"
                  >
                    All Categories
                  </li>
                  {categories.map((category) => (
                    <li
                      key={category.id}
                      onClick={() => {
                        setSelectedCategory(category.id.toString());
                        setIsCategoryOpen(false);
                      }}
                      className="px-4 py-2 cursor-pointer hover:bg-blue-50 text-slate-600 hover:text-blue-600"
                    >
                      {category.title}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="relative" ref={statusRef}>
              <button
                onClick={() => setIsStatusOpen(!isStatusOpen)}
                className="flex items-center justify-between w-full md:w-37 bg-white border gap-3 border-slate-200 py-4 px-4 text-[15px] shadow-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 transition-all"
              >
                <span className="text-left">{selectedStatusName}</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform text-slate-400 ${
                    isStatusOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isStatusOpen && (
                <ul className="absolute top-full mt-2 left-0 w-full bg-white border border-slate-200 shadow-lg py-1 z-20 font-medium text-sm">
                  <li
                    onClick={() => {
                      setSelectedStatus("");
                      setIsStatusOpen(false);
                    }}
                    className="px-4 py-2 cursor-pointer hover:bg-blue-50 text-slate-600 hover:text-blue-600"
                  >
                    All Status
                  </li>
                  {statusOptions.map((status) => (
                    <li
                      key={status.value}
                      onClick={() => {
                        setSelectedStatus(status.value);
                        setIsStatusOpen(false);
                      }}
                      className="px-4 py-2 cursor-pointer hover:bg-blue-50 text-slate-600 hover:text-blue-600"
                    >
                      {status.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button
              onClick={handleAddClick}
              className="bg-blue-500 text-white font-black text-[12px] uppercase tracking-widest py-4 px-8 shadow-sm hover:bg-blue-600 transition-all"
            >
              {isAdding ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading...</span>
                </div>
              ) : (
                "Add Post"
              )}{" "}
            </button>
          </div>

          <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex items-center justify-center p-20">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
              ) : error ? (
                <div className="flex items-center justify-center p-20 text-red-500">
                  {error}
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[11px] uppercase tracking-[1.5px] font-black">
                      <th className="px-10 py-5 w-20">Id</th>
                      <th className="px-10 py-5">Title</th>
                      <th className="px-9 py-6 w-60 text-center">Category</th>
                      <th className="px-10 py-5 w-32 text-center">Status</th>
                      <th className="px-10 py-5 w-32 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedData.length > 0 ? (
                      (paginatedData as Post[]).map((post) => {
                        return (
                          <tr
                            key={post.id}
                            className="hover:bg-slate-50/80 transition-all group"
                          >
                            <td className="px-10 py-6 text-[15px] font-bold text-slate-700">
                              {post.id}
                            </td>
                            <td className="px-10 py-6">
                              <span className="text-[15px] font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                                {(() => {
                                  const htmlTitle = post.title || "";
                                  const match = htmlTitle.match(
                                    /<span class="gb-headline-text">(.*?)<\/span>/,
                                  );

                                  let displayTitle = "";

                                  if (match && match[1]) {
                                    displayTitle = match[1]
                                      .replace(/[“”]/g, "")
                                      .trim();
                                  } else {
                                    displayTitle = htmlTitle
                                      .replace(/<[^>]*>/g, "")
                                      .trim();
                                  }

                                  return displayTitle || "(No title)";
                                })()}
                              </span>
                            </td>
                            <td className="px-9 py-6 text-slate-500 font-medium text-center">
                              {post.category?.title || "No category"}
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
                            <td className="px-10 py-6 text-right">
                              <button
                                onClick={() => {
                                  handleEditClick(post.id);
                                }}
                                className="rounded-none bg-blue-500 text-white font-bold py-2 px-4 rounded text-xs hover:bg-blue-600 transition-all"
                              >
                                {editingId === post.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : null}
                                {editingId === post.id ? "" : "Edit"}{" "}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="text-center py-20 text-slate-500 font-medium"
                        >
                          No posts found.
                        </td>
                      </tr>
                    )}
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
                    <ul className="absolute top-full right-0 mt-2 w-full min-w-[max-content] bg-white border border-slate-200 shadow-lg rounded-md py-1 z-20 font-bold text-sm">
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

export default function PostForm() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        </div>
      }
    >
      <PostFormContent />
    </Suspense>
  );
}