"use client";

import { CartProvider } from '@/hooks/useCart';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
    </CartProvider>
  );
}
