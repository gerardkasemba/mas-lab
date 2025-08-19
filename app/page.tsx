"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import ArtistCard from "@/components/ArtistCard";
import ProfileView from "@/components/ProfileView";
import ThemeToggle from "@/components/ThemeToggle";
import { AnimatePresence, motion } from "framer-motion";
import { Artist, MASFramework, Session, Media } from "@/lib/types";
import Header from "@/components/UI/Header";
import SectionHeader from "@/components/UI/SectionHeader";
import ContentHeader from "@/components/UI/SectionHeader";

export default function WallView() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [artistData, setArtistData] = useState<{
    framework: MASFramework | null;
    sessions: Session[];
    media: Media[];
  }>({ framework: null, sessions: [], media: [] });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all artists on component mount
  useEffect(() => {
    const fetchArtists = async () => {
      setIsLoading(true);
      const supabase = createClient();
      const { data: artists } = await supabase.from("artists").select("*");
      if (artists) setArtists(artists as Artist[]);
      setIsLoading(false);
    };
    fetchArtists();
  }, []);

  // Fetch profile data when an artist is selected
  const handleArtistClick = async (artist: Artist) => {
    setSelectedArtist(artist);
    setIsLoading(true);
    const supabase = createClient();
    
    const [{ data: framework }, { data: sessions }, { data: media }] = await Promise.all([
      supabase
        .from("mas_frameworks")
        .select("*")
        .eq("artist_id", artist.id)
        .single(),
      supabase
        .from("sessions")
        .select("*")
        .eq("artist_id", artist.id),
      supabase
        .from("media")
        .select("*")
        .eq("artist_id", artist.id)
    ]);

    setArtistData({
      framework: framework as MASFramework | null,
      sessions: sessions as Session[] || [],
      media: media as Media[] || [],
    });
    setIsLoading(false);
  };

  const closeDrawer = () => setSelectedArtist(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">

      <Header />
      <ContentHeader
        subtitle="MINDART 2025"
        title="Live Performances"
        description="Discover our lineup of talented artists"
      />
      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {isLoading && artists.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading artists...</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8"
          >
            {artists.map((artist) => (
              <motion.div
                key={artist.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <ArtistCard
                  artist={artist}
                  onClick={() => handleArtistClick(artist)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      {/* Artist Detail Drawer */}
      <AnimatePresence>
        {selectedArtist && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDrawer}
              className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 h-full w-full max-w-3xl bg-white dark:bg-gray-800 shadow-xl z-50 overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedArtist.name}
                  </h2>
                  <button
                    onClick={closeDrawer}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Close profile"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {isLoading ? (
                  <div className="flex justify-center items-center py-20">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  artistData.framework && (
                    <ProfileView
                      artist={selectedArtist}
                      framework={artistData.framework}
                      sessions={artistData.sessions}
                      media={artistData.media}
                    />
                  )
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
