import { Suspense } from 'react';
import ResetPasswordForm from '@/components/ResetPasswordForm';
import Container from '@/components/Container';

export default function ResetPasswordPage() {
  return (
    <Container>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<div>Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </Container>
  );
}