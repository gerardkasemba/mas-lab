"use client"
import { useState } from "react";
import Image from "next/image";
import { Artist, MASFramework, Session, Media as MediaType } from "@/lib/types";

interface ProfileProps {
  artist: Artist;
  framework: MASFramework;
  sessions: Session[];
  media: MediaType[];
}

// Extended type for better file type handling
interface EnhancedMedia extends Omit<MediaType, 'type'> {
  enhancedType: 'image' | 'video' | 'document' | 'other';
  fileExtension: string;
}

export default function ProfileView({ artist, framework, sessions, media }: ProfileProps) {
  const [viewMode, setViewMode] = useState<'circle' | 'list'>('circle');
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<EnhancedMedia | null>(null);
  const [mediaViewMode, setMediaViewMode] = useState<'grid' | 'list'>('grid');

  // Enhance media with better type detection
  const enhancedMedia: EnhancedMedia[] = media.map(item => {
    const url = item.url.toLowerCase();
    let enhancedType: EnhancedMedia['enhancedType'] = 'other';
    let fileExtension = 'file';
    
    // Detect file type based on URL extension
    if (url.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/)) {
      enhancedType = 'image';
    } else if (url.match(/\.(mp4|mov|avi|wmv|webm|mkv|flv|m4v)$/)) {
      enhancedType = 'video';
    } else if (url.match(/\.(pdf|doc|docx|txt|rtf|odt|pages)$/)) {
      enhancedType = 'document';
    }
    
    // Get file extension
    const extensionMatch = url.match(/\.([a-z0-9]+)$/);
    if (extensionMatch) {
      fileExtension = extensionMatch[1].toUpperCase();
    }
    
    // Map the original type to our enhanced type if needed
    if (item.type === 'photo' || item.type === 'moodboard') {
      enhancedType = 'image';
    } else if (item.type === 'video') {
      enhancedType = 'video';
    }
    
    return {
      ...item,
      enhancedType,
      fileExtension
    };
  });

  // Group media by enhanced type
  const mediaByType = {
    image: enhancedMedia.filter(item => item.enhancedType === 'image'),
    video: enhancedMedia.filter(item => item.enhancedType === 'video'),
    document: enhancedMedia.filter(item => item.enhancedType === 'document'),
    other: enhancedMedia.filter(item => item.enhancedType === 'other')
  };

  // Get icon for file type
  const getFileIcon = (enhancedType: EnhancedMedia['enhancedType']) => {
    switch (enhancedType) {
      case 'image': return '🖼️';
      case 'video': return '🎬';
      case 'document': return '📄';
      default: return '📁';
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto p-4">
      {/* Artist Profile Header - Left Aligned */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
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
              className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm transition-shadow"
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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Media Gallery
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setMediaViewMode('grid')}
              className={`p-2 rounded ${mediaViewMode === 'grid' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
            >
              Grid View
            </button>
            <button
              onClick={() => setMediaViewMode('list')}
              className={`p-2 rounded ${mediaViewMode === 'list' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
            >
              List View
            </button>
          </div>
        </div>

        {/* Media type tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 text-sm">
            All ({enhancedMedia.length})
          </button>
          <button className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 text-sm">
            Images ({mediaByType.image.length})
          </button>
          <button className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 text-sm">
            Videos ({mediaByType.video.length})
          </button>
          <button className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 text-sm">
            Documents ({mediaByType.document.length})
          </button>
          <button className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 text-sm">
            Other ({mediaByType.other.length})
          </button>
        </div>

        {mediaViewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {enhancedMedia.map((item) => (
              <div
                key={item.id}
                className="relative rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                onClick={() => setSelectedMedia(item)}
              >
                {item.enhancedType === "video" ? (
                  <div className="relative">
                    <video className="w-full h-48 object-cover">
                      <source src={item.url} />
                    </video>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black bg-opacity-50 rounded-full p-3">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ) : item.enhancedType === "image" ? (
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
                ) : (
                  <div className="h-48 flex flex-col items-center justify-center p-4">
                    <div className="text-4xl mb-2">{getFileIcon(item.enhancedType)}</div>
                    <div className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-md font-mono mb-2">
                      {item.fileExtension}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 text-center truncate w-full">
                      {item.description || "Document"}
                    </p>
                  </div>
                )}
                
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {item.description || "Untitled"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(item.created_at || '').toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {enhancedMedia.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-lg">
                        {getFileIcon(item.enhancedType)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {item.description || "Untitled"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate">
                        {item.description || "No description"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {new Date(item.created_at || '').toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedMedia(item)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-3"
                      >
                        View
                      </button>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
                      >
                        Download
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {enhancedMedia.length === 0 && (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No media files</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by uploading some media.</p>
          </div>
        )}
      </div>

      {/* Media Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-screen overflow-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {selectedMedia.description || "Media Preview"}
              </h3>
              <button
                onClick={() => setSelectedMedia(null)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4">
              {selectedMedia.enhancedType === "video" ? (
                <video controls className="w-full h-auto max-h-[70vh]">
                  <source src={selectedMedia.url} />
                  Your browser does not support the video tag.
                </video>
              ) : selectedMedia.enhancedType === "image" ? (
                <div className="flex justify-center">
                  <Image
                    src={selectedMedia.url}
                    alt={selectedMedia.description || ""}
                    width={800}
                    height={600}
                    className="max-w-full h-auto max-h-[70vh]"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8">
                  <div className="text-6xl mb-4">{getFileIcon(selectedMedia.enhancedType)}</div>
                  <div className="text-lg bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-md font-mono mb-4">
                    {selectedMedia.fileExtension}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-6 text-center">
                    This file cannot be previewed in the browser.
                  </p>
                  <a
                    href={selectedMedia.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Download File
                  </a>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Uploaded:</strong> {new Date(selectedMedia.created_at || '').toLocaleString()}
              </p>
              {selectedMedia.description && (
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                  <strong>Description:</strong> {selectedMedia.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}