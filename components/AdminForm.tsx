"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { AdminFormData, Artist } from "@/lib/types";

export default function AdminForm() {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();

    // Upload avatar to Supabase Storage (lab-upload bucket)
    let avatar_url = "";
    if (formData.avatar) {
      const avatarPath = `avatars/${crypto.randomUUID()}/${formData.avatar.name}`;
      const { data, error } = await supabase.storage
        .from("lab-upload")
        .upload(avatarPath, formData.avatar);
      if (error) {
        console.error("Avatar upload error:", error);
        return;
      }
      if (data) {
        // Get public URL for the avatar
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
      console.error("Artist insert error:", artistError);
      return;
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
        console.error("MAS Framework insert error:", frameworkError);
        return;
      }

      // Insert session
      const { error: sessionError } = await supabase.from("sessions").insert({
        artist_id: artist.id,
        summary: formData.session_summary,
        themes: formData.themes.split(",").map((t) => t.trim()),
        date: new Date().toISOString(),
      });
      if (sessionError) {
        console.error("Session insert error:", sessionError);
        return;
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
    }

    alert("Artist data saved successfully!");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block">Artist Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full border rounded p-2"
        />
      </div>
      <div>
        <label className="block">Avatar</label>
        <input
          type="file"
          onChange={(e) => setFormData({ ...formData, avatar: e.target.files?.[0] || null })}
          className="w-full"
        />
      </div>
      <div>
        <label className="block">Project Name</label>
        <input
          type="text"
          value={formData.project_name}
          onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
          className="w-full border rounded p-2"
        />
      </div>
      <div>
        <label className="block">Project Description</label>
        <textarea
          value={formData.project_description}
          onChange={(e) => setFormData({ ...formData, project_description: e.target.value })}
          className="w-full border rounded p-2"
        />
      </div>
      <div>
        <label className="block">Campaign Statement</label>
        <input
          type="text"
          value={formData.campaign_statement}
          onChange={(e) => setFormData({ ...formData, campaign_statement: e.target.value })}
          className="w-full border rounded p-2"
        />
      </div>
      <div>
        <label className="block">Current Stage</label>
        <select
          value={formData.current_stage}
          onChange={(e) => setFormData({ ...formData, current_stage: e.target.value as Artist["current_stage"] })}
          className="w-full border rounded p-2"
        >
          <option value="Ideation">Ideation</option>
          <option value="Branding">Branding</option>
          <option value="Production">Production</option>
          <option value="Launch">Launch</option>
        </select>
      </div>
      <div>
        <label className="block">MAS Framework: Values (comma-separated)</label>
        <input
          type="text"
          value={formData.values}
          onChange={(e) => setFormData({ ...formData, values: e.target.value })}
          className="w-full border rounded p-2"
        />
      </div>
      <div>
        <label className="block">MAS Framework: Goals (comma-separated)</label>
        <input
          type="text"
          value={formData.values}
          onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
          className="w-full border rounded p-2"
        />
      </div>
      <div>
        <label className="block">MAS Framework: Brand (comma-separated)</label>
        <input
          type="text"
          value={formData.brand}
          onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
          className="w-full border rounded p-2"
        />
      </div>
      <div>
        <label className="block">Session Summary</label>
        <textarea
          value={formData.session_summary}
          onChange={(e) => setFormData({ ...formData, session_summary: e.target.value })}
          className="w-full border rounded p-2"
        />
      </div>
      <div>
        <label className="block">Themes (comma-separated)</label>
        <input
          type="text"
          value={formData.themes}
          onChange={(e) => setFormData({ ...formData, themes: e.target.value })}
          className="w-full border rounded p-2"
        />
      </div>
      <div>
        <label className="block">Media Files</label>
        <input
          type="file"
          multiple
          onChange={(e) => setFormData({ ...formData, media: Array.from(e.target.files || []) })}
          className="w-full"
        />
      </div>
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
        Save Artist
      </button>
    </form>
  );
}