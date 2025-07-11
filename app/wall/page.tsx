import { createClient } from '@supabase/supabase-js';
import { Artist } from "@/lib/types";
import ArtistCard from "@/components/ArtistCard";

export default async function WallView() {
  // Initialize Supabase client with your project URL and public key
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: artists } = await supabase.from("artists").select("*");

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">LAB Artist Wall</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {artists?.map((artist: Artist) => (
          <ArtistCard key={artist.id} artist={artist} />
        ))}
      </div>
    </div>
  );
}