import React from 'react';
import BlogDetail from '../../../components/BlogDetail';
import Container from '../../../components/Container';

interface BlogDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { id } = await params;
  const blogId = parseInt(id);

  if (isNaN(blogId)) {
    return (
      <Container>
        <div className="text-center py-12">
          <p className="text-red-500">ID blog không hợp lệ</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <BlogDetail blogId={blogId} />
    </Container>
  );
}
