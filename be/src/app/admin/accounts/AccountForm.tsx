"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Search,
  ChevronRight,
  ChevronLeft,
  Loader2,
  ChevronDown,
  Check, // Thêm icon Check để dùng cho nút Accept
} from "lucide-react";
import { Account } from "@/types";
import { getAccounts } from "@/lib/api/admin";
import toast, { Toaster } from "react-hot-toast"; // Thêm để báo thành công

export const dynamic = "force-dynamic";

function AccountManagementContent() {
  const router = useRouter();
  const { data: session } = useSession();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isRowsOpen, setIsRowsOpen] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

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
      const res = await fetch(`${API_URL}/api/accounts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account: email, status: "active" }),
      });
      if (!res.ok) throw new Error("Update failed");
      toast.success("Đã kích hoạt tài khoản!");
      fetchData(); 
    } catch (error) {
      toast.error("Lỗi khi kích hoạt");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredAccounts = accounts.filter((acc) =>
    acc.account.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredAccounts.length / pageSize);
  const paginatedData = filteredAccounts.slice(
    (currentPage - 1) * pageSize,
    (currentPage - 1) * pageSize + pageSize
  );

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-800 font-sans">
      <Toaster position="top-right" />
      <main className="flex-1 p-6">
        <div className="max-w-5xl mx-auto">
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
            <button
              onClick={() => router.push("/admin/accounts/add")}
              className="bg-blue-500 text-white font-black text-[12px] uppercase tracking-widest py-4 px-8 shadow-sm hover:bg-blue-600 transition-all"
            >
              Add Account
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
                      <th className="px-10 py-5">Account</th>
                      <th className="px-10 py-5 text-right w-64">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedData.map((acc) => {
                      const isMe = session?.user?.email === acc.account;
                      return (
                        <tr key={acc.id} className="transition-all group border-b border-slate-100">
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
                            <div className="flex items-center justify-end gap-3">
                              {/* PENDING */}
                              {acc.status === "pending" && (
                                <button
                                  onClick={() => handleAccept(acc.id, acc.account)}
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
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {!loading && filteredAccounts.length > 0 && (
              <div className="px-10 py-6 bg-slate-50/50 border-t border-slate-100 flex justify-end items-center gap-2">
                <span className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Rows:</span>
                <div className="relative">
                  <button
                    onClick={() => setIsRowsOpen(!isRowsOpen)}
                    className="flex items-center gap-1 bg-white border border-slate-200 px-4 py-2 shadow-sm hover:bg-slate-50 transition-all font-bold text-slate-700 text-sm"
                  >
                    {pageSize} <ChevronDown className={`w-3 h-3 transition-transform ${isRowsOpen ? "rotate-180" : ""}`} />
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
                  Page <span className="text-slate-900">{currentPage}</span> of {totalPages}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2.5 bg-white border border-slate-200 shadow-sm disabled:opacity-30 hover:bg-slate-50 transition-all"
                  >
                    <ChevronLeft className="w-5 h-5 text-slate-600" />
                  </button>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="w-10 h-10 text-blue-500 animate-spin" /></div>}>
      <AccountManagementContent />
    </Suspense>
  );
}