"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase";
import { Artist, MASFramework, Session, Media } from "@/lib/types";
import { FiX, FiImage, FiUpload, FiTrash2, FiVideo, FiFile, FiDownload } from "react-icons/fi";
import toast from 'react-hot-toast';

interface EditArtistModalProps {
  artist: Artist;
  framework: MASFramework;
  sessions: Session[];
  media: Media[];
  onClose: () => void;
  onSave: (updatedData: {
    artist: Artist;
    framework: MASFramework;
    session: Session;
    media: File[];
    avatarFile?: File;
  }) => Promise<void>;
}

export default function EditArtistModal({
  artist,
  framework,
  sessions,
  media,
  onClose,
  onSave,
}: EditArtistModalProps) {
  const [editedArtist, setEditedArtist] = useState<Artist>(artist);
  const [editedFramework, setEditedFramework] = useState<MASFramework>(framework);
  const [editedSession, setEditedSession] = useState<Session>(
    sessions[0] || {
      id: "",
      artist_id: artist.id,
      summary: "",
      date: new Date().toISOString(),
      themes: [],
    }
  );
  const [newMedia, setNewMedia] = useState<File[]>([]);
  const [avatarFile, setAvatarFile] = useState<File | undefined>(undefined);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(artist.avatar_url);
  const [isSaving, setIsSaving] = useState(false);
  const [mediaPreviews, setMediaPreviews] = useState<{ file: File; preview: string }[]>([]);
  const [mediaToDelete, setMediaToDelete] = useState<string[]>([]);
  const [existingMedia, setExistingMedia] = useState<Media[]>(media);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateVideoDuration = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith("video/")) return resolve(true);
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration <= 600);
      };
      video.onerror = () => resolve(false);
      video.src = URL.createObjectURL(file);
    });
  };

  useEffect(() => {
    const generatePreviews = async () => {
      const previews = await Promise.all(
        newMedia.map(async (file) => ({
          file,
          preview: file.type.startsWith("image/") || file.type.startsWith("video/")
            ? URL.createObjectURL(file)
            : file.type === "application/pdf"
            ? "/pdf-icon.png"
            : "/document-icon.png",
        }))
      );
      setMediaPreviews(previews);
    };
    generatePreviews();
    return () => mediaPreviews.forEach(({ preview }) => URL.revokeObjectURL(preview));
  }, [newMedia]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file for the avatar.");
        return;
      }
      setAvatarFile(file);
      setPreviewAvatar(URL.createObjectURL(file));
    } else {
      setAvatarFile(undefined);
      setPreviewAvatar(artist.avatar_url);
    }
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles: File[] = [];
      for (const file of files) {
        if (file.size > 50 * 1024 * 1024) {
          toast.error(`File "${file.name}" exceeds 50MB limit.`);
          continue;
        }
        if (file.type.startsWith("video/")) {
          const isValidDuration = await validateVideoDuration(file);
          if (!isValidDuration) {
            toast.error(`Video "${file.name}" exceeds 10 minutes.`);
            continue;
          }
        }
        if (
          file.type.startsWith("image/") ||
          file.type === "application/pdf" ||
          file.type.startsWith("video/") ||
          [
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain",
          ].includes(file.type)
        ) {
          validFiles.push(file);
        } else {
          toast.error(`File "${file.name}" is not a supported type.`);
        }
      }
      setNewMedia([...newMedia, ...validFiles]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeMedia = (index: number, isNew: boolean) => {
    if (isNew) {
      setNewMedia(newMedia.filter((_, i) => i !== index));
      setMediaPreviews(mediaPreviews.filter((_, i) => i !== index));
    } else {
      const mediaToRemove = existingMedia[index];
      setMediaToDelete([...mediaToDelete, mediaToRemove.id]);
      setExistingMedia(existingMedia.filter((_, i) => i !== index));
      toast.success("Media marked for deletion. Click Save to confirm.");
    }
  };

  const handleSave = async () => {
    if (
      !editedArtist.name ||
      !editedArtist.project_name ||
      !editedArtist.project_description ||
      !editedArtist.campaign_statement ||
      !editedArtist.current_stage ||
      editedFramework.values.length === 0 ||
      editedFramework.goals.length === 0 ||
      editedFramework.brand.length === 0 ||
      !editedSession.summary ||
      editedSession.themes.length === 0
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSaving(true);
    try {
      const supabase = createClient();
      let avatar_url = editedArtist.avatar_url;

      // Upload new avatar if selected
      if (avatarFile) {
        const avatarPath = `avatars/${artist.id}/${Date.now()}_${avatarFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from("lab-upload")
          .upload(avatarPath, avatarFile, { cacheControl: "3600", upsert: true });
        
        if (uploadError) {
          console.error("Avatar upload error:", uploadError);
          throw new Error(`Failed to upload avatar: ${uploadError.message}`);
        }
        
        const { data: publicUrlData } = supabase.storage
          .from("lab-upload")
          .getPublicUrl(avatarPath);
        avatar_url = publicUrlData.publicUrl;
      }

      // Delete media marked for removal from both storage and database
      if (mediaToDelete.length > 0) {
        // First get the file paths from the media records
        const { data: mediaToRemove, error: fetchError } = await supabase
          .from("media")
          .select("id, url")
          .in("id", mediaToDelete);
        
        if (fetchError) {
          console.error("Error fetching media to delete:", fetchError);
          throw new Error(`Failed to fetch media for deletion: ${fetchError.message}`);
        }
        
        // Extract file paths from URLs
        const filePaths = mediaToRemove.map(media => {
          const urlParts = media.url.split('/');
          // Get the path after the bucket name
          return urlParts.slice(urlParts.indexOf('lab-upload') + 1).join('/');
        });
        
        // Delete from storage
        if (filePaths.length > 0) {
          const { error: storageError } = await supabase.storage
            .from("lab-upload")
            .remove(filePaths);
          
          if (storageError) {
            console.error("Storage deletion error:", storageError);
            throw new Error(`Failed to delete storage files: ${storageError.message}`);
          }
        }
        
        // Delete from database
        const { error: deleteError } = await supabase
          .from("media")
          .delete()
          .in("id", mediaToDelete);
        
        if (deleteError) {
          console.error("Media deletion error:", deleteError);
          throw new Error(`Failed to delete media records: ${deleteError.message}`);
        }
        
        toast.success(`Deleted ${mediaToDelete.length} media files.`);
      }

      // Upload new media files to the correct folder structure
      for (const file of newMedia) {
        // Create the folder path: media/{artist-id}/{filename}
        const filePath = `media/${artist.id}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
        
        const { error: uploadError } = await supabase.storage
          .from("lab-upload")
          .upload(filePath, file, { cacheControl: "3600", upsert: false });
        
        if (uploadError) {
          console.error("Media upload error:", uploadError);
          throw new Error(`Failed to upload media file ${file.name}: ${uploadError.message}`);
        }
        
        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from("lab-upload")
          .getPublicUrl(filePath);
        
        // Determine media type
        let mediaType: 'photo' | 'video' = 'photo';
        if (file.type.startsWith('video/')) {
          mediaType = 'video';
        }
        
        // Save media record to database
        const { error: dbError } = await supabase
          .from("media")
          .insert({
            artist_id: artist.id,
            type: mediaType,
            url: publicUrlData.publicUrl,
            created_at: new Date().toISOString()
          });
        
        if (dbError) {
          console.error("Database media insert error:", dbError);
          throw new Error(`Failed to save media record for ${file.name}: ${dbError.message}`);
        }
      }

      // Call the parent onSave function
      await onSave({
        artist: { ...editedArtist, avatar_url },
        framework: editedFramework,
        session: editedSession,
        media: newMedia,
        avatarFile,
      });
      
      toast.success("Artist profile updated successfully!");
      onClose();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Failed to save:", error);
      toast.error(`Failed to save changes: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  const getMediaIcon = (mediaItem: Media) => {
    if (mediaItem.type === "video") return <FiVideo className="h-10 w-10 text-red-500" />;
    return <FiImage className="h-10 w-10 text-blue-500" />;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 p-4 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Edit Artist Profile
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            disabled={isSaving}
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Artist Name*
              </label>
              <input
                type="text"
                required
                value={editedArtist.name}
                onChange={(e) => setEditedArtist({ ...editedArtist, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Project Name*
              </label>
              <input
                type="text"
                required
                value={editedArtist.project_name}
                onChange={(e) => setEditedArtist({ ...editedArtist, project_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Current Stage*
              </label>
              <select
                value={editedArtist.current_stage}
                onChange={(e) =>
                  setEditedArtist({
                    ...editedArtist,
                    current_stage: e.target.value as Artist["current_stage"],
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
                disabled={isSaving}
              >
                {["Ideation", "Branding", "Production", "Launch"].map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col items-center">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Avatar
              </label>
              <div className="relative w-20 h-20 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 mb-2 overflow-hidden">
                {previewAvatar ? (
                  <Image
                    src={previewAvatar}
                    alt="Avatar preview"
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <FiImage className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
              <label className="flex items-center justify-center px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-md text-sm cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600">
                <FiUpload className="h-4 w-4 mr-1" />
                Change
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  disabled={isSaving}
                />
              </label>
            </div>
          </div>

          {/* Text Areas */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Project Description*
              </label>
              <textarea
                value={editedArtist.project_description}
                onChange={(e) =>
                  setEditedArtist({ ...editedArtist, project_description: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md min-h-[100px] focus:ring-2 focus:ring-blue-500"
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Campaign Statement*
              </label>
              <textarea
                value={editedArtist.campaign_statement}
                onChange={(e) =>
                  setEditedArtist({ ...editedArtist, campaign_statement: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md min-h-[100px] focus:ring-2 focus:ring-blue-500"
                disabled={isSaving}
              />
            </div>
          </div>

          {/* MAS Framework */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900 dark:text-white">MAS Framework</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(["values", "goals", "brand"] as const).map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 capitalize">
                    {field}*
                  </label>
                  <textarea
                    value={editedFramework[field].join(", ")}
                    onChange={(e) =>
                      setEditedFramework({
                        ...editedFramework,
                        [field]: e.target.value.split(",").map((item) => item.trim()).filter(Boolean),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md min-h-[80px] focus:ring-2 focus:ring-blue-500"
                    placeholder={`Enter ${field}, separated by commas`}
                    disabled={isSaving}
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    {editedFramework[field].map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Session Info */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900 dark:text-white">Session Information</h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Session Summary*
              </label>
              <textarea
                value={editedSession.summary}
                onChange={(e) => setEditedSession({ ...editedSession, summary: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md min-h-[100px] focus:ring-2 focus:ring-blue-500"
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Themes*
              </label>
              <input
                type="text"
                value={editedSession.themes.join(", ")}
                onChange={(e) =>
                  setEditedSession({
                    ...editedSession,
                    themes: e.target.value.split(",").map((item) => item.trim()).filter(Boolean),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="theme1, theme2, theme3"
                disabled={isSaving}
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {editedSession.themes.map((theme, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Media */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900 dark:text-white">Media</h4>

            {/* Existing Media */}
            {existingMedia.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Existing Media</h5>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {existingMedia.map((item, index) => (
                    <div
                      key={item.id}
                      className="relative group rounded-lg border border-gray-200 dark:border-gray-700 p-2"
                    >
                      <div className="aspect-square bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                        {item.type === "video" ? (
                          <div className="flex flex-col items-center justify-center">
                            <FiVideo className="h-10 w-10 text-red-500 mb-2" />
                            <span className="text-xs text-gray-500">Video File</span>
                          </div>
                        ) : (
                          <>
                            <Image
                              src={item.url}
                              alt={item.url.split('/').pop() || 'Media file'}
                              width={100}
                              height={100}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Fallback to icon if image fails to load
                                e.currentTarget.style.display = 'none';
                                const fallback = e.currentTarget.parentElement?.querySelector('.fallback-icon');
                                if (fallback) {
                                  fallback.classList.remove('hidden');
                                }
                              }}
                            />
                            <div className="hidden fallback-icon absolute inset-0 flex flex-col items-center justify-center">
                              <FiImage className="h-10 w-10 text-blue-500 mb-2" />
                              <span className="text-xs text-gray-500">Image</span>
                            </div>
                          </>
                        )}
                      </div>
                      <p className="text-xs truncate mt-1">{item.url.split('/').pop()}</p>
                      <div className="flex justify-between items-center mt-2">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FiDownload className="h-4 w-4" />
                        </a>
                        <button
                          type="button"
                          onClick={() => removeMedia(index, false)}
                          className="text-red-500 hover:text-red-700"
                          disabled={isSaving}
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Media Upload */}
            <div>
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Add New Media</h5>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                <label className="flex flex-col items-center justify-center cursor-pointer">
                  <FiUpload className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Drag & drop files (images, videos) or click to browse
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleMediaUpload}
                    className="hidden"
                    ref={fileInputRef}
                    disabled={isSaving}
                  />
                </label>
              </div>

              {/* New Media Preview */}
              {mediaPreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {mediaPreviews.map(({ file, preview }, index) => (
                    <div
                      key={index}
                      className="relative group rounded-lg border border-gray-200 dark:border-gray-700 p-2"
                    >
                      <div className="aspect-square bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        {file.type.startsWith("image/") ? (
                          <Image
                            src={preview}
                            alt={file.name}
                            width={100}
                            height={100}
                            className="w-full h-full object-cover"
                          />
                        ) : file.type.startsWith("video/") ? (
                          <div className="flex flex-col items-center justify-center">
                            <FiVideo className="h-10 w-10 text-red-500 mb-2" />
                            <span className="text-xs text-gray-500">Video File</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center">
                            <FiFile className="h-10 w-10 text-gray-500 mb-2" />
                            <span className="text-xs text-gray-500">Document</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs truncate mt-1">{file.name}</p>
                      <button
                        type="button"
                        onClick={() => removeMedia(index, true)}
                        className="absolute top-1 right-1 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        disabled={isSaving}
                      >
                        <FiTrash2 className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-4 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}