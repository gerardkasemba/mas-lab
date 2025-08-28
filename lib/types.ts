// Artist data stored in the 'artists' table
export interface Artist {
  id: string; // UUID
  name: string;
  avatar_url: string; // URL to Supabase Storage
  project_name: string;
  project_description: string;
  campaign_statement: string;
  current_stage: "Ideation" | "Branding" | "Production" | "Launch"; // Enum-like stages
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

// MAS Framework data stored in the 'mas_frameworks' table
export interface MASFramework {
  id: string; // UUID
  artist_id: string; // Foreign key to artists.id
  values: string[]; // Array of values (stored as jsonb in Supabase)
  goals: string[]; // Array of goals (stored as jsonb)
  brand: string[]; // Array of brand attributes (stored as jsonb)
}

// Session data stored in the 'sessions' table
export interface Session {
  id: string; // UUID
  artist_id: string; // Foreign key to artists.id
  summary: string;
  date: string; // ISO timestamp
  themes: string[]; // Array of tags for correlation
}

// Media data stored in the 'media' table
export interface Media {
  id: string; // UUID
  artist_id: string; // Foreign key to artists.id
  type: "video" | "photo" | "moodboard"; // Media type
  url: string; // URL to Supabase Storage
  description?: string; // Optional description
  created_at: string;
  file_name: string;
}

// Form data for admin form submissions
export interface AdminFormData {
  name: string;
  project_name: string;
  project_description: string;
  campaign_statement: string;
  current_stage: Artist["current_stage"];
  avatar: File | null;
  values: string; // Comma-separated for form input
  goals: string; // Comma-separated
  brand: string; // Comma-separated
  session_summary: string;
  themes: string; // Comma-separated
  media: File[]; // Array of files for upload
}