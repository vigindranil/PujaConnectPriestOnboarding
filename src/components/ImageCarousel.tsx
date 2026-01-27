import React, { useState, useEffect } from 'react';

interface ImageCarouselProps {
  autoPlay?: boolean;
  interval?: number;
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({
  autoPlay = true,
  interval = 5000
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageError, setImageError] = useState<boolean[]>([]);

  // Use import.meta.env.BASE_URL to get the correct base path
  const basePath = import.meta.env.BASE_URL;

  // Updated paths with base path support
  const images = [
    `${basePath}images/temples/Durga.png`,
    `${basePath}images/temples/Khali.png`,
    `${basePath}images/temples/Lakshmi.png`,
    `${basePath}images/temples/Temple.png`,
  ];
  // Fallback gradients if images fail to load
  const fallbackGradients = [
    'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #dc2626 100%)',
    'linear-gradient(135deg, #ea580c 0%, #dc2626 50%, #991b1b 100%)',
    'linear-gradient(135deg, #dc2626 0%, #991b1b 50%, #7f1d1d 100%)',
    'linear-gradient(135deg, #991b1b 0%, #7f1d1d 50%, #450a0a 100%)',
  ];

  useEffect(() => {
    // Initialize error state
    setImageError(new Array(images.length).fill(false));
  }, []);

  useEffect(() => {
    if (!autoPlay) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, images.length]);

  const handleImageError = (index: number) => {
    setImageError(prev => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });
  };

  return (
    <div className="absolute inset-0 overflow-hidden -z-0">
      {/* Image slides */}
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
        >
          {/* Use gradient as background, image as overlay */}
          <div
            className="absolute inset-0"
            style={{ background: fallbackGradients[index] }}
          />

          {/* Image overlay */}
          {!imageError[index] && (
            <img
              src={image}
              alt={`Temple ${index + 1}`}
              className="absolute inset-0 w-full h-full object-cover"
              onError={() => handleImageError(index)}
            />
          )}

          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
        </div>
      ))}

      {/* Slide indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`transition-all duration-300 rounded-full ${index === currentIndex
              ? 'bg-white w-8 h-2 shadow-lg'
              : 'bg-white/50 hover:bg-white/75 w-2 h-2'
              }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};