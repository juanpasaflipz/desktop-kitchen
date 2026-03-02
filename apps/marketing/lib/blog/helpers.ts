import { BlogPost } from "./types";

const monthsEn = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const monthsEs = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

export function formatDate(isoDate: string, locale: string): string {
  // Deterministic formatter — avoids hydration mismatch between
  // Node.js (build) and browser (client) locale implementations
  const [y, m, d] = isoDate.split("-");
  const monthIdx = parseInt(m, 10) - 1;
  const day = parseInt(d, 10);
  if (locale === "es") {
    return `${day} de ${monthsEs[monthIdx]} de ${y}`;
  }
  return `${monthsEn[monthIdx]} ${day}, ${y}`;
}

export function getPostBySlug(posts: BlogPost[], slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getRelatedPosts(posts: BlogPost[], currentSlug: string, relatedSlugs: string[]): BlogPost[] {
  return relatedSlugs
    .map((slug) => posts.find((p) => p.slug === slug))
    .filter((p): p is BlogPost => p !== undefined)
    .slice(0, 3);
}

export function getPostsByCategory(posts: BlogPost[], category: string): BlogPost[] {
  if (!category || category === "all") return posts;
  return posts.filter((p) => p.category === category);
}

export function getHeadings(post: BlogPost): { id: string; text: string; level: 2 | 3 }[] {
  return post.content
    .filter((b): b is { type: "heading"; level: 2 | 3; text: string; id: string } => b.type === "heading")
    .map((b) => ({ id: b.id, text: b.text, level: b.level }));
}
