"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Search,
  ChevronRight,
  ChevronLeft,
  Loader2,
  ChevronDown,

} from "lucide-react";
import { Category } from "@/types";
import { getCategories } from "@/lib/api/categories";

export const dynamic = "force-dynamic";

function CategoryFormContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );
  const handleAddClick = () => {
    setIsAdding(true);
    router.push("/categories/add");
  };

  const handleEditClick = (id: number) => {
    setEditingId(id);
    router.push(`/categories/${id}`);
  };
  const getNormalizedStatus = (status: string | null): string => {
    if (!status) return "";
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === "active" || lowerStatus === "1") return "1";
    if (lowerStatus === "inactive" || lowerStatus === "2") return "2";
    return "";
  };

  const [selectedStatus, setSelectedStatus] = useState(
    getNormalizedStatus(searchParams.get("status")),
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isRowsOpen, setIsRowsOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    let changed = false;

    if (searchQuery && searchQuery !== params.get("search")) {
      params.set("search", searchQuery);
      changed = true;
    } else if (!searchQuery && params.has("search")) {
      params.delete("search");
      changed = true;
    }

    if (selectedStatus && selectedStatus !== params.get("status")) {
      params.set("status", selectedStatus);
      changed = true;
    } else if (!selectedStatus && params.has("status")) {
      params.delete("status");
      changed = true;
    }

    if (changed) {
      router.push(`${pathname}?${params.toString()}`);
    }
  }, [searchQuery, selectedStatus, pathname, router, searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getCategories();
        setAllCategories(data.sort((a, b) => b.id - a.id));
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
  }, [searchQuery, selectedStatus]);

  const filteredCategories = allCategories.filter((category) => {
    const matchesSearch = category.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const statusToFilter =
      selectedStatus === "1"
        ? "active"
        : selectedStatus === "2"
          ? "inactive"
          : null;
    const matchesStatus = statusToFilter
      ? category.status === statusToFilter
      : true;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredCategories.length / pageSize);
  const paginatedData = filteredCategories.slice(
    (currentPage - 1) * pageSize,
    (currentPage - 1) * pageSize + pageSize,
  );

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
              Categories Management
            </h1>
          </header>

          <div className="flex flex-col md:flex-row gap-4 mb-10">
            <div className="relative flex-1">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                }}
                className="w-full bg-white border border-slate-200 py-4 pl-14 pr-6 text-[15px] shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 transition-all font-medium"
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setIsStatusOpen(!isStatusOpen)}
                className="flex items-center justify-between w-full md:w-40 bg-white border gap-3 border-slate-200 py-4 px-4 text-[15px] shadow-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 transition-all"
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
                "Add Category"
              )}
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
              ) : filteredCategories.length === 0 ? (
                <div className="flex items-center justify-center p-20 text-slate-500">
                  No categories found.
                </div>
              ) : (
                <table className="w-full text-left border-collapse table-fixed">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[11px] uppercase tracking-[1.5px] font-black">
                      <th className="px-10 py-5 w-20">Id</th>
                      <th className="px-10 py-5">Title</th>
                      <th className="px-10 py-5 w-35 text-right">Status</th>
                      <th className="px-10 py-5 w-35 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedData.map((category) => {
                      return (
                        <tr
                          key={category.id}
                          className="hover:bg-slate-50/80 transition-all group"
                        >
                          <td className="px-10 py-6">
                            <span className="text-[15px] font-bold text-slate-700">
                              {category.id}
                            </span>
                          </td>
                          <td className="px-10 py-6">
                            <span className="text-[15px] font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                              {category.title || "(No title)"}
                            </span>
                          </td>
                          <td className="px-10 py-6 text-right">
                            <span
                              className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                                category.status === "active"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {category.status}
                            </span>
                          </td>
                          <td className="px-10 py-6 text-right">
                            <button
                              onClick={() => {
                                handleEditClick(category.id);
                              }}
                              className="rounded-none bg-blue-500 text-white font-bold py-2 px-4 text-xs hover:bg-blue-600 transition-all"
                            >
                              {editingId === category.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : null}
                              {editingId === category.id ? "" : "Edit"}{" "}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {!loading && filteredCategories.length > 0 && (
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
                    disabled={currentPage === totalPages || totalPages === 0}
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

export default function CategoryForm() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        </div>
      }
    >
      <CategoryFormContent />
    </Suspense>
  );
}