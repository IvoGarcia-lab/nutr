import React, { useState } from 'react';

interface CarouselProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

const Carousel = <T,>({ items, renderItem }: CarouselProps<T>) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? items.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastSlide = currentIndex === items.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };
  
  const goToSlide = (slideIndex: number) => {
      setCurrentIndex(slideIndex);
  }

  return (
    <div className="relative w-full">
      <div className="overflow-hidden relative">
        <div 
          className="flex transition-transform ease-in-out duration-500"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {items.map((item, index) => (
            <div key={index} className="min-w-full">
              {renderItem(item)}
            </div>
          ))}
        </div>
      </div>

      {items.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute top-1/2 left-0 md:-left-4 transform -translate-y-1/2 bg-white/50 hover:bg-white/80 rounded-full p-2 text-gray-700 shadow-md transition"
            aria-label="Anterior"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button
            onClick={goToNext}
            className="absolute top-1/2 right-0 md:-right-4 transform -translate-y-1/2 bg-white/50 hover:bg-white/80 rounded-full p-2 text-gray-700 shadow-md transition"
            aria-label="Seguinte"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
          </button>
           <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                {items.map((_, slideIndex) => (
                    <button key={slideIndex} onClick={() => goToSlide(slideIndex)} className={`h-2 w-2 rounded-full transition-colors ${currentIndex === slideIndex ? 'bg-emerald-500' : 'bg-gray-300 hover:bg-gray-400'}`}></button>
                ))}
            </div>
        </>
      )}
    </div>
  );
};

export default Carousel;