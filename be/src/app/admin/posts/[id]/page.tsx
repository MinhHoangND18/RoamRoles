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
  createOrUpdateReusableBlock
} from "@/lib/api/reusable_blocks";
import { processThumbnailUrl, isExternalUrl } from "@/lib/api/upload";
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
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});

  const [editorsReadyCount, setEditorsReadyCount] = useState(0);
  const [surveySets, setSurveySets] = useState<SurveySet[]>([]);
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);
  const surveyDropdownRef = useRef<HTMLDivElement>(null);
  const [surveySearchTerm, setSurveySearchTerm] = useState("");
  const [reusableBlocks, setReusableBlocks] = useState<ReusableBlock[]>([]);
  const [isBlockDropdownOpen, setIsBlockDropdownOpen] = useState(false);
  const [blockSearchTerm, setBlockSearchTerm] = useState("");
  const blockDropdownRef = useRef<HTMLDivElement>(null);

  const [blockForEditing, setBlockForEditing] = useState<
    number | "new" | null
  >(null);

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
        const [typesData, categoriesData, allPostsData, surveySetsData] = await Promise.all([
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
    if (typeof post.content !== 'string' || !post.content.trim()) {
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

    // Process thumbnail URL - download external images to local server
    let processedThumbnailUrl = updatedPost.thumbnail_url || '';
    if (processedThumbnailUrl && isExternalUrl(processedThumbnailUrl)) {
      toast.loading('Downloading external image...', { id: 'download-image' });
      try {
        processedThumbnailUrl = await processThumbnailUrl(processedThumbnailUrl);
        toast.success('Image downloaded successfully!', { id: 'download-image' });
        // Update the local state
        setPost((prev) => prev ? { ...prev, thumbnail_url: processedThumbnailUrl } : null);
      } catch {
        toast.error('Failed to download image, using original URL', { id: 'download-image' });
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
    // If not loading but post is still null, show error
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
                      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-all duration-300 ${post.status === "active" ? "bg-green-500" : "bg-slate-300"
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

                  {/* <div className="flex items-center justify-between px-1">
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
                      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-all duration-300 ${post.show_survey ? "bg-green-500" : "bg-slate-300"
                        }`}
                    >
                      <span
                        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-all duration-300 ${post.show_survey ? "translate-x-6" : "translate-x-1"
                          }`}
                      />
                    </button>
                  </div> */}

                  <div className="relative" ref={categoryDropdownRef}>
                    <button
                      onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                      className="flex items-center justify-between w-full bg-white border border-slate-200 p-3 text-[16px] shadow-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900"
                    >
                      <span className="text-left">{selectedCategoryName}</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform text-slate-400 ${isCategoryOpen ? "rotate-180" : ""
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

                  <div className="relative" ref={surveyDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsSurveyOpen(!isSurveyOpen)}
                      className="flex items-center justify-between w-full bg-white border border-slate-200 p-3 text-[16px] shadow-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900"
                    >
                      <span className="text-left truncate pr-2">
                        {post?.survey_set_id
                          ? surveySets.find((s) => s.id === post.survey_set_id)?.name || "Select Survey"
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
                            onChange={(e) => setSurveySearchTerm(e.target.value)}
                            className="w-full p-2 text-sm border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                            autoFocus
                          />
                        </div>

                        <ul className="max-h-60 overflow-y-auto py-1 font-medium text-sm">
                          <li
                            onClick={() => {
                              setPost((prev) =>
                                prev ? { ...prev, survey_set_id: null } : null
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
                              const searchLower = surveySearchTerm.toLowerCase();
                              return (
                                s.active && // Chỉ hiện survey active
                                (s.name.toLowerCase().includes(searchLower) ||
                                  s.slug.toLowerCase().includes(searchLower))
                              );
                            })
                            .map((s) => (
                              <li
                                key={s.id}
                                onClick={() => {
                                  setPost((prev) =>
                                    prev ? { ...prev, survey_set_id: s.id } : null
                                  );
                                  setIsSurveyOpen(false);
                                  setSurveySearchTerm("");
                                }}
                                className={`px-4 py-2 cursor-pointer hover:bg-blue-50 text-slate-600 transition-colors border-b border-slate-50 last:border-0 ${post?.survey_set_id === s.id
                                  ? "bg-blue-50 text-blue-600 font-bold"
                                  : ""
                                  }`}
                              >
                                <div className="text-[13px] line-clamp-1">{s.name}</div>
                                <div className="text-[10px] text-slate-400 font-normal">
                                  ID: {s.id} - Slug: {s.slug}
                                  {s.description && ` - ${s.description}`}
                                </div>
                              </li>
                            ))}

                          {surveySets.filter((s) =>
                            s.name.toLowerCase().includes(surveySearchTerm.toLowerCase())
                          ).length === 0 && (
                              <li className="px-4 py-3 text-center text-slate-400 text-xs italic">
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
                      <div className="absolute top-full mt-2 left-0 w-full bg-white border border-slate-200 shadow-xl z-[100] animate-in fade-in slide-in-from-top-2">
                        <div className="p-2 border-b border-slate-100 bg-slate-50">
                          <div className="relative">
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
                        </div>

                        <ul className="max-h-60 overflow-y-auto py-1">
                          {reusableBlocks
                            .filter((b) =>
                              b.title
                                .toLowerCase()
                                .includes(blockSearchTerm.toLowerCase()),
                            )
                            .map((block) => (
                              <li
                                key={block.id}
                                className="px-4 py-3 border-b border-slate-50 last:border-0 hover:bg-blue-50 group transition-colors"
                              >
                                <div className="flex justify-between items-start mb-1">
                                  <span className="text-[13px] font-bold text-slate-700 line-clamp-1">
                                    {block.title}
                                  </span>

                                  <div className="flex items-center">
                                    <button
                                      onClick={() => setBlockForEditing(block.id)}
                                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                      title="Edit Block"
                                    >
                                      <Pencil className="w-4 h-4" />
                                    </button>

                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(
                                          `[block id="${block.id}"]`,
                                        );
                                        toast.success("Copied!");
                                      }}
                                      className="ml-1 text-slate-300 hover:text-blue-600 p-1 transition-colors"
                                      title="Copy Shortcode"
                                    >
                                      <Copy className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                                <div className="text-[10px] font-mono text-slate-400 group-hover:text-blue-400 transition-colors">
                                  [block id= {block.id}]
                                </div>
                              </li>
                            ))}

                          {reusableBlocks.length === 0 && (
                            <li className="p-4 text-center text-xs text-slate-400 italic">
                              No blocks found
                            </li>
                          )}
                        </ul>

                        {/* Nút tạo mới */}
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
          /* Cố định ảnh không bị to quá mức */
          .reusable-block-scope img {
            max-width: 100% !important;
            height: auto !important;
          }
        `}</style>
      </div>
    </div>
  );
}
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
  const [content, setContent] = useState({
    heading: "",
    company_name: "",
    badge_text: "",
    description: "",
    image_url: "",
    button_text: "",
    button_url: "",
    footer_text: "",
  });

  useEffect(() => {
    if (blockId) {
      setLoading(true);
      getReusableBlockById(blockId)
        .then((data) => {
          if (data.content_json) setContent(JSON.parse(data.content_json));
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
      const payload: ReusableBlock = {
        id: blockId || 0,
        title: content.company_name || "Untitled Block",
        content_json: JSON.stringify(content),
        status: "active",
      };

      await createOrUpdateReusableBlock(payload);
      toast.success(
        isNewBlock
          ? "Block created successfully!"
          : "Block updated successfully!",
      );
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
    <div className="fixed  inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md">
      <div className="bg-white w-full max-w-7xl h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 rounded-none">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-white border-gray-300">
          <div className="flex items-center gap-2">
            {isNewBlock ? (
              <Plus className="w-4 h-4 text-blue-500" />
            ) : (
              <Pencil className="w-4 h-4 text-blue-500" />
            )}
            <span className="font-bold text-slate-700">
              {isNewBlock
                ? "Create New Reusable Block"
                : `Quick Edit: ${content.company_name}`}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-full"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden bg-white">
            <div className="p-4 grid grid-cols-4 gap-3 bg-slate-50/50 border-b border-gray-300">
              <div className="col-span-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">
                  Heading
                </label>
                <input
                  value={content.heading}
                  onChange={(e) =>
                    setContent({ ...content, heading: e.target.value })
                  }
                  className="w-full border border-slate-200 p-2 text-sm rounded outline-none focus:ring-1 focus:ring-blue-500 rounded-none"
                />
              </div>
              <div className="col-span-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">
                  Company Name (for Title)
                </label>
                <input
                  value={content.company_name}
                  onChange={(e) =>
                    setContent({ ...content, company_name: e.target.value })
                  }
                  className="w-full border border-slate-200 p-2 text-sm rounded outline-none focus:ring-1 focus:ring-blue-500 rounded-none"
                />
              </div>
              <div className="col-span-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">
                  Logo URL
                </label>
                <input
                  value={content.image_url}
                  onChange={(e) =>
                    setContent({ ...content, image_url: e.target.value })
                  }
                  className="w-full border border-slate-200 p-2 text-sm rounded outline-none focus:ring-1 focus:ring-blue-500 rounded-none"
                />
              </div>
              <div className="col-span-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">
                  Badge
                </label>
                <input
                  value={content.badge_text}
                  onChange={(e) =>
                    setContent({ ...content, badge_text: e.target.value })
                  }
                  className="w-full border border-slate-200 p-2 text-sm rounded outline-none focus:ring-1 focus:ring-blue-500 rounded-none"
                />
              </div>
              <div className="col-span-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">
                  Description
                </label>
                <textarea
                  value={content.description}
                  onChange={(e) =>
                    setContent({ ...content, description: e.target.value })
                  }
                  className="w-full border border-slate-200 p-2 text-sm rounded outline-none focus:ring-1 focus:ring-blue-500 rounded-none resize"
                  rows={1}
                />
              </div>
              <div className="col-span-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">
                  Button Text
                </label>
                <input
                  value={content.button_text}
                  onChange={(e) =>
                    setContent({ ...content, button_text: e.target.value })
                  }
                  className="w-full border border-slate-200 p-2 text-sm rounded outline-none focus:ring-1 focus:ring-blue-500 rounded-none"
                />
              </div>
              <div className="col-span-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">
                  Button URL
                </label>
                <input
                  value={content.button_url}
                  onChange={(e) =>
                    setContent({ ...content, button_url: e.target.value })
                  }
                  className="w-full border border-slate-200 p-2 text-sm rounded outline-none focus:ring-1 focus:ring-blue-500 rounded-none"
                />
              </div>
              <div className="col-span-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">
                  Footer Text
                </label>
                <input
                  value={content.footer_text}
                  onChange={(e) =>
                    setContent({ ...content, footer_text: e.target.value })
                  }
                  className="w-full border border-slate-200 p-2 text-sm rounded outline-none focus:ring-1 focus:ring-blue-500 rounded-none"
                />
              </div>
            </div>

            <div className="flex-1 min-h-0 p-10 bg-[#f8fafc] flex items-center justify-center">
              <div className="w-full max-w-4xl bg-white shadow-sm border border-slate-100">
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

            <div className="p-4 border-t flex justify-end items-center bg-white border-gray-300">
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 text-sm font-bold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95 rounded-none"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saving
                    ? "SAVING..."
                    : isNewBlock
                      ? "CREATE BLOCK"
                      : "SAVE CHANGES"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EditPostContent;