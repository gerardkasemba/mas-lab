// components/EditArtistModal.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { Artist, MASFramework, Session, Media } from "@/lib/types";
import { FiX, FiImage, FiUpload, FiTrash2, FiVideo } from "react-icons/fi";

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
  }) => Promise<void>;
}

export default function EditArtistModal({ 
  artist, 
  framework, 
  sessions, 
  media, 
  onClose, 
  onSave 
}: EditArtistModalProps) {
  const [editedArtist, setEditedArtist] = useState<Artist>(artist);
  const [editedFramework, setEditedFramework] = useState<MASFramework>(framework);
  const [editedSession, setEditedSession] = useState<Session>(sessions[0] || {
    id: '',
    artist_id: artist.id,
    summary: '',
    date: new Date().toISOString(),
    themes: []
  });
  const [newMedia, setNewMedia] = useState<File[]>([]);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(artist.avatar_url);
  const [isSaving, setIsSaving] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setEditedArtist({ ...editedArtist, avatar_url: URL.createObjectURL(file) });
      setPreviewAvatar(URL.createObjectURL(file));
    }
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewMedia([...newMedia, ...Array.from(e.target.files)]);
    }
  };

  const removeMedia = (index: number, isNew: boolean) => {
    if (isNew) {
      setNewMedia(newMedia.filter((_, i) => i !== index));
    }
    // Note: For existing media, you'd need to handle deletion from storage
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        artist: editedArtist,
        framework: editedFramework,
        session: editedSession,
        media: newMedia
      });
      onClose();
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setIsSaving(false);
    }
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
                onChange={(e) => setEditedArtist({...editedArtist, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
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
                onChange={(e) => setEditedArtist({...editedArtist, project_name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Current Stage*
              </label>
              <select
                value={editedArtist.current_stage}
                onChange={(e) => setEditedArtist({
                  ...editedArtist, 
                  current_stage: e.target.value as Artist["current_stage"]
                })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
              >
                {["Ideation", "Branding", "Production", "Launch"].map((stage) => (
                  <option key={stage} value={stage}>{stage}</option>
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
                                width={140}
            height={140}
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
                onChange={(e) => setEditedArtist({...editedArtist, project_description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md min-h-[100px]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Campaign Statement*
              </label>
              <textarea
                value={editedArtist.campaign_statement}
                onChange={(e) => setEditedArtist({...editedArtist, campaign_statement: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md min-h-[100px]"
              />
            </div>
          </div>

          {/* MAS Framework */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900 dark:text-white">MAS Framework</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['values', 'goals', 'brand'] as const).map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 capitalize">
                    {field}*
                  </label>
                  <textarea
                    value={editedFramework[field].join(', ')}
                    onChange={(e) => setEditedFramework({
                      ...editedFramework,
                      [field]: e.target.value.split(',').map(item => item.trim())
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md min-h-[80px]"
                    placeholder={`Enter ${field}, separated by commas`}
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
                onChange={(e) => setEditedSession({...editedSession, summary: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md min-h-[100px]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Themes*
              </label>
              <input
                type="text"
                value={editedSession.themes.join(', ')}
                onChange={(e) => setEditedSession({
                  ...editedSession,
                  themes: e.target.value.split(',').map(item => item.trim())
                })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                placeholder="theme1, theme2, theme3"
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
            {media.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Existing Media</h5>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {media.map((item) => (
                    <div key={item.id} className="relative group rounded-lg border border-gray-200 dark:border-gray-700 p-2">
                      <div className="aspect-square bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        {item.type === 'video' ? (
                          <FiVideo className="h-10 w-10 text-gray-400" />
                        ) : (
                          <FiImage className="h-10 w-10 text-gray-400" />
                        )}
                      </div>
                      <p className="text-xs truncate mt-1">{item.description || 'No description'}</p>
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
                    Drag & drop files here or click to browse
                  </span>
                  <input
                    type="file"
                    multiple
                    onChange={handleMediaUpload}
                    className="hidden"
                  />
                </label>
              </div>
              
              {/* New Media Preview */}
              {newMedia.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {newMedia.map((file, index) => (
                    <div key={index} className="relative group rounded-lg border border-gray-200 dark:border-gray-700 p-2">
                      <div className="aspect-square bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        {file.type.includes('video') ? (
                          <FiVideo className="h-10 w-10 text-gray-400" />
                        ) : (
                          <FiImage className="h-10 w-10 text-gray-400" />
                        )}
                      </div>
                      <p className="text-xs truncate mt-1">{file.name}</p>
                      <button
                        type="button"
                        onClick={() => removeMedia(index, true)}
                        className="absolute top-1 right-1 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
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
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
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
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}