// Next.js and React imports
import type { Metadata } from "next";

// Global styles
import "./globals.css";

// Third-party libraries
import { Toaster } from "react-hot-toast";

// Layout components
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Container from "../components/Container";

// Feature components
import ChatSystem from "@/components/chat/ChatSystem";

// Providers
import { ClientProviders } from "@/components/ClientProviders";

// Metadata configuration
export const metadata: Metadata = {
  title: "Foodee - Food Delivery Platform",
  description: "Order delicious food from your favorite restaurants with Foodee",
  keywords: ["food delivery", "restaurant", "order online", "foodee"],
  authors: [{ name: "Foodee Team" }],
  viewport: "width=device-width, initial-scale=1",
};

// Root Layout Component
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {/* Global providers wrapper */}
        <ClientProviders>
          {/* Toast notifications */}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
          
          {/* Main layout structure */}
          <div className="flex flex-col min-h-screen">
            {/* Site header */}
            <Header />
            
            {/* Main content area */}
            <main className="flex-1 bg-gray-50">
              <Container>
                {children}
              </Container>
            </main>
            
            {/* Site footer */}
            <Footer />
          </div>
          
          {/* Chat system overlay */}
          <ChatSystem />
        </ClientProviders>
      </body>
    </html>
  );
}
