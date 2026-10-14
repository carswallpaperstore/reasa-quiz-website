import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
 const base = process.env.NEXT_PUBLIC_SITE_URL || "https://reasa.in";
 return { rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/referral"] }], sitemap: `${base.replace(/\/$/, "")}/sitemap.xml` };

}
