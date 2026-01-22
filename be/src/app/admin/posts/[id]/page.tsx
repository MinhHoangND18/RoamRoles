"use client";
import { useEffect, useState, useCallback, Suspense, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Editor } from "@tinymce/tinymce-react";
import {
  Save,
  ArrowLeft,
  Loader2,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";
import { Post, Type, Category } from "@/types";
import { getCategories } from "@/lib/api/categories";
import {
  getTypes,
  checkSlugUniqueness as apiCheckSlug,
  getPost,
  createPost,
  updatePost,
} from "@/lib/api/posts";
import { APP_CONFIG } from "@/lib/api/config";

interface ApiError {
  message?: string;
  [key: string]: unknown;
}

function EditPostContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNewPost = params.id === "add";

  const [post, setPost] = useState<Post | null>(null);
  const [originalPost, setOriginalPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [types, setTypes] = useState<Type[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCategoryOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const [displayTitle, setDisplayTitle] = useState("");

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [typesData, categoriesData] = await Promise.all([
          getTypes(),
          getCategories(),
        ]);

        setTypes(typesData);
        setCategories(categoriesData);

        if (isNewPost) {
          setPost({
            title: "",
            excerpt: "",
            descrip: "",
            content: "",
            status: "active",
            slug: "",
            type_id: 1,
            category_id: null,
          } as Post);
          setDisplayTitle("");
          setLoading(false);
        } else {
          const type = searchParams.get("type");
          const data = await getPost(
            params.id as string,
            { lookupType: "id" },
            type,
          );

          if (data && data.title) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(data.title, "text/html");
            const specificEl = doc.querySelector(".gb-headline-text");
            const text = specificEl
              ? specificEl.textContent || ""
              : doc.body.textContent || "";
            setDisplayTitle(text.trim());
          }

          setPost(data);
          setOriginalPost(data);
        }
      } catch (error: unknown) {
        console.error("Error fetching data:", error);
        setPost(null);
      } finally {
        if (!isNewPost) {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [params.id, searchParams, isNewPost]);

  const handleSave = async () => {
    if (!post) {
      toast.error("Cannot save, post data is not available.");
      return;
    }

    setSaving(true);

    // Create a mutable copy of the post to update the title
    const updatedPost = { ...post };

    if (!isNewPost && originalPost && originalPost.title) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(originalPost.title, "text/html");
      const elementToChange = doc.querySelector(".gb-headline-text");

      if (elementToChange) {
        elementToChange.textContent = displayTitle;
        updatedPost.title = doc.body.innerHTML;
      } else {
        updatedPost.title = displayTitle;
      }
    } else {
      updatedPost.title = `<span class="gb-headline-text">${displayTitle}</span>`;
    }

    let finalPayload: Partial<Post>;

    if (isNewPost) {
      finalPayload = {
        title: updatedPost.title,
        title_header: displayTitle,
        excerpt: updatedPost.excerpt,
        descrip: updatedPost.descrip,
        content: updatedPost.content,
        status: updatedPost.status,
        slug: updatedPost.slug,
        type_id: updatedPost.type_id,
        category_id: updatedPost.category_id,
      };
    } else {
      finalPayload = {
        title: updatedPost.title,
        title_header: displayTitle,
        excerpt: updatedPost.excerpt,
        content: updatedPost.content,
        status: updatedPost.status,
        category_id: updatedPost.category_id,
      };
    }

    try {
      let responseData;
      if (isNewPost) {
        responseData = await createPost(finalPayload);
      } else {
        responseData = await updatePost(params.id as string, finalPayload);
      }

      setSaving(false);
      toast.success("Database updated successfully!");
      setOriginalPost(post);

      if (isNewPost) {
        router.replace(`/admin/posts/${responseData.id}`);
      } else if (post.slug && originalPost && post.slug !== originalPost.slug) {
        const newUrl = post.type?.id
          ? `/admin/posts/${post.slug}?type=${post.type.id}`
          : `/admin/posts/${post.slug}`;
        router.push(newUrl);
      }
    } catch (error: unknown) {
      setSaving(false);
      const err = error as ApiError;
      toast.error(`Error saving: ${err.message || "Unknown error"}`);
    }
  };

  const handleOverviewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (originalPost?.slug) {
      setPreviewing(true);
      const url = `${APP_CONFIG.FRONTEND_URL}/${originalPost.slug}`;
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

  if (!post) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#f8fafc]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">Error</h2>
          <p className="text-slate-500">Post not found or failed to load.</p>
          <button
            onClick={() => router.back()}
            className="mt-4 flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-all font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back to list
          </button>
        </div>
      </div>
    );
  }

  const selectedCategoryName =
    categories.find((c) => c.id === post.category_id)?.title ||
    "Select Category";

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-12">
      <div className="max-w-full mx-auto">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-all font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back to list
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-grow">
            <div className="bg-white border border-slate-200 p-8 shadow-sm space-y-6">
              <div>
                <label
                  htmlFor="title"
                  className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1"
                >
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={displayTitle}
                  onChange={(e) => {
                    const newTitleText = e.target.value;
                    setDisplayTitle(newTitleText);
                    if (isNewPost) {
                      setPost((prev) =>
                        prev ? { ...prev, title: newTitleText } : null,
                      );
                    }
                  }}
                  onBlur={() => {
                    if (isNewPost) {
                      const baseSlug = generateSlug(displayTitle);
                      setPost((prev) =>
                        prev ? { ...prev, slug: baseSlug } : null,
                      );
                    }
                  }}
                  className="w-full border p-3 text-[16px] shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 bg-white border-slate-200"
                  placeholder="Enter Title..."
                />
              </div>

              <div>
                <label
                  htmlFor="slug"
                  className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1"
                >
                  Slug
                </label>
                <input
                  id="slug"
                  type="text"
                  value={post.slug || ""}
                  readOnly
                  className="w-full border p-3 text-[16px] shadow-sm focus:outline-none text-slate-900 bg-slate-100 border-slate-200 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                  Excerpt
                </label>
                <div className="editor-wrapper no-border-ui">
                  {" "}
                  <Editor
                    apiKey="vb3rf5t71lcc6x2a1imujbsh6uea23dz7zqhe6b2q1it3q8u"
                    value={post.excerpt}
                    init={{
                      height: 150,
                      menubar: false,
                      branding: false,
                      plugins: ["code", "wordcount"],
                      toolbar: "undo redo | bold italic | code",
                      content_style:
                        "body { font-family:Inter,Arial,sans-serif; font-size:16px }",
                    }}
                    onEditorChange={(content: string) =>
                      setPost((prev) =>
                        prev ? { ...prev, excerpt: content } : null,
                      )
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                  Content
                </label>
                <div className="editor-wrapper no-border-ui">
                  <Editor
                    apiKey="vb3rf5t71lcc6x2a1imujbsh6uea23dz7zqhe6b2q1it3q8u"
                    value={post.content}
                    init={{
                      height: 600,
                      menubar: false,
                      branding: false,
                      help_accessibility: false,
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
                    }}
                    onEditorChange={(content: string) =>
                      setPost((prev) =>
                        prev ? { ...prev, content: content } : null,
                      )
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="md:w-72 lg:w-80 flex-shrink-0">
            <div className="sticky top-12">
              <div className="bg-white border border-slate-200 shadow-sm p-5 w-full space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center border-b pb-3 mb-4">
                  Actions
                </h3>

                <div className="flex items-center justify-between px-1">
                  <label
                    htmlFor="status-toggle"
                    className="text-sm font-bold text-slate-600"
                  >
                    Active
                  </label>
                  <button
                    id="status-toggle"
                    onClick={() =>
                      setPost((prev) =>
                        prev
                          ? {
                              ...prev,
                              status:
                                prev.status === "active"
                                  ? "inactive"
                                  : "active",
                            }
                          : null,
                      )
                    }
                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-all duration-300 ${
                      post.status === "active" ? "bg-green-500" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`inline-block w-4 h-4 transform bg-white rounded-full transition-all duration-300 ${
                        post.status === "active"
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="relative" ref={categoryDropdownRef}>
                  <button
                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                    className="flex items-center justify-between w-full bg-white border border-slate-200 p-3 text-[16px] shadow-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900"
                  >
                    <span className="text-left">{selectedCategoryName}</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform text-slate-400 ${
                        isCategoryOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isCategoryOpen && (
                    <ul className="absolute top-full mt-1 left-0 w-full bg-white border border-slate-200 shadow-lg py-1 z-20 font-medium text-sm">
                      {categories.map((category) => (
                        <li
                          key={category.id}
                          onClick={() => {
                            setPost((prev) =>
                              prev
                                ? { ...prev, category_id: category.id }
                                : null,
                            );
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

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saving ? "Saving..." : "Save Content"}
                </button>

                <button
                  onClick={handleOverviewClick}
                  disabled={
                    isNewPost ||
                    originalPost === null ||
                    originalPost?.status !== "active" ||
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

export default function EditPostPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen bg-[#f8fafc]">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        </div>
      }
    >
      <EditPostContent />
    </Suspense>
  );
}