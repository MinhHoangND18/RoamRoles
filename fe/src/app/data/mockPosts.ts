import { Post } from "@/src/types/post";
import { JobPost } from "@/src/types/jobPost";

export const posts: Post[] = [
  {
    id: 1,
    title: "Giới thiệu Next.js",
    slug: "gioi-thieu-nextjs",
    description: "Tổng quan về Next.js App Router",
    content: "Next.js là framework React mạnh mẽ...",
    author: "Minh Hoàng",
    createdAt: "2026-01-01",
    tags: ["nextjs", "react"],
  },
  {
    id: 2,
    title: "Xây dựng API Golang",
    slug: "xay-dung-api-golang",
    description: "Tạo REST API với Golang",
    content: "Golang rất phù hợp cho backend...",
    author: "Admin",
    createdAt: "2026-01-05",
    tags: ["golang", "backend"],
  },
];

export const jobPosts: JobPost[] = [
  {
    slug: "mcdonalds-job-earn-zar-4500",
    hero: {
      eyebrow: "Explore amazing career prospects in the vibrant fast-food industry and enjoy real benefits.",
      title: "McDonald's Job: Earn From ZAR 4,500 and Explore a World of Real Career Benefits!"
    },
    primary_card: {
      description: "Imagine a workplace where every day brings new challenges and growth, where teamwork fuels success, and your contributions are truly valued. McDonald's offers not just jobs, but pathways to lasting careers. Whether you're starting out or seeking new leadership roles, discover how you can thrive in a global brand that invests in its people and communities.",
      button: {
        text: "See How to Apply",
        note: "You will remain in the same website"
      }
    },
    secondary_card: {
      description: "Beyond the competitive pay, McDonald's prioritizes your well-being with comprehensive benefits and a culture of continuous learning. Experience genuine care.",
      highlights: [
        { icon: "🚀", text: "Career Growth" },
        { icon: "💪", text: "Team Support" },
        { icon: "💡", text: "Skill Development" },
        { icon: "🥳", text: "Fun Environment" }
      ]
    },
    sections: [
      {
        heading: "Why Choose a Career at McDonald's?",
        image: {
          caption: "Build real experience and skills by delivering smiles, one order at a time!",
          source: "Canva"
        },
        paragraphs: [
          "Join the McDonald's family and start building a career with purpose. Growth is possible in every role, with daily learning included.",
          "We're looking for individuals excited to take on new challenges. Each day is an opportunity to contribute, grow skills, and gain experience.",
          "Discover a work environment built on support, where teamwork matters. Employees thrive through mentorship, training, and clear expectations at every stage.",
          "Explore exciting job opportunities today with McDonald's South Africa. Start your journey toward stability, development, and meaningful contributions to a global brand."
        ]
      }
    ],
    story: {
      title: "Sarah's Journey to Success",
      paragraphs: [
        "Sarah felt stuck in her old job, lacking growth. Every day felt the same, without new challenges. She longed for a dynamic environment.",
        "She knew she had more to offer. Her skills were underutilized, and passion dwindled. She wanted a place that truly valued her effort.",
        "Then, Sarah saw an ad for a McDonald's job online. It highlighted career growth and a supportive team. She felt a spark of hope.",
        "She updated her CV and applied immediately. Sarah researched McDonald's values intently. She practiced her interview answers diligently.",
        "During her interview, she showcased her enthusiasm. She shared her desire for growth and teamwork. Sarah felt confident and prepared.",
        "Sarah landed the job and quickly excelled. She found purpose and a supportive team. Her career thrived at McDonald's.",
        "Ready to write your own success story? Apply for a McDonald's job today and start your incredible journey with us!"
      ]
    },
    faq: [
      {
        question: "What makes a candidate stand out during the interview?",
        answer: "Show confidence, understand McDonald's values, and highlight team experience. Authenticity and communication skills often leave a positive impression on hiring managers."
      },
      {
        question: "How can I prepare for a McDonald's job interview?",
        answer: "Research the company, practice common questions, and prepare examples from your experience."
      },
      {
        question: "Are there specific skills McDonald's looks for in new hires?",
        answer: "Customer service, teamwork, reliability, and a positive attitude are highly valued."
      },
      {
        question: "Is there room for growth after starting in an entry-level role?",
        answer: "Yes, McDonald's offers clear career progression pathways and internal promotions."
      }
    ],
    open_roles: {
      company: "McDonald's",
      description: "Discover real job benefits at McDonald's South Africa – visit the official site!"
    },
    recommended: {
      title: "Coca-Cola Jobs: First Step Toward a Career",
      description: "Explore Coca-Cola careers in South Africa – see what roles are open today!"
    },
    meta: {
      author: "nataliantividade",
      publishedAt: "July 17, 2025"
    }
  }
];

// Helper function to get job post by slug
export function getJobPostBySlug(slug: string): JobPost | undefined {
  return jobPosts.find(post => post.slug === slug);
}
