import Grid from "@mui/material/Grid";
import "@/css/all.min.css";
import Image from 'next/image';
/* eslint-disable @next/next/no-html-link-for-pages */
export default function HomePage() {
  return (
    <main id="main" className="container">
      <div id="post-3" className="content post-3 page type-page status-publish hentry">
        
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
                <h2 className="post-title">Flexible Jobs That Pay Well: From House Cleaning to Home Office Roles</h2>
                <div className="post-excerpt">
                  <p>Looking for flexible work that fits your schedule and pays reliably? From home-based roles to seasonal gigs, there are growing opportunities — even without formal experience.</p>
                </div>
                <a href="/flexible-jobs-open/" className="home-post-readmore">Read More</a>
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
              <div className="home-post gb-container-724b7582" style={{ backgroundImage: "url('images/8.jpg')" }}>
                <h2 className="home-post-title" style={{ color: "var(--base-3)", fontSize: "24px", marginBottom: "5px" }}>
                  Opportunities at Wimpy: Open Jobs in SA With Pay Up to R7,000
                </h2>
                <a href="/opportunities-at-wimpy/" className="gb-button gb-button-70507aac arrow-link">Read More</a>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="home-post gb-container-724b7582" style={{ backgroundImage: "url('images/Canva.jpg')" }}>
                <h2 className="home-post-title" style={{ color: "var(--base-3)", fontSize: "24px", marginBottom: "5px" }}>
                  McDonald’s Job: Flexible Shifts and Staff Meals
                </h2>
                <a href="/mcdonalds-job/" className="gb-button gb-button-70507aac arrow-link">Read More</a>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="home-post gb-container-724b7582" style={{ backgroundImage: "url('images/cleaning-jobs-3.jpg')" }}>
                <h2 className="home-post-title" style={{ color: "var(--base-3)", fontSize: "24px", marginBottom: "5px" }}>
                  Now Hiring: Cleaning Jobs Available
                </h2>
                <a href="/cleaning-jobs/" className="gb-button gb-button-70507aac arrow-link">Read More</a>
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
            <span className="gb-headline-text">See more on:<br />Job Listings</span>
          </p>
          <div className="row">
            <div className="col-md-4 mb-4">
              <div className="home-post-mini gb-container-724b7582" style={{ backgroundImage: "url('images/entrevista_curriculo_2.jpg')" }}>
                <h2 className="home-post-title">Flexible Jobs That Pay Well: From House Cleaning to Home Office Roles</h2>
                <a href="/flexible-jobs-open/" className="gb-button gb-button-70507aac arrow-link">Read More</a>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="home-post-mini gb-container-724b7582" style={{ backgroundImage: "url('images/8.jpg')" }}>
                <h2 className="home-post-title">Opportunities at Wimpy: Open Jobs in SA With Pay Up to R7,000</h2>
                <a href="/opportunities-at-wimpy/" className="gb-button gb-button-70507aac arrow-link">Read More</a>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="home-post-mini gb-container-724b7582" style={{ backgroundImage: "url('images/Chat-GPT-4.jpg')" }}>
                <h2 className="home-post-title">Job Opportunities at Pick n Pay: Find your career path</h2>
                <a href="/pick-n-pay-job-opportunities/" className="gb-button gb-button-70507aac arrow-link">Read More</a>
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
            <span className="gb-headline-text">See more on:<br />Guides</span>
          </p>
          <div className="row">
            <div className="col-md-4 mb-4">
              <div className="home-post-mini gb-container-724b7582" style={{ backgroundImage: "url('images/A-business-meeting-in-a-modern-office-in-Lagos-Nigeria-featuring-two-professionals-engaged-in-a-discussion.jpg')" }}>
                <h2 className="home-post-title">The Complete Guide to Preparing for Interviews in South Africa</h2>
                <a href="/complete-guide-preparing-interviews-south-africa/" className="gb-button gb-button-70507aac arrow-link">Read More</a>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="home-post-mini gb-container-724b7582" style={{ backgroundImage: "url('images/A-focused-businessman-in-formal-attire-holding-a-notebook-against-a-neutral-background.jpg')" }}>
                <h2 className="home-post-title">How to write a standout CV for South African employers</h2>
                <a href="/how-to-write-a-standout-cv-for-south-african-employers/" className="gb-button gb-button-70507aac arrow-link">Read More</a>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="home-post-mini gb-container-724b7582" style={{ backgroundImage: "url('images/African-American-woman-presenting-in-office-environment-with-clipboard-and-whiteboard.jpg')" }}>
                <h2 className="home-post-title">Long-term Career Planning: Steps for Success</h2>
                <a href="/long-term-career-planning-steps-for-success/" className="gb-button gb-button-70507aac arrow-link">Read More</a>
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
            <span className="gb-headline-text">See more on:<br />Career Stories</span>
          </p>
          <div className="row">
            <div className="col-md-4 mb-4">
              <div className="home-post-mini gb-container-724b7582" style={{ backgroundImage: "url('images/Business-professionals-conducting-an-interview-with-resume-on-clipboard-in-an-office-setting.jpg')" }}>
                <h2 className="home-post-title">Returning to the Workforce After a Career Break: A South African Guide</h2>
                <a href="/returning-to-the-workforce-after-a-career-break-practical-steps-for-south-africans/" className="gb-button gb-button-70507aac arrow-link">Read More</a>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="home-post-mini gb-container-724b7582" style={{ backgroundImage: "url('images/A-man-in-stripes-works-intently-on-a-laptop-indoors-showcasing-productivity-and-focus.jpg')" }}>
                <h2 className="home-post-title">Balancing career success and personal life: real stories</h2>
                <a href="/balancing-career-success-and-personal-life-real-stories/" className="gb-button gb-button-70507aac arrow-link">Read More</a>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="home-post-mini gb-container-724b7582" style={{ backgroundImage: "url('images/A-group-of-professionals-engaged-in-a-collaborative-meeting-at-an-office-with-laptops-and-documents-1.jpg')" }}>
                <h2 className="home-post-title">First-job experiences: what graduates can expect</h2>
                <a href="/first-job-experiences-what-graduates-can-expect/" className="gb-button gb-button-70507aac arrow-link">Read More</a>
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
            <span className="gb-headline-text">See more on:<br />Remote Work</span>
          </p>
          <div className="row">
            <div className="col-md-4 mb-4">
              <div className="home-post-mini gb-container-724b7582" style={{ backgroundImage: "url('images/Two-professionals-working-together-on-a-laptop-showcasing-teamwork-in-a-modern-office-setting.jpg')" }}>
                <h2 className="home-post-title">The Future of Remote Work in South Africa: Shifts, Challenges, and Opportunities</h2>
                <a href="/the-future-of-remote-work-in-south-africa-shifts-challenges-and-opportunities/" className="gb-button gb-button-70507aac arrow-link">Read More</a>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="home-post-mini gb-container-724b7582" style={{ backgroundImage: "url('images/A-child-in-uniform-walks-past-a-rural-South-African-home-on-a-sunny-day.jpg')" }}>
                <h2 className="home-post-title">Remote Work Success Stories from Across the Country</h2>
                <a href="/remote-work-success-stories-from-across-the-country/" className="gb-button gb-button-70507aac arrow-link">Read More</a>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="home-post-mini gb-container-724b7582" style={{ backgroundImage: "url('images/Focused-young-woman-working-on-a-laptop-at-her-desk-managing-finances.jpg')" }}>
                <h2 className="home-post-title">Taxes and remote work: what South Africans should know</h2>
                <a href="/taxes-and-remote-work-what-south-africans-should-know/" className="gb-button gb-button-70507aac arrow-link">Read More</a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}