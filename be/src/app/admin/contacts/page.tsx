"use client";
import { useState, useEffect, Suspense } from "react";
import {
    Search,
    ChevronRight,
    ChevronLeft,
    Loader2,
    ChevronDown,
    Check,
} from "lucide-react";
import { Contact } from "@/types";
import { getContacts, updateContactStatus } from "@/lib/api/contacts";
import toast, { Toaster } from "react-hot-toast";

export const dynamic = "force-dynamic";

function ContactsContent() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [isRowsOpen, setIsRowsOpen] = useState(false);
    const [processingId, setProcessingId] = useState<number | null>(null);

    const fetchContacts = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const data = await getContacts();
            setContacts(data);
        } catch (err) {
            console.error("Failed to fetch contacts", err);
            toast.error("Failed to load contacts");
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    const handleStatusUpdate = async (contactId: number, newStatus: "pending" | "contacted") => {
        setProcessingId(contactId);
        try {
            await updateContactStatus(contactId, newStatus);
            // Cập nhật local ngay để status hiển thị "contacted" khi ấn nút
            setContacts((prev) =>
                prev.map((c) => (c.id === contactId ? { ...c, status: newStatus } : c))
            );
            toast.success(`Status updated to ${newStatus}`);
            await fetchContacts(false);
        } catch (err) {
            console.error("Failed to update status", err);
            toast.error("Failed to update status");
            fetchContacts(false);
        } finally {
            setProcessingId(null);
        }
    };

    const filteredContacts = contacts.filter((contact) => {
        const searchLower = searchQuery.toLowerCase();
        return (
            contact.email?.toLowerCase().includes(searchLower) ||
            contact.first_name?.toLowerCase().includes(searchLower) ||
            contact.last_name?.toLowerCase().includes(searchLower) ||
            contact.message?.toLowerCase().includes(searchLower)
        );
    });

    const totalPages = Math.ceil(filteredContacts.length / pageSize);
    const paginatedData = filteredContacts.slice(
        (currentPage - 1) * pageSize,
        (currentPage - 1) * pageSize + pageSize
    );

    // Check if contact is new (created within last 24 hours) and has gmail
    const isNewGmailContact = (contact: Contact): boolean => {
        if (!contact.created_at) return false;

        const email = contact.email?.toLowerCase() || "";
        if (!email.includes("gmail")) return false;

        const createdAt = new Date(contact.created_at);
        const now = new Date();
        const diffInHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

        return diffInHours < 24;
    };

    return (
        <div className="flex min-h-screen bg-[#f8fafc] text-slate-800 font-sans">
            <Toaster position="top-right" />
            <main className="flex-1 p-6">
                <div className="mx-auto">
                    <header className="mb-12 text-left">
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                            Contacts Management
                        </h1>
                    </header>

                    <div className="flex flex-col md:flex-row gap-4 mb-10">
                        <div className="relative flex-1">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search contacts..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full bg-white border border-slate-200 py-4 pl-14 pr-6 text-[15px] shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 transition-all font-medium"
                            />
                        </div>
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
                                            <th className="px-6 py-5 w-16">ID</th>
                                            <th className="px-6 py-5 w-40">Name</th>
                                            <th className="px-6 py-5 w-48">Email</th>
                                            <th className="px-6 py-5 w-48">Domain</th>
                                            <th className="px-6 py-5 w-48">Referer</th>
                                            <th className="px-6 py-5">Message</th>
                                            <th className="px-6 py-5 text-right w-64">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredContacts.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={7}
                                                    className="text-center py-10 px-6 text-slate-500 font-medium"
                                                >
                                                    No contacts found.
                                                </td>
                                            </tr>
                                        ) : (
                                            paginatedData.map((contact) => (
                                                <tr
                                                    key={contact.id}
                                                    className="transition-all hover:bg-slate-50 group border-b border-slate-100"
                                                >
                                                    <td className="px-6 py-6 text-[13px] font-medium text-slate-600">
                                                        {contact.id}
                                                    </td>
                                                    <td className="px-6 py-6">
                                                        <span className="text-[15px] font-bold text-slate-700">
                                                            {contact.first_name} {contact.last_name}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-6 text-[14px] text-slate-600">
                                                        <span>{contact.email}</span>
                                                        <br></br>
                                                        {isNewGmailContact(contact) && (
                                                            <span className="ml-2 text-[10px] font-black uppercase tracking-widest text-blue-600">
                                                                (NEW)
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-6 text-[14px] text-slate-600 break-all max-w-[200px]" title={contact.domain}>
                                                        {contact.domain || "-"}
                                                    </td>
                                                    <td className="px-6 py-6 text-[14px] text-slate-600 break-all max-w-[200px]" title={contact.referer}>
                                                        {contact.referer || "-"}
                                                    </td>
                                                    <td className="px-6 py-6 text-[14px] text-slate-600 truncate max-w-xs" title={contact.message}>
                                                        {contact.message}
                                                    </td>
                                                    <td className="px-6 py-6 text-center">
                                                        <div className="flex flex-col items-end gap-2">
                                                            {(contact.status || "pending").toLowerCase() === "pending" && (
                                                                <button
                                                                    onClick={() => handleStatusUpdate(contact.id, "contacted")}
                                                                    disabled={processingId === contact.id}
                                                                    className="bg-emerald-600 text-white px-3 py-1.5 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:bg-emerald-700 transition-all disabled:opacity-50"
                                                                >
                                                                    {processingId === contact.id ? (
                                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                                    ) : (
                                                                        <Check className="w-3 h-3" />
                                                                    )}
                                                                    CONTACTED
                                                                </button>
                                                            )}

                                                            <span
                                                                className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest ${(contact.status || "pending").toLowerCase() === "contacted"
                                                                    ? "bg-green-100 text-green-700"
                                                                    : "bg-red-100 text-red-700"
                                                                    }`}
                                                            >
                                                                {(contact.status || "pending").toLowerCase()}
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {!loading && filteredContacts.length > 0 && (
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

export default function ContactsPage() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-screen">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                </div>
            }
        >
            <ContactsContent />
        </Suspense>
    );
}
