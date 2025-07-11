import { Artist, MASFramework, Session, Media } from "@/lib/types";
import { createClient } from "@/lib/supabase";
import ProfileView from "@/components/ProfileView";

export default async function ProfilePage({ params }: { params: { artistId: string } }) {
  const supabase = createClient();
  const { data: artist } = await supabase.from("artists").select("*").eq("id", params.artistId).single();
  const { data: framework } = await supabase.from("mas_frameworks").select("*").eq("artist_id", params.artistId).single();
  const { data: sessions } = await supabase.from("sessions").select("*").eq("artist_id", params.artistId);
  const { data: media } = await supabase.from("media").select("*").eq("artist_id", params.artistId);

  if (!artist) return <div>Artist not found</div>;

  return (
    <ProfileView
      artist={artist as Artist}
      framework={framework as MASFramework}
      sessions={sessions as Session[]}
      media={media as Media[]}
    />
  );
}