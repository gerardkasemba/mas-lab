"use client"
import { useState } from "react";
import Image from "next/image";
import { Artist, MASFramework, Session, Media } from "@/lib/types";

interface ProfileProps {
  artist: Artist;
  framework: MASFramework;
  sessions: Session[];
  media: Media[];
}

export default function ProfileView({ artist, framework, sessions, media }: ProfileProps) {

  const [viewMode, setViewMode] = useState<'circle' | 'list'>('circle');
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Artist Profile Header - Left Aligned */}
        <div className="relative text-left">
          <Image
            src={artist.avatar_url || "/placeholder.jpg"}
            alt={artist.name}
            width={140}
            height={140}
            className="rounded-md shadow-lg border-4 border-white dark:border-gray-800"
          />
          <span
            className={`absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-sm font-medium ${
              artist.current_stage === "Ideation"
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                : artist.current_stage === "Branding"
                ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                : artist.current_stage === "Production"
                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            }`}
          >
            {artist.current_stage}
          </span>
        </div>
      <div className="flex flex-col md:flex-row gap-6 items-start">

        
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {artist.name}
          </h1>
          <h2 className="text-xl text-primary-light dark:text-primary-dark mt-1">
            {artist.project_name}
          </h2>
          <p className="mt-3 text-gray-700 dark:text-gray-300">
            {artist.project_description}
          </p>
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-lg">
            <p className="font-medium text-gray-900 dark:text-gray-100">
              Campaign Statement:
            </p>
            <p className="mt-1 text-gray-700 dark:text-gray-300">
              {artist.campaign_statement}
            </p>
          </div>
        </div>
      </div>

      {/* MAS Framework - Interactive Circular Design */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          MAS Framework
        </h2>
        
        {/* Toggle between views */}
        <div className="flex justify-center pb-16 mb-6">
          <div className="inline-flex rounded-md shadow-sm">
            <button
              onClick={() => setViewMode('circle')}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg ${viewMode === 'circle' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
            >
              Circular View
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
            >
              List View
            </button>
          </div>
        </div>

        {viewMode === 'circle' ? (
          <div className="relative h-64 w-full max-w-2xl mx-auto">
            {/* Central Circle */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-40 w-40 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 flex items-center justify-center shadow-xl">
                <span className="text-white font-bold text-center px-4">Creative Strategy</span>
              </div>
            </div>
            
            {/* Orbiting Circles */}
            {(["values", "goals", "brand"] as const).map((key, i) => {
              const angle = (i * 120 * Math.PI) / 180;
              const x = Math.cos(angle) * 120;
              const y = Math.sin(angle) * 120;
              
              return (
                <div 
                  key={key}
                  className="absolute h-28 w-28 rounded-full bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-gray-600 shadow-md flex flex-col items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg cursor-pointer"
                  style={{
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  onClick={() => setExpandedKey(expandedKey === key ? null : key)}
                >
                  <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
                    {key}
                  </div>
                  {expandedKey === key ? (
                    <div className="max-h-20 overflow-y-auto px-1">
                      {framework[key].map((item, idx) => (
                        <div key={idx} className="text-xs text-gray-700 dark:text-gray-300 py-0.5">
                          {item}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <ul className="text-center text-sm text-gray-700 dark:text-gray-300 space-y-1">
                      {framework[key].slice(0, 2).map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                      {framework[key].length > 2 && (
                        <li className="text-xs text-gray-500">+{framework[key].length - 2} more</li>
                      )}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(["values", "goals", "brand"] as const).map((key) => (
                <div key={key} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-3 capitalize">
                    {key}
                  </h3>
                  <ul className="space-y-2">
                    {framework[key].map((item, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="flex-shrink-0 h-5 w-5 text-blue-500 dark:text-blue-400 mr-2">•</span>
                        <span className="text-gray-700 dark:text-gray-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Session Summary */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Session Notes
        </h2>
        <div className="space-y-6">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="bg-white dark:bg-gray-800 rounded-xl  transition-shadow"
            >
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  {new Date(session.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {session.themes.map((theme) => (
                    <span
                      key={theme}
                      className="bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-full text-xs font-medium text-blue-700 dark:text-blue-300"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
              <p className="mt-3 text-gray-700 dark:text-gray-300">
                {session.summary}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Media Gallery */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Media Gallery
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {media.map((item) => (
            <div
              key={item.id}
              className="relative rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all group"
            >
              {item.type === "video" ? (
                <video
                  src={item.url}
                  controls
                  className="w-full h-48 object-cover"
                />
              ) : (
                <>
                  <Image
                    src={item.url}
                    alt={item.description || ""}
                    width={400}
                    height={300}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {item.description && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-sm">{item.description}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}