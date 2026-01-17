"use client";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Editor } from "@tinymce/tinymce-react";
import { Save, ArrowLeft, Loader2, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import { Post, Type, Category } from "@/types";
import {
  getTypes,
  getCategories,
  checkSlugUniqueness as apiCheckSlug,
  getPostBySlug,
  createPost,
  updatePost,
} from "@/lib/api/posts";
import { APP_CONFIG } from "@/lib/api/config";


// Định nghĩa interface cho lỗi từ API để thay thế 'any'
interface ApiError {
  message?: string;
  [key: string]: unknown;
}


const debounce = <A extends unknown[], U>(
  func: (...args: A) => U,
  delay: number
) => {
  let timeout: NodeJS.Timeout;
  return (...args: A): void => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

function EditPostContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNewPost = params.slug === "add";

  const [post, setPost] = useState<Post | null>(null);
  const [originalPost, setOriginalPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [types, setTypes] = useState<Type[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [initialSlug, setInitialSlug] = useState<string>("");
  const [currentTitleInput, setCurrentTitleInput] = useState<string>("");

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");
  };

  const checkSlugUniqueness = useCallback(
    async (potentialSlug: string): Promise<string> => {
      try {
        let data = await apiCheckSlug(potentialSlug);
        if (data.exists) {
          let i = 1;
          let newSlug = potentialSlug;
          while (data.exists) {
            newSlug = `${potentialSlug}-${i}`;
            data = await apiCheckSlug(newSlug);
            if (!data.exists) {
              return newSlug;
            }
            i++;
          }
        }
        return potentialSlug;
      } catch (error: unknown) {
        console.error("Error checking slug uniqueness:", error);
        return potentialSlug;
      }
    },
    []
  );

  const updateSlug = useCallback(
    debounce(async (newTitle: string) => {
      if (isNewPost) {
        const baseSlug = generateSlug(newTitle);
        if (baseSlug) {
          const uniqueSlug = await checkSlugUniqueness(baseSlug);
          setPost((prev) => (prev ? { ...prev, slug: uniqueSlug } : null));
        } else {
          setPost((prev) => (prev ? { ...prev, slug: "" } : null));
        }
      }
    }, 500),
    [isNewPost, checkSlugUniqueness]
  );

  const updatePostTitle = useCallback(
    debounce((newTitle: string) => {
      setPost((prev) => (prev ? { ...prev, title: newTitle } : null));
    }, 300),
    []
  );

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
          const defaultType = typesData.find(
            (t: Type) => t.slug === "category"
          );
          setPost({
            title: "",
            excerpt: "",
            descrip: "",
            content: "",
            status: "active",
            slug: "",
            type_id: defaultType ? defaultType.id : 0,
            category_id: null,
          } as Post);
          setCurrentTitleInput("");
          setLoading(false);
          setInitialSlug("");
        } else {
          const type = searchParams.get("type");
          const data = await getPostBySlug(params.slug as string, type);
          const fullPost = { ...data, slug: params.slug as string };
          setPost(fullPost);
          setOriginalPost(fullPost);
          setInitialSlug(fullPost.slug);
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
  }, [params.slug, searchParams, isNewPost]);

  const handleSave = async () => {
    if (!post) {
      toast.error("Cannot save, post data is not available.");
      return;
    }

    setSaving(true);
    const { id, type: postType, category: postCategory, ...payload } = post;
    const finalPayload = {
      ...payload,
      type_id: post.type_id,
      category_id: post.category_id,
    };

    try {
      let responseData;
      if (isNewPost) {
        responseData = await createPost(finalPayload);
      } else {
        responseData = await updatePost(initialSlug, finalPayload);
      }

      setSaving(false);
      toast.success("Database updated successfully!");
      setOriginalPost(post);

      if (isNewPost) {
        router.replace(
          `/admin/${responseData.slug}?type=${responseData.type_id}`
        );
      } else if (post.slug && post.slug !== initialSlug) {
        const newUrl = post.type?.id
          ? `/admin/${post.slug}?type=${post.type.id}`
          : `/admin/${post.slug}`;
        router.push(newUrl);
      }
      setInitialSlug(post.slug || "");
    } catch (error: unknown) {
      setSaving(false);
      const err = error as ApiError;
      toast.error(`Error saving: ${err.message || "Unknown error"}`);
    }
  };

  const generateFrontendUrl = (postToGenerate: Post) => {
    const FRONTEND_URL_API = process.env.FRONTEND_URL || "";

    if (!postToGenerate.type || !postToGenerate.type.slug) {
      return `${FRONTEND_URL_API}/${postToGenerate.slug}`;
    }

    switch (postToGenerate.type.slug) {
      case "tag":
        return `${FRONTEND_URL_API}/tag/${postToGenerate.slug}`;
      case "post":
        return `${FRONTEND_URL_API}/${postToGenerate.slug}`;
      case "category":
        return `${FRONTEND_URL_API}/category/${postToGenerate.slug}`;

      case "page":
        if (postToGenerate.slug === "about") {
          return `${FRONTEND_URL_API}/home/about`;
        }
        return `${FRONTEND_URL_API}/${postToGenerate.slug}`;
      default:
        return `${FRONTEND_URL_API}/${postToGenerate.slug}`;
    }
  };

  const handleOverviewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (originalPost?.slug) {
      const url = `${APP_CONFIG.FRONTEND_URL}/${originalPost.slug}`;
      window.open(url, '_blank');
    }
  };

  const getDisplayTitle = (title: string | undefined): string => {
    if (!title) return "";

    if (!/<[^>]+>/.test(title)) {
      return title;
    }

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(title, "text/html");
      const headlineSpan = doc.querySelector("span.gb-headline-text");
      if (headlineSpan && headlineSpan.textContent) {
        const text = headlineSpan.textContent;
        if (text.includes(":")) {
          return text.split(":").slice(1).join(":").trim();
        }
        return text;
      }
    } catch (e: unknown) {
      console.error("Title parse error:", e);
    }
    const strippedTitle = title.replace(/<[^>]+>/g, "");
    if (strippedTitle.includes(":")) {
      return strippedTitle.split(":").slice(1).join(":").trim();
    }
    return strippedTitle;
  };

  const handleTitleChange = (newDisplayTitleFromEditor: string) => {
    const newDisplayTitle = newDisplayTitleFromEditor.replace(/<[^>]+>/g, "");

    if (isNewPost) {
      setCurrentTitleInput(newDisplayTitle);
      updatePostTitle(newDisplayTitle);
      updateSlug(newDisplayTitle);
      return;
    }

    const originalTitleHtml = originalPost?.title || "";
    if (!originalTitleHtml) {
      setPost((prev) => (prev ? { ...prev, title: newDisplayTitle } : null));
      return;
    }
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(originalTitleHtml, "text/html");
      const headlineSpan = doc.querySelector("span.gb-headline-text");
      if (headlineSpan && headlineSpan.textContent !== null) {
        const originalSpanText = headlineSpan.textContent;
        let newSpanText = newDisplayTitle;
        if (originalSpanText.includes(":")) {
          const prefix = originalSpanText.split(":")[0] + ": ";
          newSpanText = prefix + newDisplayTitle;
        }
        headlineSpan.textContent = newSpanText;
        const newFullTitle = doc.body.innerHTML;
        setPost((prev) => (prev ? { ...prev, title: newFullTitle } : null));
      } else {
        setPost((prev) => (prev ? { ...prev, title: newDisplayTitle } : null));
      }
    } catch (e: unknown) {
      console.error("Could not parse and update title HTML", e);
      setPost((prev) => (prev ? { ...prev, title: newDisplayTitle } : null));
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
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                  Title
                </label>
                <div className="overflow-hidden border border-slate-100 shadow-sm">
                  <Editor
                    apiKey="vb3rf5t71lcc6x2a1imujbsh6uea23dz7zqhe6b2q1it3q8u"

                    value={
                      isNewPost
                        ? currentTitleInput
                        : getDisplayTitle(post?.title)
                    }
                    init={{
                      height: 150,
                      menubar: false,
                      plugins: ["code", "wordcount"],
                      toolbar: "undo redo | bold italic | code",
                      content_style:
                        "body { font-family:Inter,Arial,sans-serif; font-size:16px }",
                      forced_root_block: "",
                    }}
                    onEditorChange={handleTitleChange}
                  />
                </div>
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
                  onChange={(e) =>
                    setPost((prev) => (prev ? { ...prev, slug: e.target.value } : null))
                  }
                  readOnly={!isNewPost}
                  className={`w-full border p-3 text-[16px] shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 ${isNewPost
                    ? "bg-white border-slate-200"
                    : "bg-slate-100 border-slate-200"
                    }`}
                  placeholder="e.g., my-awesome-post"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                  Descrip
                </label>
                <div className="overflow-hidden border border-slate-100 shadow-sm">
                  <Editor
                    apiKey="vb3rf5t71lcc6x2a1imujbsh6uea23dz7zqhe6b2q1it3q8u"
                    value={post.descrip}
                    init={{
                      height: 150,
                      menubar: false,
                      plugins: ["code", "wordcount"],
                      toolbar: "undo redo | bold italic | code",
                      content_style:
                        "body { font-family:Inter,Arial,sans-serif; font-size:16px }",
                    }}
                    onEditorChange={(content: string) =>
                      setPost((prev) => (prev ? { ...prev, descrip: content } : null))
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                  Excerpt
                </label>
                <div className="overflow-hidden border border-slate-100 shadow-sm">
                  <Editor
                    apiKey="vb3rf5t71lcc6x2a1imujbsh6uea23dz7zqhe6b2q1it3q8u"
                    value={post.excerpt}
                    init={{
                      height: 150,
                      menubar: false,
                      plugins: ["code", "wordcount"],
                      toolbar: "undo redo | bold italic | code",
                      content_style:
                        "body { font-family:Inter,Arial,sans-serif; font-size:16px }",
                    }}
                    onEditorChange={(content: string) =>
                      setPost((prev) => (prev ? { ...prev, excerpt: content } : null))
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                  Content
                </label>
                <div className="overflow-hidden border border-slate-100 shadow-sm">
                  <Editor
                    apiKey="vb3rf5t71lcc6x2a1imujbsh6uea23dz7zqhe6b2q1it3q8u"
                    value={post.content}
                    init={{
                      height: 600,
                      menubar: false,
                      plugins: [
                        "advlist", "autolink", "lists", "link", "image", "charmap", "preview", "anchor",
                        "searchreplace", "visualblocks", "code", "fullscreen", "insertdatetime", "media",
                        "table", "help", "wordcount", "emoticons",
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
                      setPost((prev) => (prev ? { ...prev, content: content } : null))
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
                      setPost((prev) => (prev ? {
                        ...prev,
                        status: prev.status === "active" ? "inactive" : "active",
                      } : null))
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

                <select
                  id="category_id"
                  value={post.category_id || ""}
                  onChange={(e) =>
                    setPost((prev) => (prev ? {
                      ...prev,
                      category_id: e.target.value ? Number(e.target.value) : null,
                    } : null))
                  }
                  className="w-full bg-white border border-slate-200 p-3 text-[16px] shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>

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
                    originalPost?.status !== "active"
                  }
                  className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 font-bold transition-all border border-slate-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ExternalLink className="w-4 h-4" /> Preview Live
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
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