// app/contact/page.tsx
"use client";

import React, { useState } from 'react';

export default function ContactPage() {
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    setTimeout(() => {
      setIsSending(false);
      alert('Message sent successfully!');
    }, 2000);
  };

  return (
    <main id="main" className="container">
      <div id="post-83" className="content post-83 page type-page status-publish hentry">
        <p style={{ margin: '30px' }} className="gb-headline gb-headline-ebd47fe1">
          <span className="gb-icon">
            <svg viewBox="0 0 36.7 3" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 0h36.7v3H0z"></path>
            </svg>
          </span>
          <span
            className="gb-headline-text" 
            style={{
              textAlign: 'center',
              fontSize: '24px',
              fontWeight: '600',
              letterSpacing: '0.2em',
              textTransform: 'uppercase'
            }}>
            CONTACT
          </span>
        </p>


        <div className="wpforms-container wpforms-container-full wpforms-block wpforms-block-0bf5c913-192e-4e71-aa7f-6c8a89ba8d7b" id="wpforms-85">
          <form
            id="wpforms-form-85"
            className="wpforms-validate wpforms-form wpforms-ajax-form"
            onSubmit={handleSubmit}
            noValidate
          >
            <noscript className="wpforms-error-noscript">
              Please enable JavaScript in your browser to complete this form.
            </noscript>

            <div className="wpforms-field-container">

              {/* Field Name: First & Last */}
              <div
                id="wpforms-85-field_0-container"
                className="wpforms-field wpforms-field-name"
                data-field-id="0"
                style={{ marginBottom: '15px', width: '60%' }}
              >
                <label className="wpforms-field-label" style={{ marginBottom: '8px', display: 'block' }}>
                  Name <span className="wpforms-required-label" style={{ color: '#d63638' }}>*</span>
                </label>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '5px' }}>
                  <div style={{ flex: 1 }}>
                    <input
                      type="text"
                      id="wpforms-85-field_0"
                      className="wpforms-field-name-first wpforms-field-required"
                      name="wpforms[fields][0][first]"
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px' }}
                      required
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <input
                      type="text"
                      id="wpforms-85-field_0-last"
                      className="wpforms-field-name-last wpforms-field-required"
                      name="wpforms[fields][0][last]"
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px' }}
                      required
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', fontSize: '13px', color: '#666' }}>
                  <div style={{ flex: 1 }}>First</div>
                  <div style={{ flex: 1 }}>Last</div>
                </div>
              </div>

              {/* Field Email */}
              <div
                id="wpforms-85-field_1-container"
                className="wpforms-field wpforms-field-email"
                data-field-id="1"
                style={{ marginBottom: '15px' }}
              >
                <label className="wpforms-field-label" htmlFor="wpforms-85-field_1" style={{ marginBottom: '8px', display: 'block' }}>
                  Email <span className="wpforms-required-label" style={{ color: '#d63638' }}>*</span>
                </label>
                <input
                  type="email"
                  id="wpforms-85-field_1"
                  className="wpforms-field-medium wpforms-field-required"
                  name="wpforms[fields][1]"
                  style={{ width: '60%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px' }}
                  spellCheck="false"
                  required
                />
              </div>

              {/* Field Message */}
              <div
                id="wpforms-85-field_2-container"
                className="wpforms-field wpforms-field-textarea"
                data-field-id="2"
                style={{ marginBottom: '20px' }}
              >
                <label className="wpforms-field-label" htmlFor="wpforms-85-field_2" style={{ marginBottom: '8px', display: 'block' }}>
                  Comment or Message <span className="wpforms-required-label" style={{ color: '#d63638' }}>*</span>
                </label>
                <textarea
                  id="wpforms-85-field_2"
                  className="wpforms-field-medium wpforms-field-required"
                  name="wpforms[fields][2]"
                  style={{
                    width: '100%',
                    minHeight: '120px',
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    resize: 'vertical'
                  }}
                  required
                />
              </div>
            </div>

            {/* Submit Container */}
            <div className="wpforms-submit-container">
              <input type="hidden" name="wpforms[id]" value="85" />
              <input type="hidden" name="page_title" value="Contact" />

              <button
                type="submit"
                name="wpforms[submit]"
                id="wpforms-submit-85"
                className="wpforms-submit"
                data-alt-text="Sending..."
                data-submit-text="Submit"
                aria-live="assertive"
                value="wpforms-submit"
                disabled={isSending}
                style={{
                  padding: '10px 24px',
                  backgroundColor: '#f0f0f0',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: isSending ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '400'
                }}
              >
                {isSending ? "Sending..." : "Submit"}
              </button>

              {isSending && (
                <img
                  decoding="async"
                  src="https://roamroles.com/wp-content/plugins/wpforms-lite/assets/images/submit-spin.svg"
                  className="wpforms-submit-spinner"
                  style={{ display: 'inline-block', marginLeft: '10px', verticalAlign: 'middle' }}
                  width="26"
                  height="26"
                  alt="Loading"
                />
              )}
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}