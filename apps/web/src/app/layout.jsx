import "./globals.css";

const siteUrl = "https://bugporter.in";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Bug Reporter - Developer-ready bug reports in one click",
    template: "%s | Bug Reporter",
  },
  description:
    "A lightweight browser SDK and dashboard for engineering teams. Captures masked screenshots, console errors, network failures, and click breadcrumbs without slowing down your app.",
  keywords: [
    "bug reporter",
    "bug tracking SDK",
    "issue reporting",
    "frontend error monitoring",
    "developer tools",
    "shadow dom widget",
    "github bug report",
    "session breadcrumbs",
    "DOM privacy masking",
    "lightweight bug reporter",
  ],
  authors: [{ name: "Bug Reporter", url: siteUrl }],
  creator: "Bug Reporter",
  publisher: "Bug Reporter",
  applicationName: "Bug Reporter",
  alternates: {
    canonical: siteUrl,
  },
  verification: {
    google: "google945d42a34d48671e.html",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Bug Reporter",
    title: "Bug Reporter — Developer-ready bug reports in one click",
    description:
      "A lightweight browser SDK that turns 'it\\'s broken' into an actionable GitHub issue with screenshots, console logs, and breadcrumbs.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Bug Reporter — Developer-ready bug reports in one click",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bug Reporter — Developer-ready bug reports in one click",
    description:
      "A lightweight browser SDK that turns 'it\\'s broken' into an actionable GitHub issue with screenshots, console logs, and breadcrumbs.",
    images: ["/og-image.png"],
    creator: "@bugreporter",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport = {
  themeColor: "#020617",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Bug Reporter",
      description:
        "A lightweight bug reporter for small teams that turns 'it's broken' into a ready-to-fix GitHub issue.",
      publisher: {
        "@id": `${siteUrl}/#organization`,
      },
    },
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Bug Reporter",
      url: siteUrl,
      logo: `${siteUrl}/icon.png`,
      sameAs: ["https://github.com/Santlaj/Bugporter"],
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${siteUrl}/#software`,
      name: "Bug Reporter",
      operatingSystem: "All modern browsers",
      applicationCategory: "DeveloperApplication",
      offers: {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
      },
      description:
        "Lightweight browser SDK and dashboard capturing screenshots, breadcrumbs, console errors, and network telemetry for developers.",
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased text-foreground">
        {children}
      </body>
    </html>
  );
}
