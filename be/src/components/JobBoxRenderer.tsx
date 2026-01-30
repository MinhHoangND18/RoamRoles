import { ReusableBlock } from "@/types";

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
        .job-box-scope .text-center {
          text-align: center !important;
        }
        .job-box-scope .w-100 {
          width: 100% !important;
        }
      `}</style>

      <div
        className="d-sm-block py-3 mx-auto px-3 mb-3 border-top border-bottom"
        style={{ borderColor: "rgb(204, 204, 204)" }}
      >
        <div className="text-center mb-4">
          <h6 className="pt-3 text-center text-gray-900 text-l font-medium mb-3">
            {content.heading || "Open Roles"}
          </h6>
        </div>

        <div className="row">
          <div className="col-lg-5 col-md-5 col-sm-12 mb-4 mb-lg-0">
            <div className="image-wrapper">
              {content.image_url ? (
                <img
                  alt={content.company_name || "Company Logo"}
                  src={content.image_url}
                  style={{ objectFit: "cover", height: "190px" }}
                  className="w-100 h-100 object-cover object-center rounded border-gray-300 border"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-300">
                  <svg
                    className="w-12 h-12 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    No Image Provided
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="col-lg-7 col-md-7 col-sm-12 d-flex flex-column justify-content-between">
            <div>
              <h3
                className="text-gray-900 text-3xl font-medium mb-1"
                style={{ fontSize: "1.75rem" }}
              >
                {content.company_name}
              </h3>
              <div className="flex ">
                <span className="inline-block mx-2 py-1 mx-2 rounded text-xs font-medium tracking-widest text-uppercase mr-2 bg-green-50 text-green-700">
                  {content.badge_text}
                </span>
              </div>
              <div
                className="d-block text-justify py-3 text-slate-600"
                style={{ fontSize: "16px", lineHeight: "1.5" }}
              >
                {content.description}
              </div>
            </div>

            <div className="mt-auto d-flex flex-column align-items-end">
              <a
                href={content.button_url}
                target="_blank"
                className="d-inline-block text-center text-white border-0 py-2 px-8 text-lg rounded bg-green-700 hover:bg-green-800 transition-colors"
                style={{
                  textDecoration: "none",
                  width: "fit-content",
                  backgroundColor: "#157347",
                }}
              >
                {content.button_text}
              </a>
              <div className="text-xs text-muted mt-3 d-block w-100 text-center">
                {content.footer_text}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}