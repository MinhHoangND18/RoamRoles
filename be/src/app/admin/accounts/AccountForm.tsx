"use client";
import { useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Search,
  ChevronRight,
  ChevronLeft,
  Loader2,
  ChevronDown,
  Check,
} from "lucide-react";
import { Account } from "@/types";
import { getAccounts } from "@/lib/api/admin";
import { updateAccount } from "@/lib/api/accounts";
import toast, { Toaster } from "react-hot-toast";

export const dynamic = "force-dynamic";

function useOnClickOutside(
  ref: React.RefObject<HTMLElement>,
  handler: (event: MouseEvent | TouchEvent) => void,
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

function AccountManagementContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  const statusToString = (status: string | null): string => {
    if (status === "1") return "active";
    if (status === "2") return "pending";
    if (status === "3") return "inactive";
    return "all status";
  };
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isRowsOpen, setIsRowsOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState(
    statusToString(searchParams.get("status")),
  );
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const rowsDropdownRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(statusDropdownRef as React.RefObject<HTMLElement>, () =>
    setIsStatusOpen(false),
  );
  useOnClickOutside(rowsDropdownRef as React.RefObject<HTMLElement>, () =>
    setIsRowsOpen(false),
  );

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    const statusToNumber = (status: string): string | null => {
      if (status === "active") return "1";
      if (status === "pending") return "2";
      if (status === "inactive") return "3";
      return null;
    };

    // Cập nhật params dựa trên state hiện tại
    if (searchQuery) params.set("search", searchQuery);
    else params.delete("search");

    const statusNum = statusToNumber(statusFilter);
    if (statusNum) params.set("status", statusNum);
    else params.delete("status");

    // QUAN TRỌNG: Chỉ replace nếu URL thực sự thay đổi so với hiện tại
    const newQueryString = params.toString();
    const currentQueryString = searchParams.toString();

    if (newQueryString !== currentQueryString) {
      router.replace(`${pathname}?${newQueryString}`, { scroll: false });
    }
  }, [searchQuery, statusFilter, pathname, router, searchParams]);

  const handleAddClick = () => {
    setIsAdding(true);
    router.push("/accounts/add");
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getAccounts();
      setAccounts(data);
    } catch (err) {
      console.error("Failed to fetch accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAccept = async (id: number, email: string) => {
    setProcessingId(id);
    try {
      await updateAccount(id.toString(), { account: email, status: "active" });
      toast.success("Account activated!");
      fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Activation error");
    } finally {
      setProcessingId(null);
    }
  };
  const handleEditClick = (id: number) => {
    setEditingId(id);
    router.push(`/accounts/${id}`);
  };
  const filteredAccounts = accounts
    .filter((acc) =>
      acc.account.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .filter(
      (acc) => statusFilter === "all status" || acc.status === statusFilter,
    );

  const totalPages = Math.ceil(filteredAccounts.length / pageSize);
  const paginatedData = filteredAccounts.slice(
    (currentPage - 1) * pageSize,
    (currentPage - 1) * pageSize + pageSize,
  );

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-800 font-sans">
      <Toaster position="top-right" />
      <main className="flex-1 p-6">
        <div className=" mx-auto">
          <header className="mb-12 text-left">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Accounts Management
            </h1>
          </header>

          <div className="flex flex-col md:flex-row gap-4 mb-10">
            <div className="relative flex-1">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search accounts..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-white border border-slate-200 py-4 pl-14 pr-6 text-[15px] shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 transition-all font-medium"
              />
            </div>
            <div className="relative" ref={statusDropdownRef}>
              <button
                onClick={() => setIsStatusOpen(!isStatusOpen)}
                className="flex items-center justify-between gap-4 bg-white border border-slate-200 py-4 px-6 text-[15px] shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 transition-all font-medium w-48"
              >
                <span className="capitalize">{statusFilter}</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${isStatusOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isStatusOpen && (
                <ul className="absolute top-full mt-2 left-0 w-full bg-white border border-slate-100 shadow-2xl py-1 z-20 font-medium text-[15px]">
                  {["all status", "active", "pending", "inactive"].map(
                    (status) => (
                      <li
                        key={status}
                        onClick={() => {
                          setStatusFilter(status);
                          setIsStatusOpen(false);
                          setCurrentPage(1);
                        }}
                        className="px-6 py-3 cursor-pointer hover:bg-blue-50 text-slate-600 hover:text-blue-600 capitalize"
                      >
                        {status}
                      </li>
                    ),
                  )}
                </ul>
              )}
            </div>
            {/* <button
              onClick={handleAddClick}
              className="bg-blue-500 text-white font-black text-[12px] uppercase tracking-widest py-4 px-8 shadow-sm hover:bg-blue-600 transition-all"
            >
              {isAdding ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading...</span>
                </div>
              ) : (
                "Add Account"
              )}
            </button> */}
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
                      <th className="px-10 py-5 w-20">ID</th>
                      <th className="px-10 py-5">Account</th>
                      <th className="px-10 py-5 text-right w-64">Status</th>
                      <th className="px-10 py-5 text-right w-32">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAccounts.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="text-center py-10 px-6 text-slate-500 font-medium"
                        >
                          No accounts found.
                        </td>
                      </tr>
                    ) : (
                      paginatedData.map((acc) => {
                        const isMe = session?.user?.email === acc.account;
                        return (
                          <tr
                            key={acc.id}
                            className="transition-all group border-b border-slate-100"
                          >
                            <td className="px-10 py-6 text-[15px] font-medium text-slate-600">
                              {acc.id}
                            </td>
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
                            <td className="px-10 py-6 text-center">
                              <div className="flex items-center justify-end gap-3">
                                {acc.status === "pending" && (
                                  <button
                                    onClick={() =>
                                      handleAccept(acc.id, acc.account)
                                    }
                                    disabled={processingId === acc.id}
                                    className="bg-emerald-600 text-white px-3 py-1.5 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:bg-emerald-700 transition-all disabled:opacity-50"
                                  >
                                    {processingId === acc.id ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <Check className="w-3 h-3" />
                                    )}
                                    Accept
                                  </button>
                                )}

                                <span
                                  className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                                    acc.status === "active"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {acc.status}
                                </span>
                              </div>
                            </td>
                            <td className="px-10 py-6 text-center">
                              <button
                                onClick={() => handleEditClick(acc.id)}
                                disabled={isMe}
                                className="rounded-none bg-blue-500 text-white font-bold py-2 px-4 rounded text-xs hover:bg-blue-600 transition-all disabled:bg-slate-400 disabled:cursor-not-allowed"
                              >
                                {editingId === acc.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  "Edit"
                                )}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {!loading && filteredAccounts.length > 0 && (
              <div className="px-10 py-6 bg-slate-50/50 border-t border-slate-100 flex justify-end items-center gap-2">
                <span className="text-slate-400 font-black uppercase text-[10px] tracking-widest">
                  Rows:
                </span>
                <div className="relative" ref={rowsDropdownRef}>
                  <button
                    onClick={() => setIsRowsOpen(!isRowsOpen)}
                    className="flex items-center gap-1 bg-white border border-slate-200 px-4 py-2 shadow-sm hover:bg-slate-50 transition-all font-bold text-slate-700 text-sm"
                  >
                    {pageSize}{" "}
                    <ChevronDown
                      className={`w-3 h-3 transition-transform ${isRowsOpen ? "rotate-180" : ""}`}
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

export default function AccountForm() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        </div>
      }
    >
      <AccountManagementContent />
    </Suspense>
  );
}