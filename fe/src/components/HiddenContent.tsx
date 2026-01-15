'use client';

import { useState } from 'react';
import "@/css/all.min.css";

export default function HiddenContent() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/?s=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <main id="main" className="container">
      <div id="post-0" className="content error404 not-found">
        <h1 className="entry-title">Not found</h1>
        <div className="entry-content">
          <p>It looks like nothing was found at this location.</p>
          <div>
            <form 
              id="site-search-form" 
              className="search-form" 
              role="search" 
              method="get" 
              action="/"
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
    </main>
  );
}

