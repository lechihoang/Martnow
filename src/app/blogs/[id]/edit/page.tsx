import React from 'react';
import BlogForm from '../../../../components/BlogForm';
import Container from '../../../../components/Container';

interface EditBlogPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditBlogPage({ params }: EditBlogPageProps) {
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
      <BlogForm blogId={blogId} />
    </Container>
  );
}
