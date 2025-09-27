import { Suspense } from 'react';
import ChangePasswordForm from '@/components/ChangePasswordForm';
import Container from '@/components/Container';

export default function ChangePasswordPage() {
  return (
    <Container>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<div>Loading...</div>}>
          <ChangePasswordForm />
        </Suspense>
      </div>
    </Container>
  );
}