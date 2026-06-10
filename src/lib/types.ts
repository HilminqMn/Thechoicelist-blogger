export interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary: string | null;
  image_url: string | null;
  category_id: string | null;
  status: 'draft' | 'published';
  affiliate_url: string | null;
  created_at: string;
  updated_at: string;
  categories?: Category | null;
}

export interface PostFormData {
  title: string;
  slug: string;
  content: string;
  summary: string;
  image_url: string;
  category_id: string;
  status: 'draft' | 'published';
  affiliate_url: string;
}
