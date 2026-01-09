export interface JobPost {
  slug: string;
  hero: {
    eyebrow: string;
    title: string;
  };
  primary_card: {
    description: string;
    button: {
      text: string;
      note: string;
    };
  };
  secondary_card: {
    description: string;
    highlights: Array<{
      icon: string;
      text: string;
    }>;
  };
  sections: Array<{
    heading: string;
    image: {
      caption: string;
      source: string;
    };
    paragraphs: string[];
  }>;
  story: {
    title: string;
    paragraphs: string[];
  };
  faq: Array<{
    question: string;
    answer: string;
  }>;
  open_roles: {
    company: string;
    description: string;
  };
  recommended: {
    title: string;
    description: string;
  };
  meta?: {
    author: string;
    publishedAt: string;
  };
}

