import React, { useState, useEffect } from 'react';

interface ImageCarouselProps {
  autoPlay?: boolean;
  interval?: number;
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({ autoPlay = true, interval = 5000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Temple background images - these should be saved in public/images/temples/
  // Place your temple images with these exact filenames in the public folder
  const images = [
    '/images/temples/Durga.png',
    '/images/temples/Khali.png',
    '/images/temples/Lakshmi.png',
  ];

  // Fallback gradients if images are not available
  const fallbackGradients = [
    'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #dc2626 100%)',
    'linear-gradient(135deg, #ea580c 0%, #dc2626 50%, #991b1b 100%)',
    'linear-gradient(135deg, #dc2626 0%, #991b1b 50%, #7f1d1d 100%)',
  ];

  useEffect(() => {
    if (!autoPlay) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, images.length]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Image slides */}
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            backgroundImage: `url('${image}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            background: `url('${image}') center/cover, ${fallbackGradients[index]}`,
          }}
        >
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/45"></div>
        </div>
      ))}

      {/* Slide indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex
                ? 'bg-white w-8'
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

