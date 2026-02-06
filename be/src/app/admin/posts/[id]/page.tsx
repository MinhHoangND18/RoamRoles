"use client";
import { useEffect, useState, useCallback, Suspense, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Editor } from "@tinymce/tinymce-react";
import type { Editor as TinyMCEEditor } from "tinymce";
import { SurveySet } from "@/types/survey_question";
import { getSurveySets } from "@/lib/api/survey";

import {
  Save,
  ArrowLeft,
  Loader2,
  ExternalLink,
  ChevronDown,
  Copy,
  Plus,
  Box,
  Search,
  Eye,
  X,
  Pencil,
} from "lucide-react";
import toast from "react-hot-toast";
import { Post, Type, Category, ReusableBlock } from "@/types";
import {
  processThumbnailUrl,
  isExternalUrl,
  uploadFile,
  getThumbnailDisplayUrl,
} from "@/lib/api/upload";
import { getCategories } from "@/lib/api/categories";
import {
  getTypes,
  checkSlugUniqueness as apiCheckSlug,
  getPost,
  getPosts,
  createPost,
  updatePost,
} from "@/lib/api/posts";
import {
  getReusableBlockById,
  getReusableBlocks,
  createOrUpdateReusableBlock,
} from "@/lib/api/reusable_blocks";
import JobBoxRenderer from "@/components/JobBoxRenderer";
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
  const [errors, setErrors] = useState<{ title?: string; content?: string }>(
    {},
  );

  const [editorsReadyCount, setEditorsReadyCount] = useState(0);
  const [surveySets, setSurveySets] = useState<SurveySet[]>([]);
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);
  const surveyDropdownRef = useRef<HTMLDivElement>(null);
  const [surveySearchTerm, setSurveySearchTerm] = useState("");

  const [filterType, setFilterType] = useState("all");
  const [reusableBlocks, setReusableBlocks] = useState<ReusableBlock[]>([]);
  const [isBlockDropdownOpen, setIsBlockDropdownOpen] = useState(false);
  const [blockSearchTerm, setBlockSearchTerm] = useState("");
  const blockDropdownRef = useRef<HTMLDivElement>(null);
  const [isTypeFilterOpen, setIsTypeFilterOpen] = useState(false);
  const typeFilterDropdownRef = useRef<HTMLDivElement>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);
  const statusFilterDropdownRef = useRef<HTMLDivElement>(null);
  const [blockForEditing, setBlockForEditing] = useState<number | "new" | null>(
    null,
  );
  const loadReusableBlocks = useCallback(async () => {
    try {
      const data = await getReusableBlocks();
      setReusableBlocks(data);
    } catch (error) {
      toast.error("Failed to refresh blocks");
    }
  }, []);

  useEffect(() => {
    loadReusableBlocks();
  }, [loadReusableBlocks]);

  useEffect(() => {
    getReusableBlocks()
      .then(setReusableBlocks)
      .catch(() => toast.error("Failed to load blocks"));
  }, []);

  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setUploading(true);
    toast.loading("Uploading image...", { id: "upload-image" });

    try {
      const result = await uploadFile(file);

      if (result.success && result.local_path) {
        setPost((prev) =>
          prev ? { ...prev, thumbnail_url: result.local_path } : null,
        );
        toast.success("Image uploaded successfully!", { id: "upload-image" });
      } else {
        toast.error(result.error || "Upload failed", { id: "upload-image" });
      }
    } catch (error) {
      toast.error("Failed to upload image", { id: "upload-image" });
      console.error(error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  useEffect(() => {
    loadReusableBlocks();
  }, [loadReusableBlocks]);

  useEffect(() => {
    getReusableBlocks()
      .then(setReusableBlocks)
      .catch(() => toast.error("Failed to load blocks"));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCategoryOpen(false);
      }
      if (
        recommendDropdownRef.current &&
        !recommendDropdownRef.current.contains(event.target as Node)
      ) {
        setIsRecommendOpen(false);
      }
      if (
        surveyDropdownRef.current &&
        !surveyDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSurveyOpen(false);
      }
      if (
        blockDropdownRef.current &&
        !blockDropdownRef.current.contains(event.target as Node)
      ) {
        setIsBlockDropdownOpen(false);
      }
      if (
        typeFilterDropdownRef.current &&
        !typeFilterDropdownRef.current.contains(event.target as Node)
      ) {
        setIsTypeFilterOpen(false);
      }
      if (
        statusFilterDropdownRef.current &&
        !statusFilterDropdownRef.current.contains(event.target as Node)
      ) {
        setIsStatusFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isRecommendOpen) {
      setSearchTerm("");
    }
  }, [isRecommendOpen]);

  useEffect(() => {
    if (!isSurveyOpen) {
      setSurveySearchTerm("");
    }
  }, [isSurveyOpen]);

  useEffect(() => {
    if (!isBlockDropdownOpen) {
      setBlockSearchTerm("");
      setFilterType("all");
      setFilterStatus("all");
    }
  }, [isBlockDropdownOpen]);

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
        const [typesData, categoriesData, allPostsData, surveySetsData] =
          await Promise.all([
            getTypes(),
            getCategories(),
            getPosts(),
            getSurveySets(),
          ]);

        setTypes(typesData);
        setCategories(categoriesData);
        setAllPosts(allPostsData);
        setSurveySets(surveySetsData || []);

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
            survey_set_id: null,
            thumbnail_url: "",
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
    if (typeof post.content !== "string" || !post.content.trim()) {
      newErrors.content = "Content is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill in all required fields.");
      return;
    }
    setErrors({});

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
    let processedThumbnailUrl = updatedPost.thumbnail_url || "";
    if (processedThumbnailUrl && isExternalUrl(processedThumbnailUrl)) {
      toast.loading("Downloading external image...", { id: "download-image" });
      try {
        processedThumbnailUrl = await processThumbnailUrl(
          processedThumbnailUrl,
        );
        toast.success("Image downloaded successfully!", {
          id: "download-image",
        });
        setPost((prev) =>
          prev ? { ...prev, thumbnail_url: processedThumbnailUrl } : null,
        );
      } catch {
        toast.error("Failed to download image, using original URL", {
          id: "download-image",
        });
      }
    }

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
        survey_set_id: updatedPost.survey_set_id,
        thumbnail_url: processedThumbnailUrl,
      };
    } else {
      finalPayload = {
        title: updatedPost.title,
        excerpt: updatedPost.excerpt,
        content: updatedPost.content,
        status: updatedPost.status,
        category_id: updatedPost.category_id,
        recommend_post_id: updatedPost.recommend_post_id,
        survey_set_id: updatedPost.survey_set_id,
        thumbnail_url: processedThumbnailUrl,
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

  const showLoader = loading || (editorsReadyCount < 2 && !isNewPost);
  const loaderStyle = showLoader ? { height: "100vh", overflow: "hidden" } : {};

  if (loading || !post) {
    if (loading) {
      return (
        <div className="relative" style={loaderStyle}>
          <div className="absolute inset-0 flex justify-center items-center bg-[#f8fafc] z-50">
            <div className="flex flex-col items-center">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            </div>
          </div>
          <div
            className="min-h-screen bg-[#f8fafc] p-6 md:p-12"
            style={{ visibility: "hidden" }}
          />
        </div>
      );
    }
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

  const selectedCategory = post.category_id
    ? categories.find((c) => c.id === post.category_id)
    : null;

  return (
    <div className="relative" style={loaderStyle}>
      {showLoader && (
        <div className="absolute inset-0 flex justify-center items-center bg-[#f8fafc] z-50">
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          </div>
        </div>
      )}
      <div
        className="min-h-screen bg-[#f8fafc] p-6 md:p-12"
        style={{ visibility: showLoader ? "hidden" : "visible" }}
      >
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
                      apiKey="86ftl32z3817cvzn7pacpxi90chujfeh49xkscb688s08uud"
                      value={post.excerpt}
                      onInit={() => setEditorsReadyCount((count) => count + 1)}
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
                      apiKey="86ftl32z3817cvzn7pacpxi90chujfeh49xkscb688s08uud"
                      value={post.content}
                      onInit={() => setEditorsReadyCount((count) => count + 1)}
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

                                  if (
                                    textarea.scrollTop === 0 ||
                                    attempts > 10
                                  ) {
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
                    <p className="text-red-500 text-xs mt-1">
                      {errors.content}
                    </p>
                  )}
                </div>

                <div className="mt-6">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    Thumbnail URL
                  </label>
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* File Upload & Input */}
                    <div className="flex-1">
                      <div className="mb-3">
                        <label
                          className="block w-full border-2 border-dashed border-slate-300 hover:border-blue-400 p-4 text-center cursor-pointer rounded transition-colors bg-slate-50 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{
                            opacity: uploading ? 0.5 : 1,
                            pointerEvents: uploading ? "none" : "auto",
                          }}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <svg
                              className="w-6 h-6 text-slate-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                            <span className="text-sm font-medium text-slate-600">
                              {uploading ? "Uploading..." : "Click to upload"}
                            </span>
                            <span className="text-xs text-slate-400">
                              PNG, JPG, GIF up to 5MB
                            </span>
                          </div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            disabled={uploading}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* Or input link */}
                      <div className="relative">
                        <p className="text-[10px] text-slate-400 italic mb-2">
                          Or enter image path:
                        </p>
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
                          placeholder="e.g. /uploads/image-name.jpg"
                        />
                      </div>
                    </div>

                    {/* Thumbnail Preview */}
                    {post.thumbnail_url && (
                      <div className="md:w-48 flex-shrink-0">
                        <p className="text-[10px] text-slate-400 italic mb-2">
                          Preview:
                        </p>
                        <div className="relative aspect-video bg-slate-100 border border-slate-200 rounded overflow-hidden">
                          <img
                            src={getThumbnailDisplayUrl(post.thumbnail_url)}
                            alt="Thumbnail preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "/landscape-placeholder-svgrepo-com.svg ";
                            }}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setPost((prev) =>
                                prev ? { ...prev, thumbnail_url: "" } : null,
                              )
                            }
                            className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md transition-colors"
                            title="Remove thumbnail"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-[9px] text-slate-400 mt-1 break-all">
                          {post.thumbnail_url}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/*ACTION */}
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
                      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-all duration-300 ${post.status === "active"
                          ? "bg-green-500"
                          : "bg-slate-300"
                        }`}
                    >
                      <span
                        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-all duration-300 ${post.status === "active"
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
                      <div className="flex items-center gap-2 overflow-hidden justify-between flex-grow">
                        <span className={`text-left truncate ${selectedCategory?.status === "inactive" ? "text-slate-400 italic" : ""}`}>
                          {selectedCategory ? selectedCategory.title : (post.category_id === null ? "No Category" : "Select Category")}
                        </span>
                        {selectedCategory?.status === "inactive" && (
                          <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded flex-shrink-0 rounded-none iltalic">
                            Inactive
                          </span>
                        )}
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform text-slate-400 flex-shrink-0 ${isCategoryOpen ? "rotate-180" : ""
                          }`}
                      />
                    </button>
                    {isCategoryOpen && (
                      <ul className="absolute top-full mt-1 left-0 w-full bg-white border border-slate-200 shadow-lg py-1 z-20 font-medium text-sm max-h-60 overflow-y-auto">
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
                            className={`px-4 py-2 cursor-pointer hover:bg-blue-50 flex items-center justify-between group ${
                              category.status === "inactive"
                                ? "text-slate-400 italic"
                                : "text-slate-600 hover:text-blue-600"
                            }`}
                          >
                            <span>{category.title}</span>
                            {category.status === "inactive" && (
                              <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-none group-hover:bg-white">
                                Inactive
                              </span>
                            )}
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
                              setSearchTerm("");
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
                                p.id !== post.id &&
                                p.status === "active" &&
                                cleanTitle.includes(searchLower)
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
                                  setSearchTerm("");
                                }}
                                className={`px-4 py-2 cursor-pointer hover:bg-blue-50 text-slate-600 transition-colors border-b border-slate-50 last:border-0 ${post.recommend_post_id === p.id
                                    ? "bg-blue-50 text-blue-600 font-bold"
                                    : ""
                                  }`}
                              >
                                <div className="text-[13px] line-clamp-1">
                                  {getCleanTitle(p.title) || p.slug}
                                </div>
                                <div className="text-[10px] text-slate-400 font-normal">
                                  ID: {p.id}
                                </div>
                              </li>
                            ))}

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

                  <div className="relative" ref={surveyDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsSurveyOpen(!isSurveyOpen)}
                      className="flex items-center justify-between w-full bg-white border border-slate-200 p-3 text-[16px] shadow-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900"
                    >
                      <span className="text-left truncate pr-2">
                        {post?.survey_set_id
                          ? surveySets.find((s) => s.id === post.survey_set_id)
                            ?.name || "Select Survey"
                          : "No Survey"}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform text-slate-400 ${isSurveyOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {isSurveyOpen && (
                      <div className="absolute top-full mt-1 left-0 w-full bg-white border border-slate-200 shadow-lg z-20">
                        <div className="p-2 border-b border-slate-100 bg-slate-50">
                          <input
                            type="text"
                            placeholder="Search survey set..."
                            value={surveySearchTerm}
                            onChange={(e) =>
                              setSurveySearchTerm(e.target.value)
                            }
                            className="rounded-none w-full p-2 text-sm border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                            autoFocus
                          />
                        </div>

                        <ul className="max-h-60 overflow-y-auto py-1 font-medium text-sm">
                          <li
                            onClick={() => {
                              setPost((prev) =>
                                prev ? { ...prev, survey_set_id: null } : null,
                              );
                              setIsSurveyOpen(false);
                              setSurveySearchTerm("");
                            }}
                            className="px-4 py-2 cursor-pointer hover:bg-blue-50 text-slate-600 hover:text-blue-600 border-b border-slate-50"
                          >
                            No Survey
                          </li>

                          {surveySets
                            .filter((s) => {
                              const searchLower =
                                surveySearchTerm.toLowerCase();
                              return (
                                s.active && 
                                (s.name.toLowerCase().includes(searchLower) ||
                                  s.slug.toLowerCase().includes(searchLower))
                              );
                            })
                            .map((s) => (
                              <li
                                key={s.id}
                                onClick={() => {
                                  setPost((prev) =>
                                    prev
                                      ? { ...prev, survey_set_id: s.id }
                                      : null,
                                  );
                                  setIsSurveyOpen(false);
                                  setSurveySearchTerm("");
                                }}
                                className={`px-4 py-2 cursor-pointer hover:bg-blue-50 text-slate-600 transition-colors border-b border-slate-50 last:border-0 ${post?.survey_set_id === s.id
                                    ? "bg-blue-50 text-blue-600 font-bold"
                                    : ""
                                  }`}
                              >
                                <div className="text-[13px] line-clamp-1">
                                  {s.name}
                                </div>
                                <div className="text-[10px] text-slate-400 font-normal">
                                  ID: {s.id} - Slug: {s.slug}
                                  {s.description && ` - ${s.description}`}
                                </div>
                              </li>
                            ))}

                          {surveySets.filter((s) =>
                            s.name
                              .toLowerCase()
                              .includes(surveySearchTerm.toLowerCase()),
                          ).length === 0 && (
                              <li className="px-4 py-3 text-center text-slate-400 text-xs">
                                No survey sets found matching {surveySearchTerm}
                              </li>
                            )}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* REUSABLE BLOCKS */}
                  <div className="relative" ref={blockDropdownRef}>
                    <button
                      onClick={() =>
                        setIsBlockDropdownOpen(!isBlockDropdownOpen)
                      }
                      className="flex items-center justify-between w-full bg-white border border-slate-200 p-3 text-[16px] shadow-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900"
                    >
                      <div className="text-left truncate pr-2">
                        <span>ShortCode Blocks</span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform text-slate-400 ${isBlockDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {isBlockDropdownOpen && (
                      <div className="absolute mb-2 bottom-full mt-2 left-0 w-full bg-white border border-slate-200 shadow-xl z-[100] animate-in fade-in slide-in-from-top-2">
                        <div className="p-2 border-b border-slate-100 bg-slate-50 flex gap-1">
                          <div className="relative flex-grow">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                            <input
                              type="text"
                              placeholder="Find block..."
                              value={blockSearchTerm}
                              onChange={(e) =>
                                setBlockSearchTerm(e.target.value)
                              }
                              className="w-full pl-7 pr-2 py-1.5 text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                            />
                          </div>

                          <div className="relative" ref={typeFilterDropdownRef}>
                            <button
                              onClick={() =>
                                setIsTypeFilterOpen(!isTypeFilterOpen)
                              }
                              className="flex items-center justify-between bg-white border border-slate-200 px-2 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 w-19"
                            >
                              <span className="text-left whitespace-nowrap truncate">
                                {{
                                  all: "All Types",
                                  job_card: "Job Card",
                                  feature_list: "Feature List",
                                  faq_accordion: "FAQ",
                                }[filterType] || "All Types"}
                              </span>
                              <ChevronDown
                                className={`w-3 h-3 transition-transform text-slate-400 ml-2 shrink-0 ${isTypeFilterOpen ? "rotate-180" : ""}`}
                              />
                            </button>
                            {isTypeFilterOpen && (
                              <ul className="absolute top-full mt-1 right-0 w-auto bg-white border border-slate-200 shadow-lg py-1 z-30 font-medium text-xs">
                                {[
                                  { value: "all", label: "All Types" },
                                  { value: "job_card", label: "Job Card" },
                                  {
                                    value: "feature_list",
                                    label: "Feature List",
                                  },
                                  { value: "faq_accordion", label: "FAQ" },
                                ].map((option) => (
                                  <li
                                    key={option.value}
                                    onClick={() => {
                                      setFilterType(option.value);
                                      setIsTypeFilterOpen(false);
                                    }}
                                    className="px-1.5 py-1.5 cursor-pointer hover:bg-blue-50 text-slate-600 hover:text-blue-600 whitespace-nowrap"
                                  >
                                    {option.label}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                           <div className="relative" ref={statusFilterDropdownRef}>
                            <button
                              onClick={() =>
                                setIsStatusFilterOpen(!isStatusFilterOpen)
                              }
                              className="flex items-center justify-between bg-white border border-slate-200 px-2 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 w-19"
                            >
                              <span className="text-left whitespace-nowrap truncate">
                                {{
                                  all: "All Statuses",
                                  active: "Active",
                                  inactive: "Inactive",
                                }[filterStatus] || "All Statuses"}
                              </span>
                              <ChevronDown
                                className={`w-3 h-3 transition-transform text-slate-400 ml-2 shrink-0 ${isStatusFilterOpen ? "rotate-180" : ""}`}
                              />
                            </button>
                            {isStatusFilterOpen && (
                              <ul className="absolute top-full mt-1 right-0 w-auto bg-white border border-slate-200 shadow-lg py-1 z-30 font-medium text-xs">
                                {[
                                  { value: "all", label: "All Statuses" },
                                  { value: "active", label: "Active" },
                                  { value: "inactive", label: "Inactive" },
                                ].map((option) => (
                                  <li
                                    key={option.value}
                                    onClick={() => {
                                      setFilterStatus(option.value);
                                      setIsStatusFilterOpen(false);
                                    }}
                                    className="px-1.5 py-1.5 cursor-pointer hover:bg-blue-50 text-slate-600 hover:text-blue-600 whitespace-nowrap"
                                  >
                                    {option.label}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>

                        <ul className="max-h-60 overflow-y-auto py-1">
                          {(() => {
                            const filteredBlocks = reusableBlocks.filter(
                              (b) => {
                                const blockData = JSON.parse(
                                  b.content_json || "{}",
                                );
                                const bType = blockData.type || "job_card";
                                const searchLower =
                                  blockSearchTerm.toLowerCase();
                                const shortcode = `[block id="${b.id}"]`;
                                const matchesSearch =
                                  b.title
                                    .toLowerCase()
                                    .includes(searchLower) ||
                                  shortcode.includes(searchLower);
                                const matchesType =
                                  filterType === "all" || bType === filterType;
                                const matchesStatus =
                                  filterStatus === "all" ||
                                  b.status === filterStatus;
                                return (
                                  matchesSearch && matchesType && matchesStatus
                                );
                              },
                            );

                            if (filteredBlocks.length === 0) {
                              return (
                                <li className="px-4 py-3 text-center text-slate-400 text-xs">
                                  No blocks found
                                </li>
                              );
                            }

                            return filteredBlocks.map((block) => {
                              const blockData = JSON.parse(
                                block.content_json || "{}",
                              );
                              const blockType = blockData.type || "job_card";

                              return (
                                <li
                                  key={block.id}
                                  className="px-4 py-3 border-b border-slate-50 last:border-0 hover:bg-blue-50 group transition-colors"
                                >
                                  <div className="flex items-center justify-between gap-5">
                                    <div className="flex items-center gap-2 flex-grow min-w-0">
                                      <span className="text-[13px] font-bold text-slate-700 truncate">
                                        {block.title}
                                      </span>
                                    </div>

                                    <div className="flex items-center shrink-0 ml-auto">
                                      <button
                                        onClick={() =>
                                          setBlockForEditing(block.id)
                                        }
                                        className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition-colors rounded-none"
                                        title="Edit"
                                      >
                                        <Pencil className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => {
                                          navigator.clipboard.writeText(
                                            `[block id="${block.id}"]`,
                                          );
                                          toast.success("Copied!");
                                        }}
                                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-md transition-colors rounded-none"
                                        title="Copy Shortcode"
                                      >
                                        <Copy className="w-3.5 h-3.5 " />
                                      </button>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between gap-3">
                                    <div className="text-[10px] font-mono text-slate-400 group-hover:text-blue-400 transition-colors mt-0.5">
                                      {`[block id="${block.id}"]`}
                                    </div>

                                    <div className="flex items-center gap-2 flex-grow min-w-0 justify-end">
                                      <span
                                        className={`flex-shrink-0 text-[8px] font-black uppercase px-1.5 py-0.5 ${
                                          blockType === "faq_accordion"
                                            ? "bg-purple-100 text-purple-600 rounded-none"
                                            : blockType === "feature_list"
                                              ? "bg-orange-100 text-orange-600 rounded-none"
                                              : "bg-blue-100 text-blue-600 rounded-none"
                                        }`}
                                      >
                                        {blockType === "faq_accordion"
                                          ? "FAQ"
                                          : blockType === "feature_list"
                                            ? "Feature List"
                                            : "Job Card"}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-2 flex-grow min-w-0 justify-end">
                                      <span
                                        className={`flex-shrink-0 text-[8px] font-black uppercase px-1.5 py-0.5 rounded-none ${
                                          block.status === "active"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"
                                        }`}
                                      >
                                        {block.status}
                                      </span>
                                    </div>
                                  </div>
                                </li>
                              );
                            });
                          })()}
                        </ul>

                        <div className="p-2 border-t border-slate-100">
                          <button
                            onClick={() => setBlockForEditing("new")}
                            className="w-full py-2 bg-slate-50 border border-dashed border-slate-300 text-slate-500 text-[11px] font-bold hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 flex items-center justify-center gap-2 transition-all"
                          >
                            <Plus className="w-3 h-3" /> Create New
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleSave}
                    disabled={saving || uploading}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {saving || uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {saving
                      ? "Saving..."
                      : uploading
                        ? "Uploading Image..."
                        : "Save Content"}
                  </button>

                  <button
                    onClick={handleOverviewClick}
                    disabled={
                      isNewPost ||
                      originalPost === null ||
                      originalPost?.status !== "active" ||
                      categories.find((c) => c.id === originalPost?.category_id)?.status ===
                        "inactive" ||
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

        {blockForEditing !== null && (
          <QuickEditBlockPopup
            blockId={blockForEditing === "new" ? undefined : blockForEditing}
            onClose={() => setBlockForEditing(null)}
            onSuccess={() => {
              loadReusableBlocks();
              setBlockForEditing(null);
            }}
          />
        )}

        <style jsx global>{`
          .no-border-ui .tox-tinymce {
            border: 1px solid #e2e8f0 !important;

            border-radius: 0 !important;
          }
          .reusable-block-scope .row {
            display: flex !important;
            flex-wrap: wrap !important;
          }
          .reusable-block-scope .col-lg-5,
          .reusable-block-scope .col-md-5 {
            position: relative !important;
            width: 100% !important;
            flex: 0 0 41.666667% !important;
            max-width: 41.666667% !important;
          }
          .reusable-block-scope .col-lg-7,
          .reusable-block-scope .col-md-7 {
            flex: 0 0 58.333333% !important;
            max-width: 58.333333% !important;
          }
          .reusable-block-scope img {
            max-width: 100% !important;
            height: auto !important;
          }import { ReusableBlock } from './../../../../../../fe/src/types/ReusableBlock';

        `}</style>
      </div>
    </div>
  );
}

const initialBlockContent = {
  heading: "",
  company_name: "",
  badge_text: "",
  description: "",
  image_url: "",
  button_text: "",
  button_url: "",
  footer_text: "",
  type: "job_card",
  features: [] as string[],
  items: [] as { q: string; a: string }[],
  layout: "standard",
};

function QuickEditBlockPopup({
  blockId,
  onClose,
  onSuccess,
}: {
  blockId?: number;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const isNewBlock = !blockId;
  const [loading, setLoading] = useState(!isNewBlock);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState(initialBlockContent);
  const [status, setStatus] = useState<"active" | "inactive">("active");

  const [blockType, setBlockType] = useState("job_card");

  const [blockImageUploading, setBlockImageUploading] = useState(false);
  const blockImageInputRef = useRef<HTMLInputElement>(null);

  const handleBlockImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setBlockImageUploading(true);
    toast.loading("Uploading image...", { id: "upload-block-image" });

    try {
      const result = await uploadFile(file);

      if (result.success && result.local_path) {
        setContent((prev) => ({
          ...prev,
          image_url: result.local_path || "",
        }));
        toast.success("Image uploaded successfully!", { id: "upload-block-image" });
      } else {
        toast.error(result.error || "Upload failed", { id: "upload-block-image" });
      }
    } catch (error) {
      toast.error("Failed to upload image", { id: "upload-block-image" });
      console.error(error);
    } finally {
      setBlockImageUploading(false);
      if (blockImageInputRef.current) {
        blockImageInputRef.current.value = "";
      }
    }
  };

  useEffect(() => {
    if (content.type) setBlockType(content.type);
  }, [content.type]);

  const handleLayoutChange = (layout: "standard" | "intro") => {
    if (isNewBlock) {
      setContent({
        ...initialBlockContent,
        type: "job_card",
        layout: layout,
      });
    }
  };

  const handleTypeChange = (type: string) => {
    setBlockType(type);
    const newContent = { ...initialBlockContent, type };

    if (type === "feature_list") {
      newContent.features = [""];
    } else if (type === "faq_accordion") {
      newContent.items = [
        { q: "", a: "" },
        { q: "", a: "" },
      ];
    }
    setContent(newContent);
  };

  const addFeatureLine = () =>
    setContent({ ...content, features: [...content.features, ""] });
  const updateFeatureLine = (i: number, v: string) => {
    const f = [...content.features];
    f[i] = v;
    setContent({ ...content, features: f });
  };
  const removeFeatureLine = (i: number) =>
    setContent({
      ...content,
      features: content.features.filter((_, idx) => idx !== i),
    });

  const addFaqItem = () =>
    setContent({ ...content, items: [...content.items, { q: "", a: "" }] });
  const updateFaqItem = (i: number, fld: "q" | "a", v: string) => {
    const itm = [...content.items];
    itm[i] = { ...itm[i], [fld]: v };
    setContent({ ...content, items: itm });
  };
  const removeFaqItem = (i: number) =>
    setContent({
      ...content,
      items: content.items.filter((_, idx) => idx !== i),
    });

  useEffect(() => {
    if (blockId) {
      setLoading(true);
      getReusableBlockById(blockId)
        .then((data) => {
          if (data.content_json) setContent(JSON.parse(data.content_json));
          setStatus(data.status);
          setLoading(false);
        })
        .catch(() => {
          toast.error("Failed to load block data.");
          setLoading(false);
        });
    }
  }, [blockId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      let blockTitle = content.company_name;
      if (blockType === "feature_list")
        blockTitle = content.features?.[0]?.substring(0, 30) || "Untitled";
      if (blockType === "faq_accordion")
        blockTitle = content.items?.[0]?.q?.substring(0, 30) || "Untitled";
      if (blockTitle === "job_card" || content.layout === "intro") {
        blockTitle = content.description?.substring(0, 30) || "Untitled";
      }
      const payload: ReusableBlock = {
        id: blockId || 0,
        title: blockTitle || "Untitled Block",
        content_json: JSON.stringify({ ...content, type: blockType }),
        status: status,
      };

      const savedBlock = await createOrUpdateReusableBlock(payload);

      if (isNewBlock && savedBlock.id) {
        const shortcode = `[block id="${savedBlock.id}"]`;
        navigator.clipboard.writeText(shortcode);
        toast.success(`Block created & shortcode copied!`);
      } else {
        toast.success("Block updated successfully!");
      }

      onSuccess();
      onClose();
    } catch (error) {
      toast.error(
        isNewBlock ? "Failed to create block" : "Failed to save block",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-7xl h-[92vh] shadow-2xl overflow-hidden flex flex-col border border-slate-200 rounded-none">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-none bg-blue-50 flex items-center justify-center">
              {isNewBlock ? (
                <Plus className="w-5 h-5 text-blue-600" />
              ) : (
                <Pencil className="w-5 h-5 text-blue-600" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 leading-none">
                {isNewBlock ? "Create New Block" : "Edit Reusable Block"}
              </h2>
              <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-bold">
                {isNewBlock ? "" : `Block ID: ${blockId}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-none transition-colors"
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
            <p className="text-sm font-medium text-slate-400">
              Loading block data...
            </p>
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden bg-slate-50/50">
            <div className="w-[40%] flex flex-col border-r border-slate-200 bg-white overflow-y-auto custom-scrollbar">
              <div className="p-6 border-b border-slate-100 bg-white">
                <label className="block text-[10px] font-black text-slate-400 mb-4 uppercase tracking-[0.2em]">
                  Block Framework
                  {!isNewBlock && (
                    <span className="normal-case font-medium italic">
                      {" "}
                      (Locked when editing)
                    </span>
                  )}
                </label>
                <div className="flex p-1 bg-slate-100 rounded-none gap-1">
                  {[
                    {
                      id: "job_card",
                      label: "Job Card",
                      icon: <Box className="w-4 h-4" />,
                    },
                    {
                      id: "feature_list",
                      label: "Feature List",
                      icon: <Plus className="w-4 h-4" />,
                    },
                    {
                      id: "faq_accordion",
                      label: "FAQ Accordion",
                      icon: <ChevronDown className="w-4 h-4" />,
                    },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleTypeChange(t.id)}
                      disabled={!isNewBlock}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-none transition-all font-bold text-xs ${blockType === t.id
                          ? "bg-white text-blue-600 shadow-sm"
                          : "text-slate-500"
                        } ${isNewBlock ? "hover:bg-slate-200/50 hover:text-slate-700" : "cursor-not-allowed opacity-60"}`}
                    >
                      {t.icon} {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="px-8 pt-0 pb-0">
                <div className="flex items-center justify-end px-1 bg-slate-0 py-2 gap-2">
                  <label
                    htmlFor="block-status-toggle"
                    className="text-sm font-bold text-slate-600"
                  >
                    Active
                  </label>
                  <button
                    id="block-status-toggle"
                    onClick={() =>
                      setStatus((prev) =>
                        prev === "active" ? "inactive" : "active",
                      )
                    }
                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-all duration-300 ${status === "active" ? "bg-green-500" : "bg-slate-300"
                      }`}
                  >
                    <span
                      className={`inline-block w-4 h-4 transform bg-white rounded-full transition-all duration-300 ${status === "active" ? "translate-x-6" : "translate-x-1"
                        }`}
                    />
                  </button>
                </div>
              </div>

              <div className="p-8 space-y-5 pt-1">
                {blockType === "job_card" && (
                  <div className="space-y-1 animate-in fade-in slide-in-from-bottom-2">
                    <div className="space-y-2 border-b border-slate-100 pb-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Display Layout
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleLayoutChange("standard")}
                          disabled={!isNewBlock}
                          className={`px-4 py-2 text-xs font-bold rounded-lg border-2 transition-all ${content.layout === "standard" || !content.layout
                              ? "border-blue-600 bg-blue-50 text-blue-600 rounded-none"
                              : "border-slate-200 text-slate-400 rounded-none"
                            } ${!isNewBlock && "cursor-not-allowed opacity-60"}`}
                        >
                          Standard
                        </button>
                        <button
                          type="button"
                          onClick={() => handleLayoutChange("intro")}
                          disabled={!isNewBlock}
                          className={`px-4 py-2 text-xs font-bold rounded-lg border-2 transition-all ${content.layout === "intro"
                              ? "border-blue-600 bg-blue-50 text-blue-600 rounded-none"
                              : "border-slate-200 text-slate-400 rounded-none"
                            } ${!isNewBlock && "cursor-not-allowed opacity-60"}`}
                        >
                          Intro
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {(content.layout === "standard" || !content.layout) && (
                        <>
                          <div className="col-span-2 space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">
                              Block Heading
                            </label>
                            <input
                              value={content.heading}
                              onChange={(e) =>
                                setContent({
                                  ...content,
                                  heading: e.target.value,
                                })
                              }
                              className="w-full border border-slate-300 rounded-none p-2.5 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none"
                              placeholder="e.g. Open Roles"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">
                              Company Name
                            </label>
                            <input
                              value={content.company_name}
                              onChange={(e) =>
                                setContent({
                                  ...content,
                                  company_name: e.target.value,
                                })
                              }
                              className="w-full border border-slate-300 rounded-none p-2.5 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">
                              Badge Text
                            </label>
                            <input
                              value={content.badge_text}
                              onChange={(e) =>
                                setContent({
                                  ...content,
                                  badge_text: e.target.value,
                                })
                              }
                              className="w-full border border-slate-300 rounded-none p-2.5 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none"
                            />
                          </div>
                        </>
                      )}

                      <div className="col-span-2 space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">
                          {content.layout === "intro"
                            ? "Introductory Text"
                            : "Job Description"}
                        </label>
                        <textarea
                          value={content.description}
                          onChange={(e) =>
                            setContent({
                              ...content,
                              description: e.target.value,
                            })
                          }
                          className="w-full border border-slate-300 rounded-none p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[120px]"
                          rows={4}
                        />
                      </div>

                      <div className="col-span-2 space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">
                          Image URL
                        </label>
                        <div className="flex gap-2">
                          <input
                            value={content.image_url}
                            onChange={(e) =>
                              setContent({
                                ...content,
                                image_url: e.target.value,
                              })
                            }
                            className="flex-1 border border-slate-300 rounded-none p-2.5 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none"
                            placeholder="e.g. /uploads/image.jpg or paste URL"
                          />
                          <label
                            className="flex items-center justify-center w-10 h-10 border border-slate-300 bg-slate-50 hover:bg-blue-50 hover:border-blue-400 cursor-pointer transition-colors"
                            style={{
                              opacity: blockImageUploading ? 0.5 : 1,
                              pointerEvents: blockImageUploading ? "none" : "auto",
                            }}
                            title="Upload image from computer"
                          >
                            {blockImageUploading ? (
                              <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                            ) : (
                              <Plus className="w-4 h-4 text-slate-500" />
                            )}
                            <input
                              ref={blockImageInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleBlockImageUpload}
                              disabled={blockImageUploading}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {blockType === "feature_list" && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
                        List Description
                      </label>
                      <textarea
                        value={content.heading}
                        onChange={(e) =>
                          setContent({ ...content, heading: e.target.value })
                        }
                        className="w-full border border-slate-300 rounded-none p-3 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                        rows={2}
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 tracking-widest">
                          Key Features
                        </label>
                        <button
                          type="button"
                          onClick={addFeatureLine}
                          className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-none hover:bg-blue-100 transition-all flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> ADD LINE
                        </button>
                      </div>
                      <div className="grid gap-3">
                        {content.features.map((feat, idx) => (
                          <div
                            key={idx}
                            className="flex gap-3 group items-center"
                          >
                            <div className="w-6 h-6 rounded-none bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                              {idx + 1}
                            </div>
                            <input
                              value={feat}
                              onChange={(e) =>
                                updateFeatureLine(idx, e.target.value)
                              }
                              className="flex-1 bg-transparent border border-slate-300 rounded-none p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
                              placeholder="Type feature..."
                            />
                            <button
                              type="button"
                              onClick={() => removeFeatureLine(idx)}
                              className="text-slate-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {blockType === "faq_accordion" && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 tracking-widest">
                        Questions & Answers
                      </label>
                      <button
                        type="button"
                        onClick={addFaqItem}
                        className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-none hover:bg-blue-100 transition-all flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> ADD FAQ
                      </button>
                    </div>
                    <div className="space-y-4">
                      {content.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-4 border border-slate-300 bg-white rounded-none shadow-sm relative group space-y-3"
                        >
                          <button
                            type="button"
                            onClick={() => removeFaqItem(idx)}
                            className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase">
                              Question {idx + 1}
                            </label>
                            <input
                              value={item.q}
                              onChange={(e) =>
                                updateFaqItem(idx, "q", e.target.value)
                              }
                              className="w-full border border-slate-300 rounded-none p-2 font-bold text-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
                              placeholder="Enter question..."
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase">
                              Answer
                            </label>
                            <textarea
                              value={item.a}
                              onChange={(e) =>
                                updateFaqItem(idx, "a", e.target.value)
                              }
                              className="w-full border border-slate-300 rounded-none p-2 text-slate-500 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[50px] bg-transparent"
                              placeholder="Enter answer..."
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {blockType !== "faq_accordion" && (
                  <div className="pt-3 border-t border-slate-100 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
                          CTA Button Text
                        </label>
                        <input
                          value={content.button_text}
                          onChange={(e) =>
                            setContent({
                              ...content,
                              button_text: e.target.value,
                            })
                          }
                          className="w-full border border-slate-300 rounded-none p-2.5 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
                          CTA Button URL
                        </label>
                        <input
                          value={content.button_url}
                          onChange={(e) =>
                            setContent({
                              ...content,
                              button_url: e.target.value,
                            })
                          }
                          className="w-full border border-slate-300 rounded-none p-2.5 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
                        Footer Disclaimer
                      </label>
                      <input
                        value={content.footer_text}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            footer_text: e.target.value,
                          })
                        }
                        className="w-full border border-slate-300 rounded-none p-2.5 text-[11px] text-slate-500 focus:ring-2 focus:ring-blue-500/50 outline-none"
                        placeholder="e.g. You will remain on the same website"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="w-[60%] bg-slate-100 flex flex-col">
              <div className="p-4 border-b border-slate-200 bg-white/80 flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Eye className="w-3 h-3" /> Live Preview
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-10 flex flex-col items-center">
                <div className="w-full max-w-7xl">
                  <div className="bg-white shadow-xl rounded-none p-2 scale-95 origin-top">
                    <div className="py-6">
                      <JobBoxRenderer
                        block={
                          {
                            id: blockId,
                            title: content.company_name,
                            status: "active",
                            content_json: JSON.stringify(content),
                          } as ReusableBlock
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="p-6 border-t flex justify-end items-center bg-white border-slate-200 gap-5">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
          >
            Cancel
          </button>
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded-none font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {saving
                ? "SAVING..."
                : isNewBlock
                  ? "CREATE BLOCK"
                  : "UPDATE BLOCK"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditPostContent;