// app/privacy/page.tsx
import React from 'react';
import { headers } from "next/headers";
import { getBrandData } from "@/constants/brands";

// Tối ưu SEO động theo từng domain
export async function generateMetadata() {
    const headerList = await headers();
    const host = headerList.get("host");
    const brand = getBrandData(host);

    return {
        title: `Privacy Policy - ${brand.name}`,
        description: `Learn how ${brand.name} collects, uses, and protects your personal information.`,
    };
}

export default async function PrivacyPolicyPage() {
    // Lấy host và dữ liệu brand từ headers
    const headerList = await headers();
    const host = headerList.get("host");
    const brand = getBrandData(host);

    const contactUrl = `${brand.url}/contact`;

    return (
        <main id="main" className="container">
            <div id="post-335" className="content post-335 page type-page status-publish hentry">

                {/* Tiêu đề trang với SVG góc */}
                <p style={{ margin: '30px' }} className="gb-headline gb-headline-ebd47fe1">
                    <span className="gb-icon">
                        <svg viewBox="0 0 36.7 3" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0 0h36.7v3H0z"></path>
                        </svg>
                    </span>
                    <span className="gb-headline-text">Privacy Policy</span>
                </p>

                <p>Updated on December 31, 2025</p>

                <h2 className="wp-block-heading">Introduction and Overview</h2>

                <p>
                    <strong>{brand.name}</strong> is operated by by ActiveView OÜ, a private limited company registered in the Republic of Estonia (Registry Code: 16639782), located at Kotkapoja tn 2a-10, Tallinn 10615, Harju, Estonia. For the purposes of data protection laws, ActiveView OÜ is the “Data Controller” of your personal information.
                </p>

                <p>
                    We are an independent platform offering accessible, research-based content focused entirely on employment opportunities,
                    job searching strategies, career guidance, and professional development. Through our website{' '}
                    <a href={brand.url}>{brand.url}</a>, you`ll find practical resources, application guidance, interview tips,
                    and curated insights designed to help individuals navigate the job market more effectively.
                </p>

                <p>
                    Our goal is to make career information clear, actionable, and genuinely useful. Whether you are preparing your
                    first application, exploring new career paths, or refining your professional profile, <strong>{brand.name}</strong> provides
                    straightforward explanations to help you understand available roles, assess suitability, and improve your chances
                    throughout the hiring process.
                </p>

                <p>
                    We are not affiliated with employers, recruitment agencies, or staffing firms. Everything published on our site
                    is created to inform and empower — not to promote. Our content is based on public information, independent research,
                    and editorial review aimed at supporting informed career decisions.
                </p>

                <h2 className="wp-block-heading">Your Privacy Matters</h2>

                <p>
                    We value your trust and understand that your personal data is important. This Privacy Policy explains how we collect,
                    store, use, and protect your information when you visit or interact with <strong>{brand.name}</strong>.
                </p>

                <p>
                    Our approach to privacy is built on transparency and respect for your rights. We comply with applicable data protection
                    laws and aim to provide full clarity about what data we collect, how we handle it, and how you can stay in control of
                    your information at all times.
                </p>

                <p>
                    We encourage you to read this policy carefully. If you have any questions or concerns about how your information is
                    managed, you`re welcome to contact us directly through{' '}
                    <a href={contactUrl}>{contactUrl}</a>.
                </p>

                <h2 className="wp-block-heading">Scope of the Privacy Policy</h2>

                <p>
                    This policy applies to your use of{' '}<a href={brand.url}>{brand.url}</a>{' '}and all content hosted on our platform,
                    including access to articles, guides, tutorials, and insights related to employment, job searching, applications,
                    interviews, and career development.
                </p>

                <p>
                    Whether you`re researching available roles, learning how to apply effectively, or exploring guidance tailored to
                    different professional profiles, this Privacy Policy explains how your data is collected and handled during your
                    visit to our website.
                </p>

                <p>
                    Please note that this policy applies only to <strong>{brand.name}</strong>. If you follow any links to third-party platforms,
                    employer websites, or external job boards referenced in our content, those services have their own privacy practices.
                    We strongly recommend reviewing their privacy policies before submitting any personal information outside of our platform.
                </p>

                <h2 className="wp-block-heading">Consent</h2>

                <p>
                    By using <strong>{brand.name}</strong> and engaging with any of its features, you confirm that you have read, understood,
                    and agreed to the practices described in this Privacy Policy.
                </p>

                <p>
                    Accessing our articles, browsing job-related content, or using any tools available on the website implies your acceptance
                    of these terms. If you disagree with how we collect or manage information, we recommend that you discontinue using the platform.
                </p>

                <p>
                    Continued use of the site will be treated as your consent to our data handling policies. For more information about your
                    rights and responsibilities as a user, please review our Terms of Use.
                </p>

                <h2 className="wp-block-heading">AI-Generated Content</h2>

                <p>
                    To enhance clarity, consistency, and usability across our content, <strong>{brand.name}</strong> may use AI-based tools in
                    limited and supportive ways during the editorial process. These tools assist with structuring outlines, improving readability,
                    and ensuring consistency — particularly for technical topics such as job market terminology, application processes, or
                    interview preparation.
                </p>

                <p>
                    AI tools do not replace human input. All content published on our site is written, reviewed, and approved by a human editor
                    to ensure accuracy, relevance, and practical value for users seeking career guidance.
                </p>

                <p>
                    We use AI only to enhance editorial efficiency — never to generate full articles or determine what topics to publish.
                    All insights, examples, and editorial decisions reflect human judgment, verified sources, and a commitment to delivering
                    helpful, reader-focused career content.
                </p>

                <h2 className="wp-block-heading">I. Data Collection Practices</h2>

                <p>
                    At <strong>{brand.name}</strong>, we take a responsible and transparent approach to handling data. We collect certain
                    information to improve platform performance, protect user access, and enhance content relevance. This data comes from
                    three main sources: information you share with us, data automatically gathered from your device, and limited input from
                    trusted third-party services.
                </p>

                <h3 className="wp-block-heading">A. Information You Provide</h3>

                <p>
                    You can access most areas of <strong>{brand.name}</strong> without sharing personal details. However, certain features —
                    such as subscriptions, contact forms, or interactive tools — may require you to submit basic information.
                </p>

                <p>
                    This may include your name, email address, or general location. Such information is used solely to respond to inquiries,
                    deliver requested updates, or improve the platform experience.
                </p>

                <h3 className="wp-block-heading">B. Automatically Collected Information</h3>

                <p>
                    When you browse <strong>{brand.name}</strong>, we automatically collect technical data such as your IP address, browser type,
                    device information, time and date of access, and navigation behavior. This data helps us understand how users interact with
                    our content and supports site optimization and security.
                </p>

                <p>
                    Cookies and analytics tools are used to improve usability, monitor performance, and understand general engagement trends.
                </p>

                <h3 className="wp-block-heading">C. Information from Third Parties</h3>

                <p>
                    We may use third-party analytics and advertising services to better understand site usage and display broadly relevant content.
                    These providers may collect anonymized data through cookies or similar technologies, governed by their own privacy policies.
                </p>

                <p>
                    We do not share personal identifying information directly with advertisers.
                </p>

                <h2 className="wp-block-heading">III. Purpose and Use of Collected Information</h2>

                <p>
                    <strong>{brand.name}</strong> collects user data to ensure a secure, functional, and informative experience. Information may
                    be used to maintain technical performance, understand engagement patterns, improve features and navigation, respond to inquiries,
                    deliver optional email updates when subscribed, and enhance security and prevent misuse.
                </p>

                <p>
                    Data is processed responsibly and reviewed regularly to ensure alignment with privacy standards.
                </p>

                <h2 className="wp-block-heading">Cookie Policy for {brand.name}</h2>

                <p>
                    This Cookie Policy explains how cookies are used on{' '}<a href={brand.url}>{brand.url}</a>, the types of data they collect,
                    and how they contribute to your browsing experience.
                </p>

                <p>
                    Cookies help us recognize returning visitors, improve navigation, analyze usage patterns, and maintain platform security.
                    Users can manage or disable cookies through browser settings at any time, though some features may be affected.
                </p>

                <p>
                    We use essential, preference, analytics, security, and advertising cookies, including limited third-party cookies for
                    analytics and performance measurement.
                </p>

                <h2 className="wp-block-heading">IV. Commitment to Data Protection</h2>

                <p>
                    <strong>{brand.name}</strong> does not sell, rent, or trade personal data. In some cases, anonymized or aggregated data may
                    be shared with trusted partners to improve platform functionality and understand usage trends.
                </p>

                <p>
                    We apply appropriate technical and organizational safeguards, including encrypted connections, restricted internal access,
                    and regular security reviews. While no system is completely risk-free, we act promptly to address any potential data incidents
                    in accordance with legal obligations.
                </p>

                <h2 className="wp-block-heading">V. Implementing Your Privacy Privileges</h2>

                <p>
                    You have the right to access, correct, restrict, or request deletion of your personal data. We retain data only as long as
                    necessary to fulfill its intended purpose or comply with legal obligations.
                </p>

                <p>
                    Requests related to your data can be submitted through{' '}<a href={contactUrl}>{contactUrl}</a>, and we will respond
                    within a reasonable timeframe.
                </p>

                <h2 className="wp-block-heading">VI. GDPR Compliance &amp; Global Privacy Rights</h2>

                <p>
                    As our operating company is based in <strong>Estonia</strong>, all personal data is processed in accordance with the{' '}
                    <strong>General Data Protection Regulation (GDPR)</strong>.
                </p>

                <p>
                    We process data based on consent, legitimate interest (such as platform security, analytics, and improvement), and legal
                    obligations under EU law.
                </p>

                <p>
                    Your data may be processed and stored in Estonia (European Union). By using our services, you acknowledge that your data
                    may be transferred internationally with safeguards consistent with EU standards.
                </p>

                <p>
                    We extend GDPR-level protections globally, including rights of access, correction, deletion, portability, and withdrawal
                    of consent, regardless of your location.
                </p>

                <h2 className="wp-block-heading">VIII. Future Adjustments to Our Privacy Policy</h2>

                <p>
                    This Privacy Policy may be updated to reflect changes in technology, legal requirements, or platform features. Updates will
                    be published on this page, and continued use of the site indicates acceptance of the revised terms.
                </p>

                <h2 className="wp-block-heading">IX. Our Contact Information</h2>

                <p>
                    If you have questions about this Privacy Policy or your data rights, please contact us through{' '}
                    <a href={contactUrl}>{contactUrl}</a>.
                </p>

                <p>
                    ActiveView OÜ
                    Kotkapoja tn 2a-10, Tallinn 10615, Harju, Estonia
                    Registry Code: 16639782 | VAT: EE102590366
                </p>

            </div>
        </main>
    );
}