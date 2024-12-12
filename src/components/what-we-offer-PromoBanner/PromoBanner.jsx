import React, { useState, useEffect, useRef, useCallback } from 'react';
import './PromoBanner.css';

// Import your images and videos here
import cinemaImage from '/whatWeOffer/cinema.jpg';
import arcadeImage from '/whatWeOffer/Game Arcade (1).mp4';
import clubImage from '/whatWeOffer/club voltage (1).mp4';
import hotelImage from '/hotel.jpg';
import hogisluxury from '/hogisluxury.jpg';
import hogisexclusive from '/hogis exclusive.jpg';
import banquetImage from '/hall.jpg';
import HogisCafe from '/whatWeOffer/Hogis Cafe.jpg';
import deVoltageLounge from '/whatWeOffer/de voltage lounge.jpg';
import hogisfitness from '/whatWeOffer/hogis fitness.mp4';
import grillLounge from '/whatWeOffer/grilllounge.jpg'

const banners = [
  {
    title: "Games Arcade",
    description: "Fun for all ages",
    startTime: "Open 10 AM - 10 PM",
    media: { type: 'video', source: arcadeImage },
    showButton: false,
  },
  {
    title: "Club Voltage",
    description: "Dance the night away",
    startTime: "Opens at 10PM",
    media: { type: 'video', source: clubImage },
    buttonContent: { whatsapp: "+2348061535774" },
  },
  {
    title: "Hogis Cafe",
    description: "Savor the best coffee and freshly made treats at Hogis Cafe.",
    startTime: "Available for bookings",
    media: { type: 'image', source: HogisCafe },
    buttonContent: { whatsapp: "+2349064515288" },
  },
  {
    title: "Hogis Cinemas",
    description: "Savor the best coffee and freshly made treats at Hogis Cafe.",
    startTime: "Available for bookings",
    media: { type: 'image', source: cinemaImage },
    buttonContent: { whatsapp: "+2349064515288" },
  },
 
  {
    title: "Hogis Royale And Apartments",
    description: "Luxury experiences",
    startTime: "Check-in from 2 PM",
    media: { type: 'image', source: hotelImage },
    buttonContent: { whatsapp: "+2347073536464" },
  },
  {
    title: "Hogis Luxury Suites",
    description: "Your home away from home",
    startTime: "Check-in from 2 PM",
    media: { type: 'image', source: hogisluxury },
    buttonContent: { whatsapp: "+2348099903335" },
  },
  {
    title: "Hogis Exclusive Suites",
    description: "Exclusive luxury experiences",
    startTime: "Check-in from 2 PM",
    media: { type: 'image', source: hogisexclusive },
    buttonContent: { whatsapp: "+2348109516906" },
  },
  {
    title: "De Voltage Lounge",
    description: "Ultimate spot for relaxation and entertainment.",
    startTime: "Available for bookings",
    media: { type: 'image', source: deVoltageLounge },
    showButton: false,
  },

  {
    title: "Royale Banquet Hall",
    description: "Perfect for your special events",
    startTime: "Available for bookings",
    media: { type: 'image', source: banquetImage },
    buttonContent: { whatsapp: "+2348132060974" },
  },
  {
    title: "Grill Lounge",
    description: "Premium spot for relaxation and entertainment.",
    startTime: "Available for bookings",
    media: { type: 'image', source: grillLounge },
    showButton: false,
  },
  {
    title: "Hogis Fitness",
    description: "The Premium fitness center @ 7 Akim street.",
    startTime: "Available for bookings",
    media: { type: 'video', source: hogisfitness },
    buttonContent: { whatsapp: "+2348099903335" },
  },
];

const PromoBanner = () => {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const bannerRef = useRef(null);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const autoSwipeTimerRef = useRef(null);

  const changeBanner = useCallback((nextBanner) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentBanner(nextBanner);
      setIsTransitioning(false);
    }, 50);
  }, []);

  const resetAutoSwipeTimer = useCallback(() => {
    if (autoSwipeTimerRef.current) {
      clearInterval(autoSwipeTimerRef.current);
    }
    autoSwipeTimerRef.current = setInterval(() => {
      changeBanner((prev) => (prev + 1) % banners.length);
    }, 4000);
  }, [changeBanner]);

  useEffect(() => {
    resetAutoSwipeTimer();
    return () => {
      if (autoSwipeTimerRef.current) {
        clearInterval(autoSwipeTimerRef.current);
      }
    };
  }, [resetAutoSwipeTimer]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
    if (autoSwipeTimerRef.current) {
      clearInterval(autoSwipeTimerRef.current);
    }
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;

    const distance = touchStartX.current - touchEndX.current;
    const isSignificantSwipe = Math.abs(distance) > 50;

    if (isSignificantSwipe) {
      if (distance > 0) {
        changeBanner((currentBanner + 1) % banners.length);
      } else {
        changeBanner((currentBanner - 1 + banners.length) % banners.length);
      }
      resetAutoSwipeTimer();
    } else {
      changeBanner(currentBanner);
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div className="promo-banner-wrapper">
      <h2>What We Offer</h2>
      <div className="promo-banner-container">
        <div
          className={`promo-banner ${isTransitioning ? 'transitioning' : ''}`}
          style={{ transform: `translateX(-${currentBanner * 100}%)` }}
          ref={bannerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {banners.map((banner, index) => (
            <div key={index} className="banner-slide">
              <div className="banner-content">
                <h2>{banner.title}</h2>
                <p>{banner.description}</p>
                {banner.showButton === false ? null : banner.buttonContent ? (
                <a
                  href={`https://wa.me/${banner.buttonContent.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-button"
                >
                  Book
                </a>
              ) : null}

                <span className="start-time">{banner.startTime}</span>
              </div>
              <div className="banner-media">
                {banner.media.type === 'video' ? (
                  <video autoPlay loop muted playsInline>
                    <source src={banner.media.source} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img src={banner.media.source} alt={banner.title} />
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="banner-indicators">
          {banners.map((_, index) => (
            <span
              key={index}
              className={`indicator ${index === currentBanner ? 'active' : ''}`}
              onClick={() => {
                changeBanner(index);
                resetAutoSwipeTimer();
              }}
            ></span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromoBanner;