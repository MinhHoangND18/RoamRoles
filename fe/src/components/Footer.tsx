import Link from 'next/link';
import Image from 'next/image';
import "@/css/all.min.css";

const Footer = () => {
  return (
    <footer id="footer">
      <div className="container">
        <div className="row">
          {/* Logo */}
          <div className="col-md-3 d-flex align-items-center">
            <div id="footer-widget-1" className="footer-widget-area">
              <div className="widget">
                <h5 className="wp-block-heading has-text-align-left"> </h5>
              </div>
              <div className="widget  mt-3" style={{ marginTop: '20px' }}>
                <figure className="wp-block-image size-full is-resized">
                  <Image
                    src="/images/jobzesty.png"
                    alt="Roam Roles Logo"
                    width={500}
                    height={500} 
                    className="wp-image-340"
                    style={{ width: '186px', height: '86px'}}
                  />
                </figure>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="col-md-3">
            <h4>Links</h4>
            <div className="menu-legal-container">
              <ul id="menu-legal" className="footer-links">
                <li id="menu-item-326" className="menu-item menu-item-type-post_type menu-item-object-page">
                  <Link href="/home/about/">About</Link>
                </li>
                <li id="menu-item-327" className="menu-item menu-item-type-post_type menu-item-object-page">
                  <Link href="/contact/">Contact</Link>
                </li>
                <li id="menu-item-328" className="menu-item menu-item-type-post_type menu-item-object-page">
                  <Link href="/terms/">Terms of Use</Link>
                </li>
                <li id="menu-item-338" className="menu-item menu-item-type-post_type menu-item-object-page">
                  <Link href="/privacy/">Privacy Policy</Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Categories */}
          <div className="col-md-3">
            <h4>Categories</h4>
            <ul>
              <li className="cat-item cat-item-2">
                <Link href="/category/career-stories/">Career Stories</Link>
              </li>
              <li className="cat-item cat-item-5">
                <Link href="/category/guides/">Guides</Link>
              </li>
              <li className="cat-item cat-item-10">
                <Link href="/category/job-listings/">Job Listings</Link>
              </li>
              <li className="cat-item cat-item-3">
                <Link href="/category/planning/">Planning</Link>
              </li>
              <li className="cat-item cat-item-6">
                <Link href="/category/remote-work/">Remote Work</Link>
              </li>
            </ul>
          </div>

          <div className="col-md-3">
            <h4></h4>
            <div className="social-icons">
            </div>
          </div>
        </div>

        {/* Copyright Row */}
        <div className="row">
          <div className="col-md-12 text-center">
            <p>© 2026 Roam Roles - All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;