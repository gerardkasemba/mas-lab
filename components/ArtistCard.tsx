import Image from "next/image";
import { Artist } from "@/lib/types";

interface ArtistCardProps {
  artist: Artist;
  onClick: () => void;
}

export default function ArtistCard({ artist, onClick }: ArtistCardProps) {
  return (
    <div
      onClick={onClick}
      className="group relative bg-card-light dark:bg-card-dark rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer overflow-hidden"
    >
      <div className="relative w-full h-48">
        <Image
          src={artist.avatar_url || "/placeholder.jpg"}
          alt={artist.name}
          fill
          className="object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 text-center">
          {artist.name}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-1">
          {artist.project_name}
        </p>
      </div>
    </div>
  );
}