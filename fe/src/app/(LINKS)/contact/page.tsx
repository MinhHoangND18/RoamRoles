"use client";

import React, { useState } from 'react';
import { Loader2 } from "lucide-react";
import { API_CONFIG } from "@/constants/app-config";
import toast, { Toaster } from 'react-hot-toast';

import styles from '@/css/contact.module.css';

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
      domain: window.location.href,
      referer: document.referrer || "",
    };

    if (!payload.first_name || !payload.last_name || !payload.email || !payload.message) {
      toast.error("Please fill in all required fields.");
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

      toast.success("Message sent successfully!", {
        position: "top-right",
      });

      form.reset();
    } catch (err) {
      console.error("Submit error:", err);
      toast.error("Failed to send message. Please try again.", {
        position: "top-right",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main id="main" className="container" style={{ padding: '40px 0' }}>
      <Toaster />

      <div className={styles.contentWrapper}>
        <div id="post-83" className="content">
          <p className={styles.heading}>
            <span className={styles.iconWrapper}>
              <svg viewBox="0 0 36.7 3" xmlns="http://www.w3.org/2000/svg" style={{ width: '50px' }}>
                <path d="M0 0h36.7v3H0z" fill="#a30bef"></path>
              </svg>
            </span>
            <span className={styles.title}>
              CONTACT
            </span>
          </p>

          <div className="wpforms-container">
            <form onSubmit={handleSubmit}>
              <div className="wpforms-field-container">
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>
                    Name <span style={{ color: '#d63638' }}>*</span>
                  </label>
                  <div className={styles.nameGroup}>
                    <div className={styles.nameField}>
                      <input name="first_name" type="text" className={styles.formInput} required />
                      <div className={styles.subLabel}>First</div>
                    </div>
                    <div className={styles.nameField}>
                      <input name="last_name" type="text" className={styles.formInput} required />
                      <div className={styles.subLabel}>Last</div>
                    </div>
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>
                    Email <span style={{ color: '#d63638' }}>*</span>
                  </label>
                  <input name="email" type="email" className={styles.formInput} required />
                </div>

                <div className={styles.fieldGroup} style={{ marginBottom: '25px' }}>
                  <label className={styles.label}>
                    Comment or Message <span style={{ color: '#d63638' }}>*</span>
                  </label>
                  <textarea name="message" className={styles.formInput} style={{ minHeight: '120px' }} required />
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <button
                  type="submit"
                  disabled={isSending}
                  className={`${styles.submitButton} ${isSending ? styles.submitting : ''}`}
                >
                  {isSending && <Loader2 className={styles.spinner} />}
                  {isSending ? "Sending..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}