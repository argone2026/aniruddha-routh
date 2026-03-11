import type { Metadata } from "next";
import ThemeToggle from "@/components/ThemeToggle";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aniruddha Routh | Personal Portfolio",
  description:
    "Personal portfolio of Aniruddha Routh — achievements, hobbies, gallery and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="antialiased">
        {children}
        <ThemeToggle />
      </body>
    </html>
  );
}

