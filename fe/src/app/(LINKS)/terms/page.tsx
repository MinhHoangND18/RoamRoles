
import React from 'react';
import { headers } from "next/headers";
import { getBrandData } from "@/constants/brands";

// Tối ưu SEO động theo từng domain
export async function generateMetadata() {
  const headerList = await headers();
  const host = headerList.get("host");
  const brand = getBrandData(host);

  return {
    title: `Terms of Use - ${brand.name}`,
    description: `Read the legal terms and conditions for using ${brand.name}.`,
  };
}

export default async function TermsOfUsePage() {
  // Lấy host và dữ liệu brand từ headers
  const headerList = await headers();
  const host = headerList.get("host");
  const brand = getBrandData(host);

  const contactUrl = `${brand.url}/contact`;
  const privacyUrl = `${brand.url}/privacy`;

  return (
    <main id="main" className="container">
      <div id="post-159" className="content post-159 page type-page status-publish hentry">
        
        {/* Tiêu đề trang với SVG góc */}
        <p style={{ margin: '30px' }} className="gb-headline gb-headline-ebd47fe1">
          <span className="gb-icon">
            <svg viewBox="0 0 36.7 3" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 0h36.7v3H0z"></path>
            </svg>
          </span>
          <span className="gb-headline-text">Terms of Use</span>
        </p>

        <p>Updated on July 23, 2025.</p>

        <p>
          <strong>{brand.name}</strong> operates the online platform available at <a href={brand.url}>{brand.url}</a>, 
          where we publish informative, research-based content focused on employment opportunities, 
          job market trends, and professional development across South Africa. Our mission is to provide readers 
          with practical insights that support their ability to grow, adapt, and pursue meaningful work throughout 
          various stages of their career journey.
        </p>

        <p>
          All content featured on <strong>{brand.name}</strong> is produced by our editorial team through independent research 
          and a thoughtful review process. From curated job listings to articles on career guidance and skills development, 
          every piece is crafted to inform—not influence—your professional decisions. By using <strong>{brand.name}</strong>, 
          you acknowledge and agree to the terms, usage guidelines, and policies published throughout our website. 
          In this document, the terms WE, OUR,  and US refer exclusively to <strong>{brand.name}</strong>.
        </p>

        <p>
          While we highlight publicly available job opportunities and offer suggestions for building your career, 
          we do not sell any services, host paid training programs, or conduct recruitment activities. <strong>{brand.name}</strong> is 
          not affiliated with the employers, institutions, or organizations mentioned in our content. Our purpose is 
          purely informative: to offer impartial content that helps readers make decisions on their own terms, 
          without promoting third-party services or endorsing specific providers.
        </p>

        <p>
          <strong>{brand.name}</strong> was built to assist a wide range of users—from those seeking their very first job to 
          experienced professionals exploring new directions. Whether you`re refining your CV, researching jobs in 
          a different sector, or looking for guidance during a career transition, our content is created to be relevant, 
          accessible, and actionable for real-life situations.
        </p>

        <p>
          We value your privacy and take data protection seriously. Our <a href={privacyUrl}>Privacy Policy</a> outlines 
          how we collect, use, and store information in compliance with applicable data protection laws. We encourage 
          all visitors to review this policy to better understand the safeguards in place while browsing or interacting 
          with the <strong>{brand.name}</strong> platform.
        </p>

        <p>
          Our Terms of Use explain the conditions for accessing and using <strong>{brand.name}</strong>. These include rules 
          around acceptable use, disclaimers, limitations of liability, and other important notices that apply to every 
          user of our site.
        </p>

        <p>
          <strong>PLEASE READ OUR TERMS CAREFULLY BEFORE USING THE PLATFORM. IF YOU DO NOT AGREE WITH ANY PART OF THESE TERMS, 
          WE ADVISE THAT YOU REFRAIN FROM USING THE SERVICES PROVIDED THROUGH {brand.name.toUpperCase()}.</strong>
        </p>

        <h2 className="wp-block-heading">Article I – User Agreement</h2>
        
        <p>
          <strong>1.1 </strong>By accessing the <strong>{brand.name}</strong> platform at <a href={brand.url}>{brand.url}</a>, 
          you confirm that you have read, understood, and accepted the Terms of Use and Privacy Policy. These documents 
          establish the legal framework governing your access to and interaction with all content, features, and services 
          provided by <strong>{brand.name}</strong>.
        </p>

        <p>
          <strong>1.2 </strong>By using this website, you further affirm that you are legally eligible to enter into 
          binding agreements and are at least 18 years of age. Your continued use of the platform signifies your informed 
          and voluntary acceptance of all applicable terms, policies, and conditions.
        </p>

        <p>
          <strong>1.3 </strong>If you do not meet the required eligibility criteria or do not agree with any portion of 
          the Terms of Use or Privacy Policy, you must immediately cease using the <strong>{brand.name}</strong> website and 
          all associated services, tools, and content.
        </p>

        <h2 className="wp-block-heading">Article II – Communication and Support</h2>

        <p>
          <strong>2.1 </strong><strong>{brand.name}</strong> offers designated communication channels for users seeking assistance, 
          submitting feedback, or making inquiries regarding the platform and its informational content.
        </p>

        <p>
          <strong>2.2 </strong>For support requests, issue reporting, or general suggestions, users are encouraged to contact 
          us through our official contact form at <a href={contactUrl}>{contactUrl}</a>. Using this form ensures that your 
          message is routed appropriately and allows our team to respond efficiently and accurately.
        </p>

        <h2 className="wp-block-heading">Article III – User and Platform Responsibilities</h2>

        <p>
          <strong>3.1 </strong>All users accessing <strong>{brand.name}</strong> platform are required to review and accept the 
          Terms of Use and Privacy Policy prior to continued interaction with the website. Each user is individually responsible 
          for understanding and complying with the terms set forth in these documents while engaging with any part of the platform 
          and its associated features.
        </p>

        <p>
          <strong>3.2 </strong><strong>{brand.name}</strong> may include hyperlinks to external websites or digital services as 
          a convenience to users. These third-party links are provided strictly for informational purposes. <strong>{brand.name}</strong> does 
          not own, operate, sponsor, or formally endorse any third-party content, services, or platforms that may be referenced.
        </p>

        <p>
          <strong>3.3 </strong>Users who choose to access or engage with any external platforms linked from <strong>{brand.name}</strong> do 
          so at their own discretion and assume full responsibility for reviewing the applicable terms, privacy practices, and 
          security protocols of those external entities.
        </p>

        <p>
          <strong>3.4 </strong><strong>{brand.name}</strong> assumes no responsibility for the operations, accuracy, data handling practices, 
          or legal policies of any third-party site. We are not party to, nor do we oversee, any transactions, communications, or 
          agreements that may arise between users and third-party services. Such interactions are conducted entirely at the user`s own risk.
        </p>

        <p>
          <strong>3.5 </strong>Users are solely responsible for securing their devices, personal data, and browsing environment against 
          cyber threats, including but not limited to malware, phishing, spyware, and unauthorized access. <strong>{brand.name}</strong> disclaims 
          liability for any damages or losses arising from third-party threats or technical vulnerabilities outside of our direct control.
        </p>

        <p>
          <strong>3.6 </strong>While reasonable efforts are made to maintain the stability and reliability of the <strong>{brand.name}</strong> platform, 
          we cannot guarantee continuous, error-free operation. Users may occasionally experience service interruptions, technical issues, 
          or delays caused by factors beyond our control, including system outages or malicious cyberattacks. We are not liable for any 
          resulting inconvenience or data loss.
        </p>

        <p>
          <strong>3.7 </strong>Access to <strong>{brand.name}</strong> is provided free of charge. We do not request donations, offer subscription 
          tiers, or collect payments for use of our informational content. Any request for payment presented as coming from <strong>{brand.name}</strong> should 
          be considered fraudulent and reported immediately.
        </p>

        <p>
          <strong>3.8 </strong>To protect against phishing, impersonation attempts, or fraudulent communications, users are advised to remain 
          vigilant. Avoid clicking on suspicious links or downloading unknown attachments. If you receive a message claiming to be from <strong>{brand.name}</strong> that 
          raises concern, report it promptly through our official contact form at <a href={contactUrl}>{contactUrl}</a> so it can be reviewed 
          by our team.
        </p>

        <h2 className="wp-block-heading">Article IV – Prohibited Conduct</h2>

        <p>
          To ensure a safe, respectful, and professionally managed environment, <strong>{brand.name}</strong> strictly prohibits the following 
          actions and behaviors across all areas of its platform:
        </p>

        <p><strong>Engaging in Unlawful Activity</strong></p>
        <p>
          Users must not use <strong>{brand.name}</strong> to engage in, promote, or support any activity that violates applicable laws. 
          The platform may not be used to facilitate, encourage, or coordinate any form of illegal behavior.
        </p>

        <p><strong>Violation of Legal Standards</strong></p>
        <p>
          All users are expected to comply with local, national, and international laws and regulations. Any conduct that breaches 
          these standards while using the platform will be addressed with appropriate corrective or legal measures.
        </p>

        <p><strong>Infringement of Intellectual Property Rights</strong></p>
        <p>
          All original content on <strong>{brand.name}</strong> is protected by intellectual property laws. Users may not copy, reproduce, 
          modify, distribute, or republish any material—including articles, graphics, or proprietary information—without prior written permission.
        </p>

        <p><strong>Harassment, Discrimination, and Defamatory Behavior</strong></p>
        <p>
          Harassment, hate speech, and abusive behavior of any kind are strictly prohibited. This includes, but is not limited to, 
          targeting individuals or groups based on race, ethnicity, gender, religion, sexual orientation, disability, or any protected 
          status. Defamatory or threatening remarks will not be tolerated.
        </p>

        <p><strong>Spreading False or Misleading Information</strong></p>
        <p>
          Users must not share content they know to be false, deceptive, or misleading. All interactions—whether through comments, 
          messages, or submissions—must reflect honest and accurate communication.
        </p>

        <p><strong>Dissemination of Malicious Code</strong></p>
        <p>
          It is strictly forbidden to upload, link to, or distribute any form of malware, spyware, ransomware, viruses, or unauthorized 
          tracking tools. Such actions will result in immediate suspension and may lead to legal consequences.
        </p>

        <p><strong>Misuse of Personal Information</strong></p>
        <p>
          Users may not collect, share, or misuse personal data belonging to other individuals without clear and lawful consent. 
          The platform requires all users to respect privacy laws and data protection standards.
        </p>

        <p><strong>Fraudulent or Deceptive Conduct</strong></p>
        <p>
          Impersonation, identity theft, phishing attempts, or the creation of fraudulent profiles or communications are prohibited. 
          Any effort to deceive other users or the platform will be considered a serious violation.
        </p>

        <p><strong>Posting Inappropriate or Obscene Content</strong></p>
        <p>
          Content that includes explicit sexual material, graphic violence, or any other subject matter deemed offensive, harmful, 
          or unsuitable for a professional environment is not permitted.
        </p>

        <p><strong>Tampering with Platform Integrity or Security</strong></p>
        <p>
          Users may not attempt to hack, disrupt, reverse-engineer, or circumvent any technical, security, or operational functions 
          of <strong>{brand.name}</strong>. Unauthorized access to any part of the platform`s infrastructure is strictly forbidden.
        </p>

        <p>
          Violations of any of the above conduct guidelines may result in temporary suspension or permanent removal from the platform. 
          In cases involving threats to safety, significant harm, or unlawful activity, <strong>{brand.name}</strong> reserves the right to notify 
          law enforcement authorities and take legal action when appropriate.
        </p>

        <h2 className="wp-block-heading">Article V – Disclaimer of Warranties and Limitation of Liability</h2>

        <p>
          <strong>{brand.name}</strong> is committed to maintaining a well-curated and dependable platform. While reasonable efforts are made 
          to ensure that all materials are accurate, timely, and accessible, we cannot guarantee that the platform will be free from 
          technical issues, delays, inaccuracies, or interruptions at all times.
        </p>

        <p>
          All information, tools, and features provided by <strong>{brand.name}</strong> are offered AS IS and AS AVILIBLE, without any 
          express or implied warranties. This includes, but is not limited to, warranties of accuracy, reliability, completeness, 
          usefulness, merchantability, fitness for a particular purpose, or non-infringement. Users are solely responsible for how 
          they interpret, use, or act upon the content provided.
        </p>

        <p>
          We reserve the right to update, modify, suspend, restrict, or discontinue any section, service, or functionality of the 
          platform at our sole discretion, without prior notice. This may include the addition, removal, or revision of content or 
          features at any time.
        </p>

        <p>
          By accessing and using <strong>{brand.name}</strong>, you do so voluntarily and at your own risk. To the fullest extent permitted 
          by applicable law, the following disclaimers apply:
        </p>

        <ul>
          <li>We do not warrant that the platform will meet any specific expectations, intended use cases, or individual needs.</li>
          <li>We make no guarantees regarding the uninterrupted availability or flawless operation of the platform.</li>
          <li>We do not represent that the content will always reflect the latest legal, technical, or societal developments.</li>
          <li>We assume no responsibility for third-party services, platforms, or websites referenced or linked on our site.</li>
          <li>We disclaim any affiliation with or endorsement of third-party outcomes related to external resources mentioned on <strong>{brand.name}</strong>.</li>
        </ul>

        <p>
          Under no circumstances shall <strong>{brand.name}</strong>—its editors, contributors, licensors, service providers, or affiliates—be 
          held liable for any direct, indirect, incidental, consequential, punitive, or special damages arising from your access to 
          or use of the platform. This includes, but is not limited to:
        </p>

        <ul>
          <li>Loss of time, data, opportunity, or productivity;</li>
          <li>Technical disruptions or access errors beyond our control;</li>
          <li>Reputational, financial, or legal consequences from reliance on content;</li>
          <li>Costs incurred from adopting, rejecting, or modifying actions based on information presented.</li>
        </ul>

        <p>
          These limitations apply regardless of the legal theory asserted and whether or not <strong>{brand.name}</strong> was advised of the 
          possibility of such damages.
        </p>

        <p>
          By continuing to use this platform, you acknowledge and accept that <strong>{brand.name}</strong> assumes no liability for any decisions, 
          consequences, or interpretations arising from the use of its content or features.
        </p>

        <h2 className="wp-block-heading">Article VI – Duration and Legal Timeframe</h2>

        <p>
          All provisions set forth in <strong>{brand.name}</strong> Terms of Use shall remain legally binding and fully enforceable for the 
          entire duration of a user`s interaction with the platform. These terms apply continuously—regardless of frequency, method, 
          or type of access—and shall remain in effect unless formally modified, replaced, or withdrawn through an official notice 
          or published revision available at <a href={brand.url}>{brand.url}</a>.
        </p>

        <p>
          In the event of any dispute, concern, or legal claim arising from the use of <strong>{brand.name}</strong>—including matters relating 
          to the Privacy Policy—users must initiate any formal complaint or legal proceeding within ninety (90) calendar days from 
          the date the issue first occurred. Claims submitted after this timeframe may be deemed invalid and subject to dismissal 
          under applicable law due to untimeliness.
        </p>

        <p>
          This limitation period is intended to promote timely resolution and ensure that disputes are addressed while facts and 
          supporting evidence remain accessible, accurate, and verifiable. Prompt reporting supports a fair and efficient process 
          for all parties involved.
        </p>

        <h2 className="wp-block-heading">Article VII – Governing Law and Jurisdiction</h2>

        <p>
          The Terms of Use and Privacy Policy of <strong>{brand.name}</strong> shall be interpreted and enforced in accordance with the laws 
          of the <strong>Republic of South Africa</strong>. This includes, but is not limited to, the provisions outlined in the Electronic 
          Communications and Transactions Act 25 of 2002 (ECTA), the Consumer Protection Act 68 of 2008 (CPA), and the Protection 
          of Personal Information Act 4 of 2013 (POPIA).
        </p>

        <p>
          Any dispute, claim, or legal action arising from the use of <strong>{brand.name}</strong>, including but not limited to content access, 
          data processing practices, or user conduct, shall be subject to the exclusive jurisdiction of the courts of South Africa. 
          Legal proceedings must be initiated in a competent court located within the territory of South Africa, unless otherwise 
          mandated by statutory provisions.
        </p>

        <p>
          By accessing and using <strong>{brand.name}</strong>, you expressly agree that any legal matters will be resolved under the South African 
          legal framework applicable to informational websites, digital publishing, and online services. Users outside of South Africa 
          who access the platform acknowledge that they do so voluntarily and that any legal implications remain governed by South African law.
        </p>

        <h2 className="wp-block-heading">Article VIII – Intellectual Property and Content Ownership</h2>

        <p><strong>8.1 Content Ownership and Rights</strong></p>
        <p>
          All original materials published on <strong>{brand.name}</strong>—including but not limited to written content, data visualizations, 
          design elements, logos, icons, trademarks, multimedia, and platform functionalities—are protected under applicable intellectual 
          property laws. These materials are the exclusive property of <strong>{brand.name}</strong> or its licensed contributors. Any unauthorized 
          reproduction, modification, translation, distribution, public display, or other use of platform content without prior written 
          consent is strictly prohibited.
        </p>

        <p><strong>8.2 Limitation of Liability</strong></p>
        <p>
          <strong>{brand.name}</strong> is not responsible for the accuracy, intent, legality, or effect of any third-party or user-submitted 
          content that may appear on the platform. This includes external links, embedded media, public comments, or references to 
          third-party sources. Users engage with such content at their own discretion and assume full responsibility for any outcomes. <strong>{brand.name}</strong> disclaims 
          all liability for damages, misinformation, or losses—whether direct, indirect, incidental, or consequential—arising from 
          interaction with non-original or third-party materials.
        </p>

        <p><strong>8.3 Handling Content Violations</strong></p>
        <p>
          <strong>{brand.name}</strong> reserves the right, at its sole discretion, to monitor, review, remove, or restrict any content that 
          violates platform terms, legal requirements, or ethical standards. This includes, but is not limited to, content that is 
          unlawful, misleading, plagiarized, defamatory, harmful, or otherwise inappropriate. Enforcement actions may include removal 
          of content, temporary suspension, or permanent restriction of user access. In cases involving repeated or serious violations, 
          legal authorities may be notified where appropriate.
        </p>

        <h2 className="wp-block-heading">Article IX – Changes to Terms and Conditions</h2>

        <p>
          <strong>{brand.name}</strong> reserves the full right to revise, amend, update, or discontinue any portion of its Terms of Use, Privacy 
          Policy, or platform services at any time, without prior notice. Such modifications may result from legal requirements, 
          operational decisions, changes in service functionality, or broader structural updates to the platform.
        </p>

        <p>
          Users are solely responsible for reviewing the Terms of Use periodically to remain aware of any changes. Continued access 
          to or use of the platform after such modifications have been made constitutes explicit acceptance of the revised terms.
        </p>

        <p>
          <strong>{brand.name}</strong> shall not be held liable for any inconvenience, data loss, dissatisfaction, or service disruptions arising 
          from amendments, feature removal, or the partial or complete suspension of services.
        </p>

        <p>
          <strong>If you do not agree to the updated Terms or any platform modifications, you must immediately discontinue all use of <strong>{brand.name}</strong> and 
          its related services.</strong>
        </p>

        <h2 className="wp-block-heading">Article X – Contact Information</h2>

        <p>
          If you have questions regarding these Terms, require assistance with any aspect of the platform, or wish to share general 
          feedback about <strong>{brand.name}</strong>, you are encouraged to contact us through our official page: <a href={contactUrl}>{contactUrl}</a>.
        </p>

        <p>
          We welcome inquiries, support requests, technical issue reports, and constructive suggestions. While we strive to respond 
          to all messages in a timely and respectful manner, response times may vary depending on the volume and complexity of the inquiry.
        </p>

      </div>
    </main>
  );
}