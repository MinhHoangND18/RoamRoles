"use client";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { Editor } from "@tinymce/tinymce-react";
import { Save, ArrowLeft, Loader2, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import { Page } from "@/types";
import type { Editor as TinyMCEEditor } from "tinymce";

import {
  getPage,
  createPage,
  updatePage,
  checkSlugUniqueness as apiCheckSlug,
} from "@/lib/api/pages";
import { APP_CONFIG } from "@/lib/api/config";

function EditPageContent() {
  const params = useParams();
  const router = useRouter();
  const isNewPage = params.id === "add";

  const [page, setPage] = useState<Page | null>(null);
  const [originalPage, setOriginalPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [displayTitle, setDisplayTitle] = useState("");

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");
  };

  const extractTitleText = (htmlTitle: string) => {
    if (!htmlTitle) return "";
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlTitle, "text/html");

    const specificEl = doc.querySelector(".gb-headline-text");
    const text = specificEl
      ? specificEl.textContent || ""
      : doc.body.textContent || "";
    return text.trim();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isNewPage) {
          setPage({
            title: "",
            content: "",
            status: "active",
            slug: "",
          } as Page);
          setDisplayTitle("");
        } else {
          const data = await getPage(params.id as string);
          if (data) {
            setPage(data);
            setOriginalPage(data);
            setDisplayTitle(extractTitleText(data.title));
          }
        }
      } catch (error) {
        toast.error("Failed to load page data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.id, isNewPage]);

  const handleOverviewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (originalPage?.slug) {
      setPreviewing(true);
      const url = `${APP_CONFIG.FRONTEND_URL}/${originalPage.slug}`;
      window.open(url, "_blank");
      setTimeout(() => setPreviewing(false), 1000);
    }
  };

  const handleSave = async () => {
    if (!page) return;

    if (!isNewPage && originalPage) {
      const hasTitleChanged =
        displayTitle !== extractTitleText(originalPage.title);
      const hasContentChanged = page.content !== originalPage.content;
      const hasStatusChanged = page.status !== originalPage.status;

      if (!hasTitleChanged && !hasContentChanged && !hasStatusChanged) {
        toast.success("Page updated successfully!");
        return;
      }
    }

    setSaving(true);

    const updatedPage = { ...page };
    if (!isNewPage && originalPage?.title) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(originalPage.title, "text/html");
      const elementToChange = doc.querySelector(".gb-headline-text");
      if (elementToChange) {
        elementToChange.textContent = displayTitle;
        updatedPage.title = doc.body.innerHTML;
      } else {
        updatedPage.title = displayTitle;
      }
    } else {
      updatedPage.title = `<span class="gb-headline-text">${displayTitle}</span>`;
    }

    try {
      if (isNewPage) {
        const res = await createPage(updatedPage);
        toast.success("Page created!");
        router.replace(`/admin/pages/${res.id}`);
      } else {
        await updatePage(page.slug, updatedPage);
        toast.success("Page updated successfully!");
        setOriginalPage(updatedPage);
      }
    } catch (error) {
      toast.error("Save failed");
    } finally {
      setSaving(false);
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
          className="flex items-center gap-2 text-slate-500 mb-8 font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to post
        </button>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-grow space-y-6">
            <div className="bg-white border border-slate-200 p-8 shadow-sm space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                  Title
                </label>
                <input
                  type="text"
                  value={displayTitle}
                  onChange={(e) => {
                    const newTitleText = e.target.value;
                    setDisplayTitle(newTitleText);
                    if (isNewPage) {
                      setPage((prev) =>
                        prev ? { ...prev, title: newTitleText } : null,
                      );
                    }
                  }}
                  onBlur={() => {
                    if (isNewPage) {
                      const baseSlug = generateSlug(displayTitle);
                      setPage((prev) =>
                        prev ? { ...prev, slug: baseSlug } : null,
                      );
                    }
                  }}
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
                  value={page?.slug || ""}
                  readOnly
                  className="w-full border p-3 text-[16px] shadow-sm focus:outline-none text-slate-900 bg-slate-100 border-slate-200 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                  Content
                </label>
                <div className="editor-wrapper no-border-ui">
                  <Editor
                    apiKey="vb3rf5t71lcc6x2a1imujbsh6uea23dz7zqhe6b2q1it3q8u"
                    value={page?.content}
                    init={{
                      height: 600,
                      menubar: false,
                      branding: false,
                      help_accessibility: false,
                      auto_focus: false,
                      toolbar_mode: "wrap",
                      plugins: [
                        "advlist",
                        "autolink",
                        "lists",
                        "link",
                        "image",
                        "charmap",
                        "preview",
                        "anchor",
                        "searchreplace",
                        "visualblocks",
                        "code",
                        "fullscreen",
                        "insertdatetime",
                        "media",
                        "table",
                        "help",
                        "wordcount",
                        "emoticons",
                      ],
                      toolbar:
                        "undo redo | blocks fontfamily fontsize | " +
                        "bold italic underline strikethrough | link image media table mergetags | " +
                        "align lineheight | checklist numlist bullist indent outdent | " +
                        "emoticons charmap | removeformat | code fullscreen preview",
                      content_style:
                        "body { font-family:Inter,Arial,sans-serif; font-size:16px }",
                      skin: "oxide",
                      setup: (editor: TinyMCEEditor) => {
                        editor.on("ExecCommand", (e: { command: string }) => {
                          if (e.command === "mceCodeEditor") {
                            let attempts = 0;
                            const forceScrollTop = setInterval(() => {
                              const textarea = document.querySelector(
                                ".tox-dialog-wrap__backdrop + .tox-dialog-wrap .tox-textarea",
                              ) as HTMLTextAreaElement;

                              if (textarea) {
                                textarea.setSelectionRange(0, 0);
                                textarea.scrollTop = 0;
                                textarea.focus();

                                if (textarea.scrollTop === 0 || attempts > 10) {
                                  clearInterval(forceScrollTop);
                                }
                              }
                              attempts++;
                            }, 50); 
                          }
                        });

                        editor.on("OpenWindow", () => {
                          setTimeout(() => {
                            const textarea = document.querySelector(
                              ".tox-textarea",
                            ) as HTMLTextAreaElement;
                            if (textarea) {
                              textarea.scrollTop = 0;
                              textarea.setSelectionRange(0, 0);
                            }
                          }, 200);
                        });
                      },
                    }}
                    onEditorChange={(content: string) =>
                      setPage((prev) =>
                        prev ? { ...prev, content: content } : null,
                      )
                    }
                  />
                </div>
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
                    setPage((prev) =>
                      prev
                        ? {
                            ...prev,
                            status:
                              prev.status === "active" ? "inactive" : "active",
                          }
                        : null,
                    )
                  }
                  className={`relative inline-flex items-center h-6 rounded-full w-11 transition ${page?.status === "active" ? "bg-green-500" : "bg-slate-300"}`}
                >
                  <span
                    className={`inline-block w-4 h-4 transform bg-white rounded-full transition ${page?.status === "active" ? "translate-x-6" : "translate-x-1"}`}
                  />
                </button>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 font-bold shadow-md transition disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saving ? "Saving..." : "Save Page"}
                </button>
                <button
                  onClick={handleOverviewClick}
                  disabled={
                    isNewPage ||
                    originalPage === null ||
                    originalPage?.status !== "active" ||
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
        .no-border-ui .tox-tinymce {
          border: 1px solid #e2e8f0 !important;
          border-radius: 0 !important;
        }
      `}</style>
    </div>
  );
}

export default function Wrapper() {
  return (
    <Suspense>
      <EditPageContent />
    </Suspense>
  );
}