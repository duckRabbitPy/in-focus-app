export interface Lens {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Roll {
  id: number;
  name: string;
  film_type: string | null;
  iso: number | null;
  created_at: string;
  updated_at: string;
}
