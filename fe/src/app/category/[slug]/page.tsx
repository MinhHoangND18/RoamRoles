import CategoryPage from '@/app/category/CategoryPage';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function Page({ params, searchParams }: PageProps) {
  return <CategoryPage params={params} searchParams={searchParams} />;
}

export async function generateStaticParams() {
  return [
    { slug: 'career-stories' },
    { slug: 'guides' },
    { slug: 'job-listings' },
    { slug: 'planning' },
    { slug: 'remote-work' },
    { slug: 'tips' },
  ];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  return {
    title: `${slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Archives`,
    description: `Browse all posts in ${slug}`,
  };
}