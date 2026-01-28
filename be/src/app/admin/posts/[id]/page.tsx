"use client";
import { useEffect, useState, useCallback, Suspense, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Editor } from "@tinymce/tinymce-react";
import type { Editor as TinyMCEEditor } from "tinymce";
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
  getPosts,
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
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [isRecommendOpen, setIsRecommendOpen] = useState(false);
  const recommendDropdownRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        recommendDropdownRef.current &&
        !recommendDropdownRef.current.contains(event.target as Node)
      ) {
        setIsRecommendOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const [displayTitle, setDisplayTitle] = useState("");
  const getCleanTitle = (htmlTitle: string | undefined): string => {
    if (!htmlTitle) return "";
    return htmlTitle
      .replace(/<[^>]*>/g, "")
      .replace(/[“”""]/g, "")
      .trim();
  };
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [typesData, categoriesData, allPostsData] = await Promise.all([
          getTypes(),
          getCategories(),
          getPosts(),
        ]);

        setTypes(typesData);
        setCategories(categoriesData);
        setAllPosts(allPostsData);

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
            recommend_post_id: null,

            show_survey: false,
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

    const newErrors: { title?: string; content?: string } = {};
    if (!displayTitle.trim()) {
      newErrors.title = "Title is required.";
    }
    // Ensure post.content is a string before trimming
    if (typeof post.content !== 'string' || !post.content.trim()) {
      newErrors.content = "Content is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill in all required fields.");
      return;
    }
    setErrors({}); // Clear errors if validation passes

    setSaving(true);

    const updatedPost = { ...post };

    if (!isNewPost && originalPost && originalPost.title) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(originalPost.title, "text/html");
      const elementToChange = doc.querySelector(".gb-headline-text");

      if (elementToChange) {
        elementToChange.textContent = displayTitle;
        updatedPost.title = doc.body.innerHTML;
      } else if (doc.body.children.length === 1) {
        const genericElement = doc.body.children[0];
        genericElement.textContent = displayTitle;
        updatedPost.title = genericElement.outerHTML;
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
        excerpt: updatedPost.excerpt,
        descrip: updatedPost.descrip,
        content: updatedPost.content,
        status: updatedPost.status,
        slug: updatedPost.slug,
        type_id: updatedPost.type_id,
        category_id: updatedPost.category_id,
        recommend_post_id: updatedPost.recommend_post_id,
        show_survey: updatedPost.show_survey,
      };
    } else {
      finalPayload = {
        title: updatedPost.title,
        excerpt: updatedPost.excerpt,
        content: updatedPost.content,
        status: updatedPost.status,
        category_id: updatedPost.category_id,
        recommend_post_id: updatedPost.recommend_post_id,
        show_survey: updatedPost.show_survey,
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
      toast.success("Post updated successfully!");
      setOriginalPost(post);

      const navigate = () => {
        if (isNewPost) {
          router.replace(`/posts/${responseData.id}`);
        } else if (
          post.slug &&
          originalPost &&
          post.slug !== originalPost.slug
        ) {
          const newUrl = post.type?.id
            ? `/posts/${post.slug}?type=${post.type.id}`
            : `/posts/${post.slug}`;
          router.push(newUrl);
        }
      };
      setTimeout(navigate, 100);
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
    post.category_id === null
      ? "No Category"
      : categories.find((c) => c.id === post.category_id)?.title ||
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
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                )}
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
                      setPost((prev) =>
                        prev ? { ...prev, content: content } : null,
                      )
                    }
                  />
                </div>
                {errors.content && (
                  <p className="text-red-500 text-xs mt-1">{errors.content}</p>
                )}
              </div>

              <div className="mt-6">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                  Thumbnail URL
                </label>
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Ô nhập link */}
                  <div className="flex-1">
                    <input
                      type="text"
                      value={post.thumbnail_url || ""}
                      onChange={(e) =>
                        setPost((prev) =>
                          prev
                            ? { ...prev, thumbnail_url: e.target.value }
                            : null,
                        )
                      }
                      className="w-full border p-3 text-[14px] shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 bg-white border-slate-200"
                      placeholder="e.g. 07/image-name.jpg"
                    />
                    <p className="mt-1 text-[10px] text-slate-400 italic">
                      Enter the corresponding path (number/abc.jpg) or absolute
                      link.{" "}
                    </p>
                  </div>

                  <div className="w-full md:w-32 h-20 bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden shadow-inner">
                    {post.thumbnail_url ? (
                      <img
                        src={
                          post.thumbnail_url.startsWith("http")
                            ? post.thumbnail_url
                            : `/images/${post.thumbnail_url}`
                        }
                        alt="Thumbnail Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://placehold.co/100x100?text=Error";
                        }}
                      />
                    ) : (
                      <span className="text-[10px] text-slate-300">
                        No Image
                      </span>
                    )}
                  </div>
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

                <div className="flex items-center justify-between px-1">
                  <label
                    htmlFor="survey-toggle"
                    className="text-sm font-bold text-slate-600"
                  >
                    Show Survey
                  </label>
                  <button
                    id="survey-toggle"
                    onClick={() =>
                      setPost((prev) =>
                        prev
                          ? {
                              ...prev,
                              show_survey: !prev.show_survey,
                            }
                          : null,
                      )
                    }
                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-all duration-300 ${
                      post.show_survey ? "bg-blue-500" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`inline-block w-4 h-4 transform bg-white rounded-full transition-all duration-300 ${
                        post.show_survey ? "translate-x-6" : "translate-x-1"
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
                      <li
                        onClick={() => {
                          setPost((prev) =>
                            prev ? { ...prev, category_id: null } : null,
                          );
                          setIsCategoryOpen(false);
                        }}
                        className="px-4 py-2 cursor-pointer hover:bg-blue-50 text-slate-600 hover:text-blue-600"
                      >
                        No Category
                      </li>
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

                <div className="relative" ref={recommendDropdownRef}>
                  <button
                    onClick={() => setIsRecommendOpen(!isRecommendOpen)}
                    className="flex items-center justify-between w-full bg-white border border-slate-200 p-3 text-[16px] shadow-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900"
                  >
                    <span className="text-left truncate pr-2">
                      {post.recommend_post_id
                        ? getCleanTitle(
                            allPosts.find(
                              (p) => p.id === post.recommend_post_id,
                            )?.title,
                          ) || "Select Post"
                        : "No Recommendation"}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform text-slate-400 ${isRecommendOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isRecommendOpen && (
                    <div className="absolute top-full mt-1 left-0 w-full bg-white border border-slate-200 shadow-lg z-20">
                      <div className="p-2 border-b border-slate-100 bg-slate-50">
                        <input
                          type="text"
                          placeholder="Search by title..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full p-2 text-sm border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500/30 rounded-none"
                          autoFocus
                        />
                      </div>

                      <ul className="max-h-60 overflow-y-auto py-1 font-medium text-sm">
                        <li
                          onClick={() => {
                            setPost((prev) =>
                              prev
                                ? { ...prev, recommend_post_id: null }
                                : null,
                            );
                            setIsRecommendOpen(false);
                            setSearchTerm(""); // Reset search khi chọn
                          }}
                          className="px-4 py-2 cursor-pointer hover:bg-blue-50 text-slate-600 hover:text-blue-600 border-b border-slate-50"
                        >
                          No Recommendation
                        </li>

                        {allPosts
                          .filter((p) => {
                            const cleanTitle = getCleanTitle(
                              p.title,
                            ).toLowerCase();
                            const searchLower = searchTerm.toLowerCase();
                            return (
                              p.id !== post.id && // Không tự gợi ý chính nó
                              p.status === "active" && // Chỉ lấy bài active
                              cleanTitle.includes(searchLower) // Lọc theo từ khóa tìm kiếm
                            );
                          })
                          .map((p) => (
                            <li
                              key={p.id}
                              onClick={() => {
                                setPost((prev) =>
                                  prev
                                    ? { ...prev, recommend_post_id: p.id }
                                    : null,
                                );
                                setIsRecommendOpen(false);
                                setSearchTerm(""); // Reset search khi chọn
                              }}
                              className={`px-4 py-2 cursor-pointer hover:bg-blue-50 text-slate-600 transition-colors border-b border-slate-50 last:border-0 ${
                                post.recommend_post_id === p.id
                                  ? "bg-blue-50 text-blue-600 font-bold"
                                  : ""
                              }`}
                            >
                              <div className="text-[13px] line-clamp-1">
                                {getCleanTitle(p.title) || p.slug}
                              </div>
                              <div className="text-[10px] text-slate-400 font-normal">
                                ID: {p.id} - Slug: {p.slug}
                              </div>
                            </li>
                          ))}

                        {/* Hiển thị khi không tìm thấy kết quả */}
                        {allPosts.filter(
                          (p) =>
                            p.status === "active" &&
                            getCleanTitle(p.title)
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()),
                        ).length === 0 && (
                          <li className="px-4 py-3 text-center text-slate-400 text-xs italic">
                            No posts found matching {searchTerm}
                          </li>
                        )}
                      </ul>
                    </div>
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