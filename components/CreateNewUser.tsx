"use client";

import { useState, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { AdminFormData, Artist } from "@/lib/types";
import Image from "next/image";
import { FiUpload, FiTrash2, FiFile, FiVideo, FiImage, FiCheckCircle, FiXCircle } from "react-icons/fi";

export default function CreateNewUser() {
  const [formData, setFormData] = useState<AdminFormData>({
    name: "",
    project_name: "",
    project_description: "",
    campaign_statement: "",
    current_stage: "Ideation",
    avatar: null,
    values: "",
    goals: "",
    brand: "",
    session_summary: "",
    themes: "",
    media: [],
  });
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleAvatarChange = (file: File | null) => {
    if (file) {
      setFormData({ ...formData, avatar: file });
      setPreviewAvatar(URL.createObjectURL(file));
    } else {
      setFormData({ ...formData, avatar: null });
      setPreviewAvatar(null);
    }
  };

  const handleMediaDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    setFormData((prev) => ({
      ...prev,
      media: [...prev.media, ...files],
    }));
  }, []);

  const removeMedia = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionStatus({ type: null, message: "" }); // Reset status

    const supabase = createClient();

    try {
      // Upload avatar to Supabase Storage (lab-upload bucket)
      let avatar_url = "";
      if (formData.avatar) {
        const avatarPath = `avatars/${crypto.randomUUID()}/${formData.avatar.name}`;
        const { data, error } = await supabase.storage
          .from("lab-upload")
          .upload(avatarPath, formData.avatar);
        if (error) {
          throw new Error(`Avatar upload error: ${error.message}`);
        }
        if (data) {
          const { data: publicUrlData } = supabase.storage
            .from("lab-upload")
            .getPublicUrl(avatarPath);
          avatar_url = publicUrlData.publicUrl;
        }
      }

      // Insert artist
      const { data: artist, error: artistError } = await supabase
        .from("artists")
        .insert({
          name: formData.name,
          project_name: formData.project_name,
          project_description: formData.project_description,
          campaign_statement: formData.campaign_statement,
          current_stage: formData.current_stage,
          avatar_url,
        })
        .select()
        .single();

      if (artistError) {
        throw new Error(`Artist insert error: ${artistError.message}`);
      }

      // Insert MAS Framework
      if (artist) {
        const { error: frameworkError } = await supabase.from("mas_frameworks").insert({
          artist_id: artist.id,
          values: formData.values.split(",").map((v) => v.trim()),
          goals: formData.goals.split(",").map((v) => v.trim()),
          brand: formData.brand.split(",").map((v) => v.trim()),
        });
        if (frameworkError) {
          throw new Error(`MAS Framework insert error: ${frameworkError.message}`);
        }

        // Insert session
        const { error: sessionError } = await supabase.from("sessions").insert({
          artist_id: artist.id,
          summary: formData.session_summary,
          themes: formData.themes.split(",").map((t) => t.trim()),
          date: new Date().toISOString(),
        });
        if (sessionError) {
          throw new Error(`Session insert error: ${sessionError.message}`);
        }

        // Upload media to lab-upload bucket
        for (const file of formData.media) {
          const mediaPath = `media/${artist.id}/${file.name}`;
          const { data, error } = await supabase.storage
            .from("lab-upload")
            .upload(mediaPath, file);
          if (error) {
            console.error("Media upload error:", error);
            continue;
          }
          if (data) {
            const { data: publicUrlData } = supabase.storage
              .from("lab-upload")
              .getPublicUrl(mediaPath);
            const mediaUrl = publicUrlData.publicUrl;
            const { error: mediaError } = await supabase.from("media").insert({
              artist_id: artist.id,
              type: file.type.includes("video") ? "video" : "photo",
              url: mediaUrl,
            });
            if (mediaError) {
              console.error("Media insert error:", mediaError);
            }
          }
        }

        // Set success message, reset form, and scroll to top
        setSubmissionStatus({
          type: "success",
          message: "Artist profile created successfully!",
        });
        setFormData({
          name: "",
          project_name: "",
          project_description: "",
          campaign_statement: "",
          current_stage: "Ideation",
          avatar: null,
          values: "",
          goals: "",
          brand: "",
          session_summary: "",
          themes: "",
          media: [],
        });
        setPreviewAvatar(null);
        window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to top
      }
    } catch (error) {
      // Set error message
      setSubmissionStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to create artist profile",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-hide submission status after 3 seconds
  useEffect(() => {
    if (submissionStatus.type) {
      const timer = setTimeout(() => {
        setSubmissionStatus({ type: null, message: "" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [submissionStatus]);

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl p-10 mx-auto bg-white dark:bg-gray-800 dark:border-gray-700 space-y-8">
      {/* Submission Status Message */}
      {submissionStatus.type && (
        <div
          className={`flex items-center p-4 rounded-lg transition-opacity duration-500 ${
            submissionStatus.type === "success"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
          }`}
        >
          {submissionStatus.type === "success" ? (
            <FiCheckCircle className="h-5 w-5 mr-2" />
          ) : (
            <FiXCircle className="h-5 w-5 mr-2" />
          )}
          <span>{submissionStatus.message}</span>
        </div>
      )}

      {/* Rest of the form remains unchanged */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">New Artist Profile</h2>
        <p className="text-gray-500 dark:text-gray-400">Fill in the details below to create a new artist profile</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Artist Name*</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              placeholder="Enter artist name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Name*</label>
            <input
              type="text"
              required
              value={formData.project_name}
              onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              placeholder="Enter project name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Stage*</label>
            <select
              value={formData.current_stage}
              onChange={(e) => setFormData({ ...formData, current_stage: e.target.value as Artist["current_stage"] })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition bg-white dark:bg-gray-800"
            >
              <option value="Ideation">Ideation</option>
              <option value="Branding">Branding</option>
              <option value="Production">Production</option>
              <option value="Launch">Launch</option>
            </select>
          </div>
        </div>

        {/* Avatar Upload */}
        <div className="flex flex-col items-center">
          <div className="relative w-32 h-32 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 mb-4 overflow-hidden">
            {previewAvatar ? (
              <Image
                src={previewAvatar}
                alt="Avatar preview"
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <FiImage className="h-10 w-10 text-gray-400" />
              </div>
            )}
          </div>
          <label className="flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition">
            <FiUpload className="h-5 w-5 mr-2 text-gray-700 dark:text-gray-300" />
            <span className="text-sm font-medium">Upload Avatar</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleAvatarChange(e.target.files?.[0] || null)}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Text Areas */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Description*</label>
          <textarea
            value={formData.project_description}
            onChange={(e) => setFormData({ ...formData, project_description: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition min-h-[150px]"
            placeholder="Enter project description"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Campaign Statement*</label>
          <textarea
            value={formData.campaign_statement}
            onChange={(e) => setFormData({ ...formData, campaign_statement: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition min-h-[120px]"
            placeholder="Enter campaign statement"
          />
        </div>
      </div>

      {/* MAS Framework */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">MAS Framework</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {["values", "goals", "brand"].map((field) => {
            const currentValues = (formData[field as keyof typeof formData] as string)
              .split(",")
              .map((v) => v.trim())
              .filter((v) => v.length > 0);

            return (
              <div key={field}>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                    {field}*
                  </label>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {currentValues.length} {currentValues.length === 1 ? "item" : "items"}
                  </span>
                </div>

                <div className="relative">
                  <textarea
                    value={formData[field as keyof typeof formData] as string}
                    onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition min-h-[100px]"
                    placeholder={`Enter ${field}, separated by commas`}
                  />
                  <div className="absolute bottom-2 right-2 text-xs text-gray-500 dark:text-gray-400">
                    comma-separated
                  </div>
                </div>

                {currentValues.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {currentValues.map((value, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        {value}
                        <button
                          type="button"
                          onClick={() => {
                            const newValues = currentValues.filter((_, i) => i !== index);
                            setFormData({ ...formData, [field]: newValues.join(", ") });
                          }}
                          className="ml-1.5 inline-flex items-center justify-center w-3.5 h-3.5 rounded-full text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Session Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Session Information</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Session Summary*
          </label>
          <textarea
            value={formData.session_summary}
            onChange={(e) => setFormData({ ...formData, session_summary: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition min-h-[120px]"
            placeholder="Enter session summary notes"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Themes*
            </label>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formData.themes.split(",").filter((t) => t.trim().length > 0).length}{" "}
              {formData.themes.split(",").filter((t) => t.trim().length > 0).length === 1 ? "theme" : "themes"}
            </span>
          </div>

          <div className="relative">
            <input
              type="text"
              value={formData.themes}
              onChange={(e) => setFormData({ ...formData, themes: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              placeholder="theme1, theme2, theme3"
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-500 dark:text-gray-400">
              comma-separated
            </div>
          </div>

          {formData.themes.split(",").filter((t) => t.trim().length > 0).length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.themes
                .split(",")
                .map((t) => t.trim())
                .filter((t) => t.length > 0)
                .map((theme, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                  >
                    {theme}
                    <button
                      type="button"
                      onClick={() => {
                        const newThemes = formData.themes
                          .split(",")
                          .map((t) => t.trim())
                          .filter((_, i) => i !== index)
                          .join(", ");
                        setFormData({ ...formData, themes: newThemes });
                      }}
                      className="ml-1.5 inline-flex items-center justify-center w-3.5 h-3.5 rounded-full text-purple-800 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Media Upload */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Media Files</h3>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
            isDragging ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" : "border-gray-300 dark:border-gray-600"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleMediaDrop}
        >
          <div className="flex flex-col items-center justify-center space-y-3">
            <FiUpload className="h-12 w-12 text-gray-400" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              <span className="font-medium text-primary-600 dark:text-primary-400">Drag & drop files here</span> or click to browse
            </p>
            <input
              type="file"
              multiple
              onChange={(e) => setFormData({ ...formData, media: [...formData.media, ...Array.from(e.target.files || [])] })}
              className="hidden"
              id="media-upload"
            />
            <label
              htmlFor="media-upload"
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-md text-sm font-medium cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              Select Files
            </label>
          </div>
        </div>

        {/* Media Preview */}
        {formData.media.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
            {formData.media.map((file, index) => (
              <div key={index} className="relative group rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="aspect-square bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  {file.type.includes("image") ? (
                    <FiUpload className="h-10 w-10 text-gray-400" />
                  ) : file.type.includes("video") ? (
                    <FiVideo className="h-10 w-10 text-gray-400" />
                  ) : (
                    <FiFile className="h-10 w-10 text-gray-400" />
                  )}
                </div>
                <div className="p-2">
                  <p className="text-xs truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{Math.round(file.size / 1024)} KB</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeMedia(index)}
                  className="absolute top-2 right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <FiTrash2 className="h-4 w-4 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Creating..." : "Create Artist Profile"}
        </button>
      </div>
    </form>
  );
}
