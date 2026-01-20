"use client";

import React, { useState } from 'react';
import { Loader2 } from "lucide-react";
import { API_CONFIG } from "@/constants/app-config";
import toast, { Toaster } from 'react-hot-toast'; 

export default function ContactPage() {
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      first_name: formData.get("first_name"),
      last_name: formData.get("last_name"),
      email: formData.get("email"),
      message: formData.get("message"),
    };

    if (!payload.first_name || !payload.last_name || !payload.email || !payload.message) {
      toast.error("Please fill in all required fields."); // Thông báo lỗi nhập liệu
      return;
    }

    setIsSending(true);

    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to send message");
      }

      const data = await res.json();
      console.log("Contact saved:", data);

      // 2. Hiện popup thành công ở bên phải
      toast.success("Message sent successfully!", {
        position: "top-right",
      });
      
      form.reset();
    } catch (err) {
      console.error("Submit error:", err);
      // 3. Hiện popup lỗi ở bên phải
      toast.error("Failed to send message. Please try again.", {
        position: "top-right",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main id="main" className="container" style={{ padding: '40px 0' }}>
      {/* 4. Thêm component Toaster để hiển thị popup */}
      <Toaster /> 

      <div className="content-wrapper">
        <div id="post-83" className="content">
          <p style={{ margin: '30px 0', textAlign: 'center' }}>
            <span style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
              <svg viewBox="0 0 36.7 3" xmlns="http://www.w3.org/2000/svg" style={{ width: '50px' }}>
                <path d="M0 0h36.7v3H0z" fill="#a30bef"></path>
              </svg>
            </span>
            <span style={{ fontSize: '24px', fontWeight: '600', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              CONTACT
            </span>
          </p>

          <div className="wpforms-container">
            <form onSubmit={handleSubmit}>
              <div className="wpforms-field-container">
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ marginBottom: '8px', display: 'block', fontWeight: '500' }}>
                    Name <span style={{ color: '#d63638' }}>*</span>
                  </label>
                  <div className="name-group">
                    <div className="name-field">
                      <input name="first_name" type="text" className="form-input" required />
                      <div className="sub-label">First</div>
                    </div>
                    <div className="name-field">
                      <input name="last_name" type="text" className="form-input" required />
                      <div className="sub-label">Last</div>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ marginBottom: '8px', display: 'block', fontWeight: '500' }}>
                    Email <span style={{ color: '#d63638' }}>*</span>
                  </label>
                  <input name="email" type="email" className="form-input" required />
                </div>

                <div style={{ marginBottom: '25px' }}>
                  <label style={{ marginBottom: '8px', display: 'block', fontWeight: '500' }}>
                    Comment or Message <span style={{ color: '#d63638' }}>*</span>
                  </label>
                  <textarea name="message" className="form-input" style={{ minHeight: '120px' }} required />
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <button
                  type="submit"
                  disabled={isSending}
                  className="submit-button"
                >
                  {isSending && <Loader2 className="spinner" />}
                  {isSending ? "Sending..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style jsx>{`
        .content-wrapper {
          width: 100%;
          max-width: 60%;
          margin: 0 auto;
          transition: max-width 0.3s ease;
        }

        @media (max-width: 910px) {
          .content-wrapper {
            max-width: 100%;
            padding: 0 15px;
          }
        }

        .name-group {
          display: flex;
          gap: 15px;
        }
        .name-field {
          flex: 1;
        }
        .form-input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          outline: none;
        }
        .sub-label {
          font-size: 11px;
          color: #666;
          margin-top: 4px;
        }

        .submit-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 12px 60px;
          background-color: ${isSending ? '#c4b5fd' : '#a30bef'};
          color: #fff;
          border: none;
          border-radius: 8px;
          cursor: ${isSending ? 'not-allowed' : 'pointer'};
          font-size: 15px;
          font-weight: 600;
          transition: all 0.3s ease;
          min-width: 200px;
          text-transform: uppercase;
        }

        :global(.spinner) {
          width: 18px;
          height: 18px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}