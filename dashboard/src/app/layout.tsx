import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { DashboardProvider } from "@/providers/DashboardStateProvider";
import { AuthProvider } from "@/providers/AuthProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lead Management And Automation Dashboard",
  description:
    "A powerful dashboard for managing and automating your lead generation and sales processes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${poppins.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full font-poppins text-slate-900"
        suppressHydrationWarning
      >
        <AuthProvider>
          <DashboardProvider>{children}</DashboardProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
