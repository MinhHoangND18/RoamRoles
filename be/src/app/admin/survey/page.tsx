"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { API_CONFIG } from "@/lib/api/config";
import { SurveySet } from "@/types/survey_question";
import { Edit, Trash2, Plus, Search, ChevronDown, Loader2 } from "lucide-react";
import SurveySetForm from "./SurveySetForm";
import SurveyQuestionsManager from "./SurveyQuestionsManager";

// Hook để đóng dropdown khi click ra ngoài
function useOnClickOutside(ref: React.RefObject<HTMLElement>, handler: (event: MouseEvent | TouchEvent) => void) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) return;
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

export default function SurveyPage() {
  const [sets, setSets] = useState<SurveySet[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  const [selectedSet, setSelectedSet] = useState<SurveySet | null>(null);
  const [showSetForm, setShowSetForm] = useState(false);
  const [editingSet, setEditingSet] = useState<SurveySet | null>(null);
  const [showQuestionsManager, setShowQuestionsManager] = useState(false);
  const [loading, setLoading] = useState(true);

  useOnClickOutside(statusDropdownRef as React.RefObject<HTMLElement>, () => setIsStatusOpen(false));

  const loadSets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}/api/admin/survey/sets`);
      const data = await res.json();
      setSets(data || []);
    } catch (error) {
      console.error("Failed to load survey sets", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSets();
  }, [loadSets]);

  // Logic lọc dữ liệu
  const filteredSets = sets.filter((set) => {
    const matchesSearch = set.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "" ? true : (selectedStatus === "active" ? set.active : !set.active);
    return matchesSearch && matchesStatus;
  });

  const handleDeleteSet = async (id: number) => {
    if (!confirm("Delete this survey set? All questions and responses will be deleted!")) return;
    await fetch(`${API_CONFIG.BASE_URL}/api/admin/survey/sets/${id}`, { method: "DELETE" });
    loadSets();
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 text-left">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Survey Management
          </h1>
        </header>

        {/* Thanh công cụ: Search + Filter + Button (Mẫu tương tự ảnh) */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search survey sets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 py-4 pl-14 pr-6 text-[15px] shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 transition-all font-medium"
            />
          </div>

          <div className="relative" ref={statusDropdownRef}>
            <button
              onClick={() => setIsStatusOpen(!isStatusOpen)}
              className="flex items-center justify-between w-full md:w-48 bg-white border gap-3 border-slate-200 py-4 px-5 text-[15px] shadow-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
            >
              <span className="text-slate-700">
                {selectedStatus === "" ? "All Status" : selectedStatus === "active" ? "Active" : "Inactive"}
              </span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isStatusOpen ? "rotate-180" : ""}`} />
            </button>
            {isStatusOpen && (
              <ul className="absolute top-full mt-2 left-0 w-full bg-white border border-slate-200 shadow-xl py-2 z-20 font-medium text-sm">
                {["", "active", "inactive"].map((status) => (
                  <li
                    key={status}
                    onClick={() => {
                      setSelectedStatus(status);
                      setIsStatusOpen(false);
                    }}
                    className="px-5 py-2.5 cursor-pointer hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-colors"
                  >
                    {status === "" ? "All Status" : status.charAt(0).toUpperCase() + status.slice(1)}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            onClick={() => { setEditingSet(null); setShowSetForm(true); }}
            className="bg-blue-600 text-white font-black text-[12px] uppercase tracking-widest py-4 px-8 shadow-md hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" strokeWidth={3} />
            New Survey Set
          </button>
        </div>

        {/* Danh sách Survey Sets */}
        {!showQuestionsManager && (
          <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex items-center justify-center p-20">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
              ) : filteredSets.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20 text-slate-400">
                  <p className="font-bold uppercase tracking-widest text-xs mb-2">No Survey Found</p>
                  <p className="text-sm">Try changing your search keywords or create a new survey set.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[11px] uppercase tracking-[1.5px] font-black">
                      <th className="px-10 py-5 w-24">ID</th>
                      <th className="px-10 py-5">Survey Name</th>
                      <th className="px-10 py-5 text-center">Status</th>
                      <th className="px-10 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSets.map((set) => (
                      <tr key={set.id} className="hover:bg-slate-50/80 transition-all group">
                        <td className="px-10 py-6 font-bold text-slate-500 text-[15px]">{set.id}</td>
                        <td className="px-10 py-6">
                          <div className="flex flex-col">
                            <span className="text-[16px] font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                              {set.name}
                            </span>
                            <span className="text-[12px] text-slate-400 font-medium">Slug: {set.slug}</span>
                          </div>
                        </td>
                        <td className="px-10 py-6 text-center">
                          <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest ${set.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            }`}>
                            {set.active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-10 py-6 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => { setSelectedSet(set); setShowQuestionsManager(true); }}
                              className="bg-slate-100 text-slate-700 font-bold py-2 px-4 text-xs hover:bg-slate-200 transition-all flex items-center gap-2"
                            >
                              <Edit className="w-3 h-3" /> Questions
                            </button>
                            <button
                              onClick={() => { setEditingSet(set); setShowSetForm(true); }}
                              className="p-2 text-blue-500 hover:bg-blue-50 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteSet(set.id)}
                              className="p-2 text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Modal và Manager giữ nguyên logic cũ */}
        {showSetForm && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
              <SurveySetForm
                set={editingSet}
                onSuccess={() => { setShowSetForm(false); setEditingSet(null); loadSets(); }}
                onCancel={() => { setShowSetForm(false); setEditingSet(null); }}
              />
            </div>
          </div>
        )}

        {showQuestionsManager && selectedSet && (
          <SurveyQuestionsManager
            set={selectedSet}
            onBack={() => { setShowQuestionsManager(false); setSelectedSet(null); }}
          />
        )}
      </div>
    </div>
  );
}