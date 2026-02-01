export type GalleryImage = {
  id: string;
  url: string;
  path: string;
  category: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};
