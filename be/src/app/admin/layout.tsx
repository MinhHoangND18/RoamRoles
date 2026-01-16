
import { Suspense } from "react";
import Sidebar from "@/components/admin/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans">
      <div className="flex">
        <Suspense fallback={<div className="w-64 bg-white border-r border-slate-200 h-screen" />}>
          <Sidebar />
        </Suspense>
        <main className="flex-1">
            {children}
        </main>
      </div>
    </div>
  );
}
