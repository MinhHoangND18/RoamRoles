import { ReusableBlock } from "@/types/ReusableBlock";

export default function JobBoxRenderer({ block }: { block: ReusableBlock }) {
  const content = JSON.parse(block.content_json);

  return (
    <div
      className="d-sm-block py-3 mx-auto px-3 mb-3 border-top border-bottom"
      style={{ borderColor: "#ccc" }}
    >
      <div className="text-center mb-4">
        <h6 className="pt-3 text-center text-gray-900 text-2xl font-medium mb-3">
          {content.heading || "Open Roles"}
        </h6>
      </div>
      <div className="row">
        <div className="col-lg-5 col-md-5 col-sm-12 mb-4 mb-lg-0">
          {content.image_url && (
            <img
              src={content.image_url}
              alt={content.company_name}
              className="w-100 h-100 object-cover object-center rounded border"
              style={{ objectFit: "cover", height: "190px" }}
            />
          )}
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
            <div className="d-block text-justify py-3 text-slate-600">
              {content.description}
            </div>
          </div>

          <div className="mt-auto d-flex flex-column align-items-end">
            <a
              href={content.button_url}
              target="_blank"
              className="d-inline-block w-50 text-center text-white border-0 py-2 px-8 text-lg rounded bg-green-700 hover:bg-green-800 transition-colors"
              style={{ textDecoration: "none", width: "fit-content" }}
            >
              {content.button_text || "Visit Application Site"}
            </a>
            <div className="text-xs text-muted mt-3 d-block w-100 text-center">
              {content.footer_text ||
                "You’ll be redirected to an external site"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}