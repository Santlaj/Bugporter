import "./globals.css";

const siteUrl = "https://bugporter.in";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Bug Porter — Developer-ready bug reports in one click",
    template: "%s | Bug Porter",
  },
  description:
    "Bug Porter is a lightweight browser SDK and developer dashboard for engineering teams. Turns user bug reports into ready-to-fix GitHub issues with screenshots, logs, and breadcrumbs.",
  keywords: [
    "Bug Porter",
    "Bugporter",
    "bugporter.in",
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
  authors: [{ name: "Bug Porter", url: siteUrl }],
  creator: "Bug Porter",
  publisher: "Bug Porter",
  applicationName: "Bug Porter",
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
    siteName: "Bug Porter",
    title: "Bug Porter — Developer-ready bug reports in one click",
    description:
      "A lightweight browser SDK that turns 'it\\'s broken' into an actionable GitHub issue with screenshots, console logs, and breadcrumbs.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Bug Porter — Developer-ready bug reports in one click",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bug Porter — Developer-ready bug reports in one click",
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
      name: "Bug Porter",
      alternateName: ["Bugporter", "Bugporter.in"],
      description:
        "A lightweight bug reporter for small teams that turns 'it's broken' into a ready-to-fix GitHub issue.",
      publisher: {
        "@id": `${siteUrl}/#organization`,
      },
    },
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Bug Porter",
      alternateName: "Bugporter",
      url: siteUrl,
      logo: `${siteUrl}/icon.png`,
      sameAs: ["https://github.com/Santlaj/Bugporter"],
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${siteUrl}/#software`,
      name: "Bug Porter SDK",
      alternateName: "Bugporter SDK",
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
