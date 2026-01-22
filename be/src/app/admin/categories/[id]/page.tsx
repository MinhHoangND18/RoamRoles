"use client";
import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { Save, ArrowLeft, Loader2, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import { Category } from "@/types";
import { getCategories, saveCategory } from "@/lib/api/categories";
import { APP_CONFIG } from "@/lib/api/config";

function EditCategoryContent() {
  const params = useParams();
  const router = useRouter();
  const isNewCategory = params.id === "add";

  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [displayTitle, setDisplayTitle] = useState("");

  const extractTitleText = (htmlTitle: string) => {
    if (!htmlTitle) return "";
    if (!htmlTitle.includes("<")) return htmlTitle;
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlTitle, "text/html");
    const specificEl = doc.querySelector(".gb-headline-text");
    return specificEl
      ? (specificEl.textContent || "").trim()
      : (doc.body.textContent || "").trim();
  };

  const generateSlug = (str: string) => {
    return str
      .toLowerCase()
      .trim()
      .replace(/&/g, "-and-")
      .replace(/[\s\W-]+/g, "-")
      .replace(/--+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleTitleBlur = () => {
    if (isNewCategory) {
      const newSlug = generateSlug(displayTitle);
      setCategory((prev) => (prev ? { ...prev, slug: newSlug } : null));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isNewCategory) {
          setCategory({
            id: 0,
            title: "",
            title_header: "",
            slug: "",
            status: "active",
          } as Category);
          setDisplayTitle("");
        } else {
          const allCategories = await getCategories();
          const currentCategory = allCategories.find(
            (c) => c.id === Number(params.id),
          );
          if (currentCategory) {
            setCategory(currentCategory);
            setDisplayTitle(extractTitleText(currentCategory.title));
          }
        }
      } catch (error) {
        toast.error("Failed to load category data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.id, isNewCategory]);

  const handleSave = async () => {
    if (!category) return;
    setSaving(true);

    const updatedCategory = { ...category };
    if (!isNewCategory && category.title.includes("gb-headline-text")) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(category.title, "text/html");
      const element = doc.querySelector(".gb-headline-text");
      if (element) {
        element.textContent = displayTitle;
        updatedCategory.title = doc.body.innerHTML;
      }
    } else {
      updatedCategory.title = displayTitle;
    }

    try {
      const allCategories = await getCategories();
      const baseSlug = updatedCategory.slug;
      let finalSlug = baseSlug;
      let counter = 1;

      let slugExists = allCategories.some(
        (c) => c.slug === finalSlug && c.id !== updatedCategory.id,
      );

      while (slugExists) {
        finalSlug = `${baseSlug}-${counter}`;
        counter++;
        slugExists = allCategories.some(
          (c) => c.slug === finalSlug && c.id !== updatedCategory.id,
        );
      }
      
      updatedCategory.slug = finalSlug;

      const savedCategory = await saveCategory(
        updatedCategory,
        isNewCategory ? undefined : category.id,
      );
      
      toast.success(
        isNewCategory ? "Created successfully!" : "Updated successfully!",
      );

      if (isNewCategory) {
        router.push(`/admin/categories/${savedCategory.id}`);
      } else {
        router.refresh();
      }
    } catch (error) {
      const err = error as Error;
      toast.error(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handlePreviewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (category?.slug) {
      setPreviewing(true);
      const url = `${APP_CONFIG.FRONTEND_URL}/category/${category.slug}`;
      window.open(url, "_blank");
      setTimeout(() => setPreviewing(false), 1000);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#f8fafc]">
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-12">
      <div className=" mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 mb-8 font-medium hover:text-slate-700"
        >
          <ArrowLeft className="w-4 h-4" /> Back to categories
        </button>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-grow space-y-6">
            <div className="bg-white border border-slate-200 p-8 shadow-sm space-y-6">
              {/* Title Input */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                  Title
                </label>
                <input
                  type="text"
                  value={displayTitle}
                  onChange={(e) => setDisplayTitle(e.target.value)}
                  onBlur={handleTitleBlur}
                  className="w-full border p-3 text-[16px] shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 bg-white border-slate-200"
                  placeholder="Enter title..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                  Slug
                </label>
                <input
                  type="text"
                  value={category?.slug || ""}
                  readOnly
                  className="w-full border p-3 text-[16px] shadow-sm focus:outline-none text-slate-900 bg-slate-100 border-slate-200 cursor-not-allowed"
                />
              </div>

            </div>
          </div>

          <div className="md:w-80 space-y-4">
            <div className="bg-white border border-slate-200 p-5 shadow-sm sticky top-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center border-b pb-3 mb-4">
                Actions
              </h3>

              <div className="flex items-center justify-between mb-6 px-1">
                <span className="text-sm font-bold text-slate-600">Active</span>
                <button
                  onClick={() =>
                    setCategory((prev) =>
                      prev
                        ? {
                            ...prev,
                            status:
                              prev.status === "active" ? "inactive" : "active",
                          }
                        : null,
                    )
                  }
                  className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${category?.status === "active" ? "bg-green-500" : "bg-slate-300"}`}
                >
                  <span
                    className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${category?.status === "active" ? "translate-x-6" : "translate-x-1"}`}
                  />
                </button>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 font-bold shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {isNewCategory ? "Create Category" : "Save Changes"}
                </button>
                <button
                  onClick={handlePreviewClick}
                  disabled={
                    isNewCategory ||
                    category === null ||
                    category?.status !== "active" ||
                    previewing
                  }
                  className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 font-bold transition-all border border-slate-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {previewing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ExternalLink className="w-4 h-4" />
                  )}
                  {previewing ? "Opening..." : "Preview Live"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        input {
          border-radius: 0 !important;
        }
        button:not(.rounded-full) {
          border-radius: 0 !important;
        }
      `}</style>
    </div>
  );
}

export default function CategoryEditWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-20">
          <Loader2 className="animate-spin" />
        </div>
      }
    >
      <EditCategoryContent />
    </Suspense>
  );
}