import { ReusableBlock } from "@/types";
import { UPLOAD_CONFIG } from "@/lib/api/config";

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
  const content = JSON.parse(block.content_json || "{}");

  return (
    <div className="job-box-scope">
      <style jsx>{`
        .job-box-scope .row {
          display: flex;
          flex-wrap: wrap;
          margin-left: -15px;
          margin-right: -15px;
        }
        .job-box-scope .col-lg-5,
        .job-box-scope .col-md-5,
        .job-box-scope .col-sm-12,
        .job-box-scope .col-lg-7,
        .job-box-scope .col-md-7 {
          position: relative;
          width: 100%;
          padding-left: 15px;
          padding-right: 15px;
        }
        @media (min-width: 768px) {
          .job-box-scope .col-md-5 {
            flex: 0 0 41.666667%;
            max-width: 41.666667%;
          }
          .job-box-scope .col-md-7 {
            flex: 0 0 58.333333%;
            max-width: 58.333333%;
          }
        }
        @media (min-width: 992px) {
          .job-box-scope .col-lg-5 {
            flex: 0 0 41.666667%;
            max-width: 41.666667%;
          }
          .job-box-scope .col-lg-7 {
            flex: 0 0 58.333333%;
            max-width: 58.333333%;
          }
        }
        .job-box-scope .d-flex {
          display: flex !important;
        }
        .job-box-scope .flex-column {
          flex-direction: column !important;
        }
        .job-box-scope .justify-content-between {
          justify-content: space-between !important;
        }
        .job-box-scope .align-items-end {
          align-items: flex-end !important;
        }
        .job-box-scope .w-100 {
          width: 100% !important;
        }
        .job-box-scope {
          font-family: "Poppins", sans-serif;
        }
        .job-box-scope .row {
          display: flex;
          flex-wrap: wrap;
          margin: 0 -8px;
        }
        .job-box-scope .col-12 {
          width: 100%;
          padding: 0 8px;
        }
        .job-box-scope .col-md-6 {
          width: 50%;
          padding: 8px;
        }
        .job-box-scope .bg-light {
          background-color: #f8f9fa !important;
          border-radius: 8px;
        }
        .job-box-scope .d-flex {
          display: flex !important;
        }
        .job-box-scope .align-items-center {
          align-items: center !important;
        }
        .job-box-scope .p-4 {
          padding: 1.5rem !important;
        }
        .job-box-scope .me-3 {
          margin-right: 1rem !important;
        }
        .job-box-scope .text-success {
          color: #198754 !important;
        }
        .job-box-scope .btn-green {
          background-color: #157347;
          color: white;
          padding: 10px 30px;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
        }

        /* Accordion CSS */
        .job-box-scope .accordion {
          border: 1px solid #dee2e6;
          border-radius: 4px;
          overflow: hidden;
        }
        .job-box-scope .accordion-item {
          border-bottom: 1px solid #dee2e6;
        }
        .job-box-scope .accordion-header {
          margin-bottom: 0;
          background: #f8f9fa;
          padding: 15px 20px;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          font-weight: 500;
        }
        .job-box-scope .accordion-body {
          padding: 15px 20px;
          background: white;
          border-top: 1px solid #dee2e6;
          font-size: 14px;
          color: #4b5563;
        }

        @media (max-width: 768px) {
          .job-box-scope .col-md-6 {
            width: 100%;
          }
        }
        .job-box-scope {
          font-family: "Inter", sans-serif;
          color: #374151;
        }

        .job-box-scope .row {
          display: flex;
          flex-wrap: wrap;
          margin-left: -10px;
          margin-right: -10px;
        }
        .job-box-scope .col-md-6 {
          width: 50%;
          padding: 10px;
        }

        .job-box-scope .feature-card {
          background-color: #f8f9fa;
          border-radius: 12px;
          display: flex;
          padding: 24px;
          height: 100%;
          align-items: center;
          transition: transform 0.2s ease;
        }
        .job-box-scope .feature-card:hover {
          background-color: #f3f4f6;
        }
        .job-box-scope .icon-container {
          flex-shrink: 0;
          margin-right: 16px;
          color: #059669;
        }
        .job-box-scope .feature-text {
          font-size: 16px;
          font-weight: 500;
          line-height: 1.5;
          text-align: left;
        }

        .job-box-scope .main-heading {
          font-size: 18px;
          line-height: 1.6;
          display: block;
          margin-bottom: 24px;
          color: #1f2937;
          text-align: left;
        }
        .job-box-scope .btn-apply {
          background-color: #15803d;
          color: white;
          padding: 12px 48px;
          text-decoration: none !important;
          border-radius: 8px;
          font-weight: 600;
          font-size: 18px;
          display: inline-block;
          transition: background-color 0.2s;
        }
        .job-box-scope .btn-apply:hover {
          background-color: #166534;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .job-box-scope .col-md-6 {
            width: 100%;
          }
          .job-box-scope .feature-card {
            padding: 16px;
          }
        }
        .job-box-scope .feature-card {
          background-color: #f8f9fa;
          border-radius: 12px;
          display: flex;
          padding: 24px;
          height: 100%;
          align-items: center;
          overflow: hidden;
          word-break: break-word;
        }

        .job-box-scope .feature-text {
          font-size: 16px;
          font-weight: 500;
          line-height: 1.5;
          text-align: left;
          flex: 1;
          min-width: 0;
          white-space: normal;
        }

        .job-box-scope .icon-container {
          flex-shrink: 0;
          margin-right: 16px;
          color: #059669;
          display: flex;
          align-items: center;
        }
        .job-box-scope .main-heading {
          font-size: 18px;
          line-height: 1.6;
          display: block;
          margin-bottom: 30px;
          color: #1f2937;
          text-align: left;
          word-wrap: break-word;
        }
        .job-box-scope {
          word-break: break-word;
          overflow-wrap: break-word;
        }

        .job-box-scope .row {
          display: flex;
          flex-wrap: wrap;
          max-width: 100%;
        }

        .job-box-scope [class*="col-"] {
          min-width: 0;
        }
      `}</style>
      {content.type === "feature_list" && (
        <div className="py-4 px-2">
          {content.heading && (
            <span className="main-heading">{content.heading}</span>
          )}

          <div className="row">
            {content.features?.map((item: string, index: number) => (
              <div key={index} className="col-md-6">
                <div className="feature-card">
                  <div className="icon-container">
                    <svg
                      width="28"
                      height="28"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <span className="feature-text">{item}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <a href={content.button_url || "#"} className="btn-apply">
              {content.button_text || "See How to Apply"}
            </a>
            <div
              style={{ fontSize: "12px", color: "#9ca3af", marginTop: "16px" }}
            >
              {content.footer_text || "You will remain in the same website"}
            </div>
          </div>
        </div>
      )}

      {content.type === "faq_accordion" && (
        <div className="accordion">
          {content.items?.map(
            (item: { q: string; a: string }, index: number) => (
              <div className="accordion-item" key={index}>
                <div className="accordion-header">
                  {item.q}
                  <svg
                    style={{ width: "18px" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
                <div className="accordion-body">
                  <span>{item.a}</span>
                </div>
              </div>
            ),
          )}
        </div>
      )}

      {content.type === "job_card" && (
        <div
          className={`job-card-scope py-3 mx-auto px-3 mb-3 ${content.layout === "intro" ? "" : "border-top border-bottom"}`}
          style={content.layout === "intro" ? {} : { borderColor: "#ccc" }}
        >
          {(content.layout === "standard" || !content.layout) &&
            content.heading && (
              <div className="text-center mb-4">
                <h6 className="pt-3 text-gray-900 text-2xl font-medium mb-12">
                  {content.heading}
                </h6>
              </div>
            )}

          <div className="row">
            <div className="col-lg-5 col-md-5 col-sm-12 mb-4 mb-lg-0">
              {content.image_url ? (
                <img
                  src={getImageUrl(content.image_url)}
                  className="w-100 h-100 object-cover object-center rounded border"
                  style={{ height: "190px", objectFit: "cover" }}
                  alt={content.company_name || "job-image"}
                />
              ) : (
                <div
                  className="w-100 rounded border d-flex align-items-center justify-content-center bg-light text-muted"
                  style={{ height: "190px" }}
                >
                  <span style={{ fontSize: "12px" }}>No Image Available</span>
                </div>
              )}
            </div>

            <div className="col-lg-7 col-md-7 col-sm-12 d-flex flex-column justify-content-between">
              
                {content.layout === "intro" ? (
                  <span className="fs-18 leading-relaxed text-center d-block pb-3 text-slate-600">
                    {content.description}
                  </span>
                ) : (
                  <>
                    <h3
                      className="text-gray-900 text-3xl font-medium mb-1"
                      style={{ fontSize: "1.75rem" }}
                    >
                      {content.company_name}
                    </h3>
                    <div className="d-flex mb-2">
                      <span className="inline-block mx-2 py-1 mx-2 rounded text-xs font-medium tracking-widest text-uppercase mr-2 bg-green-50 text-green-700">
                        {content.badge_text}
                      </span>
                    </div>
                    <div className="d-block text-justify py-3 text-slate-600 leading-relaxed">
                      {content.description}
                    </div>
                  </>
                )}
              

              <div className="mt-auto d-flex flex-column align-items-end">
                <a
                  href={content.button_url}
                  className="d-inline-block text-center text-white border-0 py-2 px-8 text-lg rounded bg-green-700 hover:bg-green-800 transition-colors"
                  style={{ textDecoration: "none" }}
                >
                  {content.button_text || "View Careers"}
                </a>
                <div className="text-xs text-muted mt-3 d-block w-100 text-center">
                  {content.footer_text}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}