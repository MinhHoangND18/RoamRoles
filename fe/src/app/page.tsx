import "@/css/all.min.css";
import Image from "next/image";
import { fetchAllPosts } from "@/lib/posts-api";
import { transformContent } from "@/lib/content-utils";

/* eslint-disable @next/next/no-html-link-for-pages */

// Strip HTML tags để lấy text thuần
const stripHtml = (html: string) => {
  return html.replace(/<[^>]*>/g, '').trim();
};

const normalizeText = (text: string) => {
  return stripHtml(text)
    .toLowerCase()
    .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'") 
    .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"') 
    .replace(/[\u2013\u2014\u2015]/g, '-') 
    .replace(/\s+/g, ' ')
    .trim();
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ s?: string }>;
}) {
  const params = await searchParams;
  const query = normalizeText(params?.s || "");

  if (query) {
    const posts = (await fetchAllPosts()) || [];

    // Helper để check xem post có ảnh thật không (không phải default)
    const hasImage = (post: { content?: string }) => {
      const imgMatch = post.content?.match(/<img[^>]+src="([^"]+)"/);
      return imgMatch && imgMatch[1] && !imgMatch[1].includes('default-post.jpg');
    };

    const filteredPosts = posts.filter((post) => {
      // Loại bỏ các post không có ảnh
      if (!hasImage(post)) {
        return false;
      }

      // Strip HTML trước khi search - chỉ tìm trong nội dung text, không tìm trong HTML tags
      const processedTitle = normalizeText(transformContent(post.title || ""));

      const processedExcerpt = normalizeText(transformContent(post.excerpt || ""));

      return (
        processedTitle.includes(query) ||
        processedExcerpt.includes(query)
      );
    });

    const truncateText = (text: string, maxLength: number = 150) => {
      const stripped = stripHtml(text);
      if (stripped.length <= maxLength) return stripped;
      return stripped.substring(0, maxLength) + '...';
    };

    const getPostImage = (post: { content?: string; slug: string }) => {
      const imgMatch = post.content?.match(/<img[^>]+src="([^"]+)"/);
      if (imgMatch && imgMatch[1]) {
        return imgMatch[1].replace(/https:\/\/roamroles\.com\/wp-content\/uploads\/(?:sites\/\d+\/)?\d{4}\/\d{2}\//g, '/images/');
      }
      return '/images/default-post.jpg';
    };

    return (
      <main id="main" className="container my-5">
        <h2 className="mb-4">Search Results for: &quot;{params?.s}&quot;</h2>
        {filteredPosts.length > 0 ? (
          <div className="row">
            {filteredPosts.map((post) => {
              const title = stripHtml(transformContent(post.title || ''));
              const excerpt = truncateText(transformContent(post.excerpt || ''));
              const imageUrl = getPostImage(post);

              return (
                <article
                  key={post.id}
                  className="col-lg-4 col-md-6 mb-4 post type-post status-publish format-standard has-post-thumbnail hentry"
                  id={`post-${post.id}`}
                >
                  <div className="card h-100">
                    <div className="card-body flex-grow-1 d-flex flex-column">
                      <div className="post-thumbnail mb-3">
                        <Image
                          alt={title}
                          className="img-fluid wp-post-image"
                          decoding="async"
                          height={350}
                          width={525}
                          src={imageUrl}
                          style={{ objectFit: 'cover', width: '100%', height: 'auto' }}
                        />
                      </div>
                      <h2 className="card-title">
                        <a
                          href={`/${post.slug}`}
                          rel="bookmark"
                          title={`Permalink to ${title}`}
                        >
                          {title}
                        </a>
                      </h2>
                      <div className="card-text entry-content flex-grow-1">
                        <p>{excerpt}</p>
                      </div>
                      <footer className="entry-meta mt-auto p-3">
                        <a
                          className="btn btn-outline-secondary float-end"
                          href={`/${post.slug}`}
                        >
                          See More
                        </a>
                      </footer>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p>No posts found matching your search.</p>
        )}
      </main>
    );
  }

  return (
    <main id="main" className="container">
      <div
        id="post-3"
        className="content post-3 page type-page status-publish hentry"
      >
        {/* --- SECTION: FEATURED POST --- */}
        <div className="container py-5">
          <div className="row align-items-center">
            <div className="py-3 col-md-6 order-md-2">
              <Image
                width="768"
                height="512"
                src="/images/entrevista_curriculo_2.jpg"
                className="img-fluid rounded wp-post-image"
                alt="Flexible Jobs"
                decoding="async"
              />
            </div>
            <div className="col-md-6 order-md-1">
              <div className="post-content">
                <h2 className="post-title">
                  Flexible Jobs That Pay Well: From House Cleaning to Home
                  Office Roles
                </h2>
                <div className="post-excerpt">
                  <p>
                    Looking for flexible work that fits your schedule and pays
                    reliably? From home-based roles to seasonal gigs, there are
                    growing opportunities — even without formal experience.
                  </p>
                </div>
                <a
                  href="/flexible-jobs-open/"
                  className="home-post-readmore"
                >
                  Read More
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* --- SECTION: WHAT'S TRENDING --- */}
        <div className="container my-5">
          <p className="gb-headline gb-headline-ebd47fe1">
            <span className="gb-icon">
              <svg viewBox="0 0 36.7 3" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0h36.7v3H0z"></path>
              </svg>
            </span>
            <span className="gb-headline-text">What`s Trending?</span>
          </p>
          <div className="row">
            <div className="col-md-4 mb-4">
              <div
                className="home-post gb-container-724b7582"
                style={{ backgroundImage: "url('images/8.jpg')" }}
              >
                <h2
                  className="home-post-title"
                  style={{
                    color: "var(--base-3)",
                    fontSize: "24px",
                    marginBottom: "5px",
                  }}
                >
                  Opportunities at Wimpy: Open Jobs in SA With Pay Up to R7,000
                </h2>
                <a
                  href="/opportunities-at-wimpy/"
                  className="gb-button gb-button-70507aac arrow-link"
                >
                  Read More
                </a>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div
                className="home-post gb-container-724b7582"
                style={{ backgroundImage: "url('images/Canva.jpg')" }}
              >
                <h2
                  className="home-post-title"
                  style={{
                    color: "var(--base-3)",
                    fontSize: "24px",
                    marginBottom: "5px",
                  }}
                >
                  McDonald’s Job: Flexible Shifts and Staff Meals
                </h2>
                <a
                  href="/mcdonalds-job/"
                  className="gb-button gb-button-70507aac arrow-link"
                >
                  Read More
                </a>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div
                className="home-post gb-container-724b7582"
                style={{ backgroundImage: "url('images/cleaning-jobs-3.jpg')" }}
              >
                <h2
                  className="home-post-title"
                  style={{
                    color: "var(--base-3)",
                    fontSize: "24px",
                    marginBottom: "5px",
                  }}
                >
                  Now Hiring: Cleaning Jobs Available
                </h2>
                <a
                  href="/cleaning-jobs/"
                  className="gb-button gb-button-70507aac arrow-link"
                >
                  Read More
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* --- SECTION: JOB LISTINGS --- */}
        <div className="container my-5">
          <p className="gb-headline gb-headline-ebd47fe1">
            <span className="gb-icon">
              <svg viewBox="0 0 36.7 3" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0h36.7v3H0z"></path>
              </svg>
            </span>
            <span className="gb-headline-text">
              See more on:
              <br />
              Job Listings
            </span>
          </p>
          <div className="row">
            <div className="col-md-4 mb-4">
              <div
                className="home-post-mini gb-container-724b7582"
                style={{
                  backgroundImage: "url('images/entrevista_curriculo_2.jpg')",
                }}
              >
                <h2 className="home-post-title">
                  Flexible Jobs That Pay Well: From House Cleaning to Home
                  Office Roles
                </h2>
                <a
                  href="/flexible-jobs-open/"
                  className="gb-button gb-button-70507aac arrow-link"
                >
                  Read More
                </a>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div
                className="home-post-mini gb-container-724b7582"
                style={{ backgroundImage: "url('images/8.jpg')" }}
              >
                <h2 className="home-post-title">
                  Opportunities at Wimpy: Open Jobs in SA With Pay Up to R7,000
                </h2>
                <a
                  href="/opportunities-at-wimpy/"
                  className="gb-button gb-button-70507aac arrow-link"
                >
                  Read More
                </a>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div
                className="home-post-mini gb-container-724b7582"
                style={{ backgroundImage: "url('images/Chat-GPT-4.jpg')" }}
              >
                <h2 className="home-post-title">
                  Job Opportunities at Pick n Pay: Find your career path
                </h2>
                <a
                  href="/pick-n-pay-job-opportunities/"
                  className="gb-button gb-button-70507aac arrow-link"
                >
                  Read More
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* --- SECTION: GUIDES --- */}
        <div className="container my-5">
          <p className="gb-headline gb-headline-ebd47fe1">
            <span className="gb-icon">
              <svg viewBox="0 0 36.7 3" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0h36.7v3H0z"></path>
              </svg>
            </span>
            <span className="gb-headline-text">
              See more on:
              <br />
              Guides
            </span>
          </p>
          <div className="row">
            <div className="col-md-4 mb-4">
              <div
                className="home-post-mini gb-container-724b7582"
                style={{
                  backgroundImage:
                    "url('images/A-business-meeting-in-a-modern-office-in-Lagos-Nigeria-featuring-two-professionals-engaged-in-a-discussion.jpg')",
                }}
              >
                <h2 className="home-post-title">
                  The Complete Guide to Preparing for Interviews in South Africa
                </h2>
                <a
                  href="/complete-guide-preparing-interviews-south-africa/"
                  className="gb-button gb-button-70507aac arrow-link"
                >
                  Read More
                </a>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div
                className="home-post-mini gb-container-724b7582"
                style={{
                  backgroundImage:
                    "url('images/A-focused-businessman-in-formal-attire-holding-a-notebook-against-a-neutral-background.jpg')",
                }}
              >
                <h2 className="home-post-title">
                  How to write a standout CV for South African employers
                </h2>
                <a
                  href="/how-to-write-a-standout-cv-for-south-african-employers/"
                  className="gb-button gb-button-70507aac arrow-link"
                >
                  Read More
                </a>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div
                className="home-post-mini gb-container-724b7582"
                style={{
                  backgroundImage:
                    "url('images/African-American-woman-presenting-in-office-environment-with-clipboard-and-whiteboard.jpg')",
                }}
              >
                <h2 className="home-post-title">
                  Long-term Career Planning: Steps for Success
                </h2>
                <a
                  href="/long-term-career-planning-steps-for-success/"
                  className="gb-button gb-button-70507aac arrow-link"
                >
                  Read More
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* --- SECTION: CAREER STORIES --- */}
        <div className="container my-5">
          <p className="gb-headline gb-headline-ebd47fe1">
            <span className="gb-icon">
              <svg viewBox="0 0 36.7 3" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0h36.7v3H0z"></path>
              </svg>
            </span>
            <span className="gb-headline-text">
              See more on:
              <br />
              Career Stories
            </span>
          </p>
          <div className="row">
            <div className="col-md-4 mb-4">
              <div
                className="home-post-mini gb-container-724b7582"
                style={{
                  backgroundImage:
                    "url('images/Business-professionals-conducting-an-interview-with-resume-on-clipboard-in-an-office-setting.jpg')",
                }}
              >
                <h2 className="home-post-title">
                  Returning to the Workforce After a Career Break: A South
                  African Guide
                </h2>
                <a
                  href="/returning-to-the-workforce-after-a-career-break-practical-steps-for-south-africans/"
                  className="gb-button gb-button-70507aac arrow-link"
                >
                  Read More
                </a>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div
                className="home-post-mini gb-container-724b7582"
                style={{
                  backgroundImage:
                    "url('images/A-man-in-stripes-works-intently-on-a-laptop-indoors-showcasing-productivity-and-focus.jpg')",
                }}
              >
                <h2 className="home-post-title">
                  Balancing career success and personal life: real stories
                </h2>
                <a
                  href="/balancing-career-success-and-personal-life-real-stories/"
                  className="gb-button gb-button-70507aac arrow-link"
                >
                  Read More
                </a>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div
                className="home-post-mini gb-container-724b7582"
                style={{
                  backgroundImage:
                    "url('images/A-group-of-professionals-engaged-in-a-collaborative-meeting-at-an-office-with-laptops-and-documents-1.jpg')",
                }}
              >
                <h2 className="home-post-title">
                  First-job experiences: what graduates can expect
                </h2>
                <a
                  href="/first-job-experiences-what-graduates-can-expect/"
                  className="gb-button gb-button-70507aac arrow-link"
                >
                  Read More
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* --- SECTION: REMOTE WORK --- */}
        <div className="container my-5">
          <p className="gb-headline gb-headline-ebd47fe1">
            <span className="gb-icon">
              <svg viewBox="0 0 36.7 3" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0h36.7v3H0z"></path>
              </svg>
            </span>
            <span className="gb-headline-text">
              See more on:
              <br />
              Remote Work
            </span>
          </p>
          <div className="row">
            <div className="col-md-4 mb-4">
              <div
                className="home-post-mini gb-container-724b7582"
                style={{
                  backgroundImage:
                    "url('images/Two-professionals-working-together-on-a-laptop-showcasing-teamwork-in-a-modern-office-setting.jpg')",
                }}
              >
                <h2 className="home-post-title">
                  The Future of Remote Work in South Africa: Shifts, Challenges,
                  and Opportunities
                </h2>
                <a
                  href="/the-future-of-remote-work-in-south-africa-shifts-challenges-and-opportunities/"
                  className="gb-button gb-button-70507aac arrow-link"
                >
                  Read More
                </a>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div
                className="home-post-mini gb-container-724b7582"
                style={{
                  backgroundImage:
                    "url('images/A-child-in-uniform-walks-past-a-rural-South-African-home-on-a-sunny-day.jpg')",
                }}
              >
                <h2 className="home-post-title">
                  Remote Work Success Stories from Across the Country
                </h2>
                <a
                  href="/remote-work-success-stories-from-across-the-country/"
                  className="gb-button gb-button-70507aac arrow-link"
                >
                  Read More
                </a>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div
                className="home-post-mini gb-container-724b7582"
                style={{
                  backgroundImage:
                    "url('images/Focused-young-woman-working-on-a-laptop-at-her-desk-managing-finances.jpg')",
                }}
              >
                <h2 className="home-post-title">
                  Taxes and remote work: what South Africans should know
                </h2>
                <a
                  href="/taxes-and-remote-work-what-south-africans-should-know/"
                  className="gb-button gb-button-70507aac arrow-link"
                >
                  Read More
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}