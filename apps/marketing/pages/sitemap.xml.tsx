import type { GetServerSideProps } from "next";
import { postsEs } from "../lib/blog/posts";

function SitemapXml() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const slugs = postsEs.map((p) => p.slug);
  const now = new Date().toISOString().split("T")[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">

  <!-- Homepage -->
  <url>
    <loc>https://www.desktop.kitchen</loc>
    <xhtml:link rel="alternate" hreflang="en" href="https://www.desktop.kitchen" />
    <xhtml:link rel="alternate" hreflang="es" href="https://es.desktop.kitchen" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://www.desktop.kitchen" />
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://es.desktop.kitchen</loc>
    <xhtml:link rel="alternate" hreflang="en" href="https://www.desktop.kitchen" />
    <xhtml:link rel="alternate" hreflang="es" href="https://es.desktop.kitchen" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://www.desktop.kitchen" />
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Investors -->
  <url>
    <loc>https://www.desktop.kitchen/investors</loc>
    <xhtml:link rel="alternate" hreflang="en" href="https://www.desktop.kitchen/investors" />
    <xhtml:link rel="alternate" hreflang="es" href="https://es.desktop.kitchen/investors" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://www.desktop.kitchen/investors" />
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://es.desktop.kitchen/investors</loc>
    <xhtml:link rel="alternate" hreflang="en" href="https://www.desktop.kitchen/investors" />
    <xhtml:link rel="alternate" hreflang="es" href="https://es.desktop.kitchen/investors" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://www.desktop.kitchen/investors" />
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- Blog index -->
  <url>
    <loc>https://www.desktop.kitchen/blog</loc>
    <xhtml:link rel="alternate" hreflang="en" href="https://www.desktop.kitchen/blog" />
    <xhtml:link rel="alternate" hreflang="es" href="https://es.desktop.kitchen/blog" />
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://es.desktop.kitchen/blog</loc>
    <xhtml:link rel="alternate" hreflang="en" href="https://www.desktop.kitchen/blog" />
    <xhtml:link rel="alternate" hreflang="es" href="https://es.desktop.kitchen/blog" />
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- Blog posts -->
${slugs
  .map(
    (slug) => `  <url>
    <loc>https://www.desktop.kitchen/blog/${slug}</loc>
    <xhtml:link rel="alternate" hreflang="en" href="https://www.desktop.kitchen/blog/${slug}" />
    <xhtml:link rel="alternate" hreflang="es" href="https://es.desktop.kitchen/blog/${slug}" />
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://es.desktop.kitchen/blog/${slug}</loc>
    <xhtml:link rel="alternate" hreflang="en" href="https://www.desktop.kitchen/blog/${slug}" />
    <xhtml:link rel="alternate" hreflang="es" href="https://es.desktop.kitchen/blog/${slug}" />
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  res.setHeader("Content-Type", "application/xml");
  res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=43200");
  res.write(xml);
  res.end();

  return { props: {} };
};

export default SitemapXml;
