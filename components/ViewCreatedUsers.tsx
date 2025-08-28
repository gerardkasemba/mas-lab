"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { Artist, MASFramework, Session, Media } from "@/lib/types";
import { FiEdit, FiTrash2, FiUser, FiSearch, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import EditArtistModal from "./EditArtistModal";
import Image from "next/image";

export default function ViewCreatedUsers() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [editingArtist, setEditingArtist] = useState<{
    artist: Artist;
    framework?: MASFramework;
    sessions?: Session[];
    media?: Media[];
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const artistsPerPage = 8;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const supabase = createClient();
      
      try {
        const { data: artists, error } = await supabase.from("artists").select("*");
        if (error) throw error;
        if (artists) setArtists(artists as Artist[]);
      } catch (error) {
        console.error("Error fetching artists:", error);
        alert("Failed to load artists. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const fetchArtistDetails = async (artistId: string) => {
    const supabase = createClient();
    try {
      const { data: framework } = await supabase
        .from("mas_frameworks")
        .select("*")
        .eq("artist_id", artistId)
        .single();
      
      const { data: sessions } = await supabase
        .from("sessions")
        .select("*")
        .eq("artist_id", artistId);
      
      const { data: media } = await supabase
        .from("media")
        .select("*")
        .eq("artist_id", artistId);
      
      return { framework, sessions, media };
    } catch (error) {
      console.error("Error fetching artist details:", error);
      return { framework: null, sessions: [], media: [] };
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this artist and all associated data?")) return;

    const supabase = createClient();
    const previousArtists = artists;
    setIsDeleting(id);
    setArtists(artists.filter((artist) => artist.id !== id));

    try {
      // Fetch media URLs to delete from storage
      const { data: media, error: mediaError } = await supabase
        .from("media")
        .select("url")
        .eq("artist_id", id);

      if (mediaError) throw mediaError;

      // Delete associated files from storage
      if (media && media.length > 0) {
        const filePaths = media
          .map((item) => item.url.split('/').pop())
          .filter((path): path is string => !!path);
        if (filePaths.length > 0) {
          const { error: storageError } = await supabase.storage
            .from("lab-upload")
            .remove(filePaths);
          if (storageError) throw storageError;
        }
      }

      // Delete artist (cascades to mas_frameworks, sessions, media due to ON DELETE CASCADE)
      const { error } = await supabase.from("artists").delete().eq("id", id);

      if (error) {
        setArtists(previousArtists);
        if (error.code === "42501") {
          alert("You don't have permission to delete this artist.");
        } else if (error.code === "P0001") {
          alert("Artist not found.");
        } else {
          alert("Failed to delete artist. Please try again.");
        }
        throw error;
      }
    } catch (error) {
      console.error("Error deleting artist:", error);
      setArtists(previousArtists);
      alert("An unexpected error occurred while deleting the artist.");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleEdit = async (artist: Artist) => {
    setIsLoading(true);
    try {
      const details = await fetchArtistDetails(artist.id);
      setEditingArtist({
        artist,
        framework: details.framework as MASFramework,
        sessions: details.sessions as Session[],
        media: details.media as Media[]
      });
    } catch (error) {
      console.error("Error preparing edit:", error);
      alert("Failed to load artist details for editing.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (updatedData: {
    artist: Artist;
    framework: MASFramework;
    session: Session;
    media: File[];
  }) => {
    const supabase = createClient();
    try {
      // Update artist
      const { error: artistError } = await supabase
        .from("artists")
        .update(updatedData.artist)
        .eq("id", updatedData.artist.id);

      if (artistError) throw artistError;

      // Update framework
      const { error: frameworkError } = await supabase
        .from("mas_frameworks")
        .upsert({
          ...updatedData.framework,
          artist_id: updatedData.artist.id
        });

      if (frameworkError) throw frameworkError;

      // Update session (assuming single session for simplicity)
      if (updatedData.session) {
        const { error: sessionError } = await supabase
          .from("sessions")
          .upsert({
            ...updatedData.session,
            artist_id: updatedData.artist.id
          });

        if (sessionError) throw sessionError;
      }

      // Handle media uploads (not implemented in original, placeholder)
      if (updatedData.media.length > 0) {
        // Add your media upload logic here
        console.log("Media uploads to be implemented:", updatedData.media);
      }

      // Update local state
      setArtists(artists.map(a => 
        a.id === updatedData.artist.id ? updatedData.artist : a
      ));
      setEditingArtist(null);
    } catch (error) {
      console.error("Error updating artist:", error);
      alert("Failed to update artist. Please try again.");
    }
  };

  // Filter and pagination logic
  const filteredArtists = artists.filter(artist =>
    artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artist.project_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastArtist = currentPage * artistsPerPage;
  const indexOfFirstArtist = indexOfLastArtist - artistsPerPage;
  const currentArtists = filteredArtists.slice(indexOfFirstArtist, indexOfLastArtist);
  const totalPages = Math.ceil(filteredArtists.length / artistsPerPage);

  if (isLoading && !editingArtist) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Artist Management</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {artists.length} {artists.length === 1 ? 'artist' : 'artists'} total
          </p>
        </div>
        
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search artists..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {artists.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
          <div className="mx-auto h-24 w-24 text-gray-400">
            <FiUser className="w-full h-full" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            No artists found
          </h3>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Get started by creating a new artist profile.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Artist
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Project
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Stage
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {currentArtists.map((artist) => (
                  <tr key={artist.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {artist.avatar_url ? (
                          <Image
                            className="h-10 w-10 rounded-full object-cover"
                            width={40}
                            height={40}
                            src={artist.avatar_url}
                            alt={artist.name}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                            <FiUser className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {artist.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(artist.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {artist.project_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        artist.current_stage === "Ideation" 
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" 
                          : artist.current_stage === "Branding" 
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" 
                          : artist.current_stage === "Production" 
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" 
                          : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      }`}>
                        {artist.current_stage}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(artist.updated_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(artist)}
                          className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300 p-1 rounded-md hover:bg-primary-50 dark:hover:bg-primary-900/20"
                          title="Edit"
                          disabled={isDeleting === artist.id}
                        >
                          <FiEdit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(artist.id)}
                          className={`text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 ${isDeleting === artist.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title="Delete"
                          disabled={isDeleting === artist.id}
                        >
                          <FiTrash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing <span className="font-medium">{indexOfFirstArtist + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(indexOfLastArtist, filteredArtists.length)}
                </span>{' '}
                of <span className="font-medium">{filteredArtists.length}</span> results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <FiChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Next
                  <FiChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Edit Modal */}
      {editingArtist && (
        <EditArtistModal
          artist={editingArtist.artist}
          framework={editingArtist.framework || {} as MASFramework}
          sessions={editingArtist.sessions || []}
          media={editingArtist.media || []}
          onClose={() => setEditingArtist(null)}
          onSave={handleUpdate}
        />
      )}
    </div>
  );
}