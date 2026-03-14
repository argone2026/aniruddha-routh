import type { Metadata } from "next";
import ThemeToggle from "@/components/ThemeToggle";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aniruddha Routh | Web Base",
  description:
    "Checking out Aniruddha's space — achievements, hobbies, doodles, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Synchronously apply saved theme before first paint — prevents flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme-mode')||'dark';document.documentElement.classList.toggle('dark',t==='dark')}catch(e){document.documentElement.classList.add('dark')}})();`,
          }}
        />
      </head>
      <body className="antialiased">
        {children}
        <ThemeToggle />
      </body>
    </html>
  );
}

