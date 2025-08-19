import { useEffect, useState } from 'react';

interface ContentHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  centered?: boolean;
}

const ContentHeader = ({ 
  title, 
  subtitle,
  description,
  centered = false 
}: ContentHeaderProps) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative overflow-hidden py-16 md:py-24">
      {/* Animated gradient background */}
      <div 
        className="absolute inset-0 z-0 transition-all duration-1000 ease-out"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, 
                      rgba(255, 138, 0, 0.15), 
                      transparent 30%),
                      radial-gradient(400px circle at ${mousePosition.x * 0.8}px ${mousePosition.y * 0.8}px, 
                      rgba(251, 191, 36, 0.2), 
                      transparent 25%),
                      radial-gradient(300px circle at ${mousePosition.x * 1.2}px ${mousePosition.y * 1.2}px, 
                      rgba(245, 158, 11, 0.15), 
                      transparent 20%),
                      linear-gradient(135deg, #fef3c7 0%, #fed7aa 25%, #fdba74 50%, #fb923c 75%, #f97316 100%)`
        }}
      />
      
      {/* Text readability overlay */}
      <div className="absolute inset-0 z-1 bg-white/30 dark:bg-gray-900/40 backdrop-blur-sm" />
      
      {/* Animated particles */}
      <div className="absolute inset-0 z-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 20 + 5}px`,
              height: `${Math.random() * 20 + 5}px`,
              background: `rgba(255, ${150 + Math.random() * 100}, ${Math.random() * 100}, ${0.3 + Math.random() * 0.4})`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${15 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>
      
      {/* Animated gradient border */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`${centered ? 'text-center' : 'text-left'}`}>
          {subtitle && (
            <p className="text-sm font-medium text-orange-800 dark:text-amber-200 uppercase tracking-wide mb-2 animate-fade-in">
              {subtitle}
            </p>
          )}
          
          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 animate-fade-in-up">
            {title}
          </h2>
          
          {description && (
            <p className="text-lg md:text-xl text-gray-800 dark:text-gray-200 max-w-3xl mx-auto animate-fade-in-up delay-150">
              {description}
            </p>
          )}
        </div>
      </div>
      
      {/* Custom styles for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes fade-in-up {
          0% { 
            opacity: 0;
            transform: translateY(20px);
          }
          100% { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-float {
          animation: float 10s ease-in-out infinite;
        }
        .animate-shimmer {
          background-size: 1000px 100%;
          animation: shimmer 8s infinite linear;
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        .delay-150 {
          animation-delay: 150ms;
        }
      `}</style>
    </div>
  );
};

export default ContentHeader;