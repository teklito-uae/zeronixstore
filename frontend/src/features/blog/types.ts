export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  author_name: string;
  status: "draft" | "published";
  published_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
}
