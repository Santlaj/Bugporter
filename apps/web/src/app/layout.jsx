import "./globals.css";

export const metadata = {
  title: "Bug Reporter — Developer-ready bug reports in one click",
  description: "A lightweight bug reporter for small teams that turns 'it's broken' into a ready-to-fix GitHub issue.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background font-sans antialiased text-foreground">
        {children}
      </body>
    </html>
  );
}
