export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bugporter.in";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
