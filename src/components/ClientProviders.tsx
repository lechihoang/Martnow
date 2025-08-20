"use client";

import { CartProvider } from '@/hooks/useCart';
import { ChatProvider } from '@/contexts/ChatContext';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ChatProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </ChatProvider>
  );
}
