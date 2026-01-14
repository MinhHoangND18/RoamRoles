'use client'; 

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import "@/css/all.min.css";

const Footer = () => {
  const getFooterConfig = () => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname.includes('jobsmatch4u.com')) {
        return {
          logo: '/images/jobsmatch4u1.png',
          alt: 'Jobs Match 4U Logo',
          copyright: '© 2026 Jobs Match 4U - All rights reserved.'
        };
      }
    }
    return {
      logo: '/images/jobzesty1.png',
      alt: 'Job Zesty Logo',
      copyright: '© 2026 Job Zesty - All rights reserved.'
    };
  };

  const [config] = useState(getFooterConfig);

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
              <div className="widget mt-3" style={{ marginTop: '20px' }}>
                <figure className="wp-block-image size-full is-resized">
                  <Image
                    src={config.logo}
                    alt={config.alt}
                    width={500}
                    height={500} 
                    className="wp-image-340"
                    style={{ width: '186px', height: 'auto'}}
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
                <li className="menu-item"><Link href="/about">About</Link></li>
                <li className="menu-item"><Link href="/contact">Contact</Link></li>
                <li className="menu-item"><Link href="/terms">Terms of Use</Link></li>
                <li className="menu-item"><Link href="/privacy">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>

          {/* Categories */}
          <div className="col-md-3">
            <h4>Categories</h4>
            <ul>
              <li className="cat-item"><Link href="#">Career Stories</Link></li>
              <li className="cat-item"><Link href="#">Guides</Link></li>
              <li className="cat-item"><Link href="#">Job Listings</Link></li>
              <li className="cat-item"><Link href="#">Planning</Link></li>
              <li className="cat-item"><Link href="#">Remote Work</Link></li>
            </ul>
          </div>

          <div className="col-md-3">
            <div className="social-icons"></div>
          </div>
        </div>

        {/* Copyright Row */}
        <div className="row">
          <div className="col-md-12 text-center">
            <p>{config.copyright}</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;