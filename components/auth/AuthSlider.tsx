import React, { useState, useEffect } from 'react';
import { AUTH_SLIDER_DATA } from '../../constants';

const AuthSlider: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % AUTH_SLIDER_DATA.length);
    }, 7000); // Change slide every 7 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full lg:w-1/2 bg-cover bg-center hidden lg:block relative">
      {AUTH_SLIDER_DATA.map((slide, index) => (
        <div
          key={index}
          className="absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000"
          style={{
            backgroundImage: `url('${slide.imageUrl}')`,
            opacity: index === currentIndex ? 1 : 0,
          }}
        >
          <div className="w-full h-full bg-green-900 bg-opacity-70 flex flex-col justify-end p-12">
            <div className="text-white" style={{textShadow: '0 2px 10px rgba(0,0,0,0.5)'}}>
              <h2 className="text-3xl font-bold mb-2">"{slide.quote}"</h2>
              <p className="text-xl font-light opacity-90">- {slide.author}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AuthSlider;
