// Next.js and React imports
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

// Global styles
import "./globals.css";

// Font configuration
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Third-party libraries
import { Toaster } from "react-hot-toast";

// Layout components
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Container from "@/components/Container";

// Auth provider
import { AuthProvider } from "@/contexts/AuthContext";


// Metadata configuration
export const metadata: Metadata = {
  title: "MartNow - Tạp hóa Online Giao Hàng Nhanh",
  description: "Mua sắm tạp hóa online, giao hàng tận nhà trong 30 phút. Đa dạng sản phẩm, giá cạnh tranh, thanh toán an toàn.",
  keywords: ["tạp hóa online", "giao hàng nhanh", "martnow", "mua sắm online", "thực phẩm"],
  authors: [{ name: "MartNow Team" }],
};

// Viewport configuration
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

// Root Layout Component
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased text-gray-700`}>
        <AuthProvider>
          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1F2937',
                color: '#F9FAFB',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '14px',
                fontWeight: '500',
              },
              success: {
                style: {
                  background: '#10B981',
                  color: '#FFFFFF',
                },
              },
              error: {
                style: {
                  background: '#DC2626',
                  color: '#FFFFFF',
                },
              },
            }}
          />

          {/* Main layout structure */}
          <div className="flex flex-col min-h-screen">
            {/* Site header */}
            <Header />

            {/* Main content area */}
            <main className="flex-1">
              <Container>
                {children}
              </Container>
            </main>

            {/* Site footer */}
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
