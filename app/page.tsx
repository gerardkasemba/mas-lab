"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import ArtistCard from "@/components/ArtistCard";
import ProfileView from "@/components/ProfileView";
import ThemeToggle from "@/components/ThemeToggle";
import { AnimatePresence, motion } from "framer-motion";
import { Artist, MASFramework, Session, Media } from "@/lib/types";

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
      {/* Header */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-lg bg-white/70 dark:bg-gray-900/70 border-b border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 ease-in-out shadow-sm hover:backdrop-blur-xl hover:bg-white/80 dark:hover:bg-gray-900/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo/Title with subtle animation */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-md">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
              </div>
              <motion.h1 
                className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent tracking-tight"
              >
                MINDART ARTISTS LAB.
              </motion.h1>
            </motion.div>

            {/* Navigation and Theme Toggle */}
            <div className="flex items-center space-x-6">
              <nav className="hidden md:flex items-center space-x-8">
                <a href="#" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-amber-400 transition-colors">
                  Dashboard
                </a>
                <a href="#" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-amber-400 transition-colors">
                  Artists
                </a>
                <a href="#" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-amber-400 transition-colors">
                  Analytics
                </a>
                <a href="#" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-amber-400 transition-colors">
                  Settings
                </a>
              </nav>

              <div className="flex items-center space-x-4">
                <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
                <ThemeToggle />
                <div className="hidden md:block">
                  <button className="ml-4 px-4 py-2 text-sm font-medium rounded-md bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md hover:from-orange-600 hover:to-amber-700 transition-all transform hover:scale-105">
                    Add Artist
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

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
