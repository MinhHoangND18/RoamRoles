'use client'; 

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import "@/css/all.min.css";

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {

      router.push(`/?s=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header>
      <nav id="header" className="navbar navbar-expand-md navbar-light bg-light home">
        <div className="container">
          {/* Logo Section */}
          <Link href="/" className="navbar-brand" title="Roam Roles">
            <Image 
              src="/images/jobzesty.png" 
              alt="Roam Roles"
              width={120} 
              height={40}
              style={{ marginRight: '0px' }}
            />
          </Link>

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
                <Link href="/category/career-stories/" className="nav-link" title="Career Stories">
                  Career Stories
                </Link>
              </li>
              <li className="menu-item nav-item">
                <Link href="/category/job-listings/" className="nav-link" title="Job Listings">
                  Job Listings
                </Link>
              </li>
              <li className="menu-item nav-item">
                <Link href="/category/remote-work/" className="nav-link" title="Remote Work">
                  Remote Work
                </Link>
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