'use client';

/* eslint-disable @next/next/no-html-link-for-pages */
import Image from 'next/image';
import { useState, useSyncExternalStore } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import "@/css/all.min.css";

const defaultLogoConfig = {
  src: '/images/jobzesty1.png',
  href: '/',
  alt: 'Job Zesty'
};

const jobsmatchLogoConfig = {
  src: '/images/jobsmatch4u1.png',
  href: 'https://jobsmatch4u.com/',
  alt: 'Jobs Match 4U'
};

const jobzestyLogoConfig = {
  src: '/images/jobzesty1.png',
  href: 'https://jobzesty.com/',
  alt: 'Job Zesty'
};

// Cache logo config - trả về object đã tồn tại, không tạo mới
let cachedLogoConfig = defaultLogoConfig;
const getLogoConfig = () => {
  if (typeof window === 'undefined') return defaultLogoConfig;
  const hostname = window.location.hostname;
  if (hostname.includes('jobsmatch4u.com')) {
    cachedLogoConfig = jobsmatchLogoConfig;
  } else {
    cachedLogoConfig = jobzestyLogoConfig;
  }
  return cachedLogoConfig;
};

const Header = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const initialQuery = searchParams.get('s') || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  const logoConfig = useSyncExternalStore(
    () => () => {},
    getLogoConfig,
    () => defaultLogoConfig
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/?s=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header style={{ minHeight: '80px' }}>
      <nav id="header" className="navbar navbar-expand-md navbar-light bg-light home">
        <div className="container">
          {/* Logo Section */}
          <a href={logoConfig.href} className="navbar-brand" title={logoConfig.alt}>
            <Image
              src={logoConfig.src}
              alt={logoConfig.alt}
              width={200}
              height={58}
              style={{
                width: '200px', 
                height: 'auto',
                marginRight: '0px'
              }}
            />
          </a>

          {/* Mobile Menu Button */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbar"
            aria-controls="navbar"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div id="navbar" className="collapse navbar-collapse">
            {/* Navigation Links */}
            <ul id="menu-categories" className="navbar-nav me-auto">
              <li className="menu-item nav-item">
                <a 
                  href="/category/career-stories/" 
                  className={`nav-link ${pathname?.includes('/category/career-stories') ? 'active fw-bold' : ''}`} 
                  title="Career Stories"
                >
                  Career Stories
                </a>
              </li>
              <li className="menu-item nav-item">
                <a 
                  href="/category/job-listings/" 
                  className={`nav-link ${pathname?.includes('/category/job-listings') ? 'active fw-bold' : ''}`} 
                  title="Job Listings"
                >
                  Job Listings
                </a>
              </li>
              <li className="menu-item nav-item">
                <a 
                  href="/category/remote-work/" 
                  className={`nav-link ${pathname?.includes('/category/remote-work') ? 'active fw-bold' : ''}`} 
                  title="Remote Work"
                >
                  Remote Work
                </a>
              </li>
            </ul>

            {/* Search Container */}
            <div className="search-container">
              <form
                id="site-search-form"
                className="search-form"
                role="search"
                onSubmit={handleSearch}
              >
                <div className="input-group">
                  <input
                    type="text"
                    id="search-input"
                    name="s"
                    className="form-control"
                    placeholder="Search"
                    required
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="submit" className="btn btn-activeview" aria-label="Search">
                    <i className="fas fa-search"></i>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
