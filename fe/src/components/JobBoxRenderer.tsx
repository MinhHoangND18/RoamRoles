'use client';

import { ReusableBlock } from "@/types/ReusableBlock";
import { UPLOAD_CONFIG } from "@/constants/app-config";

// Helper function to get the correct image URL
const getImageUrl = (url: string): string => {
  if (!url) return "";
  // If it's already a full URL (http/https), return as is
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  // If it's a relative path like /uploads/..., prepend the upload URL
  if (url.startsWith("/uploads/") || url.startsWith("uploads/")) {
    const cleanPath = url.startsWith("/") ? url.substring(1) : url;
    return `${UPLOAD_CONFIG.UPLOAD_URL}/${cleanPath}`;
  }
  // For other paths like /images/..., return as is (local public folder)
  return url;
};

export default function JobBoxRenderer({ block }: { block: ReusableBlock }) {
  const content = JSON.parse(block.content_json);

  if (content.type === "feature_list") {
    return (
      <div
        className="row mt-4 border-bottom border-gray-300"
        suppressHydrationWarning={true}
      >
        <div className="col-12">
          <span className="fs-18 leading-relaxed text-center">
            {content.heading}
          </span>
        </div>
        <div className="col-12">
          <div className="row">
            {content.features?.map((item: string, index: number) => (
              <div key={index} className="col-md-6 p-2">
                <div className="bg-light rounded d-flex p-4 h-100 align-items-center ">
                  <svg
                    className="flex-shrink-0 me-3 text-success"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    style={{ width: "1.5rem", height: "1.5rem" }}
                    viewBox="0 0 24 24"
                  >
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path>
                    <path d="M22 4L12 14.01l-3-3"></path>
                  </svg>
                  <span className="title-font font-medium text-left">
                    {item}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="row mt-4">
          <div className="col-12 text-center">
            <a
              href={content.button_url}
              className="d-inline-block text-center text-white border-0 py-2 px-8 text-lg focus:outline-none rounded bg-green-700 hover:bg-green-800 btn-block"
              style={{ textDecoration: "none" }}
            >
              {content.button_text}
            </a>
            <div className="col-12 text-center text-xs text-muted mt-3 d-block">
              {content.footer_text}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (content.type === "faq_accordion") {
    return (
      <div className="accordion" id={`accordion-${block.id}`}>
        {content.items?.map((item: { q: string; a: string }, index: number) => (
          <div className="accordion-item" key={index}>
            <h2
              className="accordion-header"
              id={`heading-${block.id}-${index}`}
            >
              <button
                className={`accordion-button ${index !== 0 ? "collapsed" : ""}`}
                type="button"
                data-bs-toggle="collapse"
                data-bs-target={`#collapse-${block.id}-${index}`}
                aria-expanded={index === 0 ? "true" : "false"}
                aria-controls={`collapse-${block.id}-${index}`}
              >
                {item.q}
              </button>
            </h2>
            <div
              id={`collapse-${block.id}-${index}`}
              className={`accordion-collapse collapse ${index === 0 ? "show" : ""}`}
              aria-labelledby={`heading-${block.id}-${index}`}
              data-bs-parent={`#accordion-${block.id}`}
            >
              <div className="accordion-body">
                <span>{item.a}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (content.type === "job_card") {
    return (
      <div
        className={` ${content.layout === "intro" ? "flex" : "d-sm-block border-top border-bottom p-3"}`}
        style={content.layout === "intro" ? {} : { borderColor: "#ccc" }}
      >
        {content.layout !== "intro" && (
          <div className="text-center mb-4">
            <h6 className="pt-3 text-center text-gray-900 text-2xl title-font font-medium mb-12">
              {content.heading}
            </h6>
          </div>
        )}

        <div className="row d-none d-md-flex">
          <div className="col-lg-5 col-md-5 col-sm-12 mb-4 mb-lg-0">
            {content.image_url ? (
              <img
                src={getImageUrl(content.image_url)}
                alt={content.company_name || "job-image"}
                className="w-100 h-100 object-cover object-center rounded border"
                style={{ objectFit: "cover", height: "190px" }}
              />
            ) : (
              <div
                className="w-100 h-100 bg-light rounded border d-flex align-items-center justify-content-center"
                style={{ height: "190px" }}
              >
                <span className="text-muted text-xs tracking-widest uppercase">
                  No Image
                </span>
              </div>
            )}
          </div>

          <div className="col-lg-7 col-md-7 col-sm-12 d-flex flex-column justify-content-between">
            <div>
              {content.layout === "intro" ? (
                <div className="text-center pb-3">
                  <span className="fs-18 leading-relaxed">
                    {content.description}
                  </span>
                </div>
              ) : (
                <>
                  <h3 className="text-gray-900 text-3xl title-font font-medium mb-1">
                    {content.company_name}
                  </h3>
                  <div className="flex mb-2">
                    <span className="inline-block py-1 px-2 rounded text-xs font-medium tracking-widest text-uppercase bg-green-50 text-green-700">
                      {content.badge_text}
                    </span>
                  </div>
                  <div className="d-block text-justify py-3">
                    {content.description}
                  </div>
                </>
              )}
            </div>

            <div
              className={`mt-auto d-flex flex-column ${content.layout === "intro" ? "align-items-end" : "align-items-end"}`}
            >
              <a
                href={content.button_url}
                target="_blank"
                className="d-inline-block text-center text-white border-0 py-2 px-8 text-lg focus:outline-none rounded bg-green-700 hover:bg-green-800 btn-block"
              >
                {content.button_text ||
                  (content.layout === "intro"
                    ? "See How to Apply"
                    : "View Careers")}
              </a>
              <div
                className={`text-xs text-muted mt-3 d-block col-12 text-center`}
              >
                {content.footer_text}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}