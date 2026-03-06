import React, { useState, useEffect, useCallback } from 'react';

const slides = [
  { id: 1, name: 'title', alt: 'GRITS & GREENS Title', url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/GdtWgcrpXgKGOiHR.webp' },
  { id: 2, name: 'the_movement', alt: 'The Movement Starts Here', url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/QGrYSupTQWvYuxjd.webp' },
  { id: 3, name: 'squadd_goals', alt: 'SQUADD Goals', url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/UZZGPzxzKFEoTZym.webp' },
  { id: 4, name: 'run_of_show', alt: 'Run of Show', url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/oZiMtmsnmUPcuHqM.webp' },
  { id: 5, name: 'grit_pitch', alt: 'GRIT Pitch', url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/MlIYFQwRYTRMUfCc.webp' },
  { id: 6, name: 'intersections', alt: 'Intersections', url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/ZjSOVXxDYlmTzaHG.webp' },
  { id: 7, name: 'technology_ecosystem', alt: 'Technology Ecosystem', url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/nrlNLQRCZhOrYuqh.webp' },
  { id: 8, name: 'dad_legacy', alt: 'Dad Legacy', url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/eJqyrgpQEmqFjjmR.webp' },
  { id: 9, name: 'sweet_miracles_mission', alt: 'Sweet Miracles Mission', url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/yRwVNVbntUbfXDLl.webp' },
  { id: 10, name: 'the_solution', alt: 'The Solution', url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/AfwrEsMBnBcKNxGU.webp' },
  { id: 11, name: 'qumus_demo', alt: 'QUMUS Demo', url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/seVDoouozNNwEaFp.webp' },
  { id: 12, name: 'ai_video_demo', alt: 'Meet the AI', type: 'video' },
  { id: 13, name: 'family_legacy', alt: 'Family Legacy', url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/RMBhVbhUYdhqWKTd.webp' },
  { id: 14, name: 'selma_to_un', alt: 'Selma to UN', url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/MUamlSZlDfQYpmCo.webp' },
  { id: 15, name: 'call_to_action', alt: 'Call to Action', url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/gqavagRhRQiqnSym.webp' },
  { id: 16, name: 'closing', alt: 'A Canryn Production', url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/PjlcoLwnFybmvkvf.webp' },
  { id: 17, name: 'rrb_spotify', alt: 'Rockin Rockin Boogie', type: 'spotify' },
];

const VIDEO_URL = 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/BYppFQPhGhmbYOkr.mp4';
const POSTER_URL = 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/QuhbrRHSBnIQdOgm.png';

export default function SelmaSlideshow() {
  const [current, setCurrent] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const total = slides.length;

  const goNext = useCallback(() => {
    setCurrent(prev => (prev + 1) % total);
  }, [total]);

  const goPrev = useCallback(() => {
    setCurrent(prev => (prev - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); goNext(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
      if (e.key === 'f' || e.key === 'F11') {
        e.preventDefault();
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen();
          setIsFullscreen(true);
        } else {
          document.exitFullscreen();
          setIsFullscreen(false);
        }
      }
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev]);

  // Touch swipe
  useEffect(() => {
    let startX = 0;
    const onStart = (e: TouchEvent) => { startX = e.touches[0].clientX; };
    const onEnd = (e: TouchEvent) => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) diff > 0 ? goNext() : goPrev();
    };
    window.addEventListener('touchstart', onStart);
    window.addEventListener('touchend', onEnd);
    return () => { window.removeEventListener('touchstart', onStart); window.removeEventListener('touchend', onEnd); };
  }, [goNext, goPrev]);

  const slide = slides[current];

  const renderSlide = () => {
    if (slide.type === 'video') {
      return (
        <div style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1208 40%, #0a0a0a 100%)'
        }}>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#C9A84C', fontSize: 'clamp(20px, 2.5vw, 40px)', fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', textShadow: '0 0 30px rgba(201,168,76,0.3)', marginBottom: '0.3em' }}>
            Meet the AI
          </h2>
          <p style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#f5e6c8', fontSize: 'clamp(12px, 1.2vw, 20px)', fontStyle: 'italic', marginBottom: '1em' }}>
            Valanna &amp; Candy Walk Us Through the Ecosystem
          </p>
          <video
            controls
            preload="metadata"
            poster={POSTER_URL}
            style={{ width: '75%', maxHeight: '65vh', borderRadius: 8, border: '2px solid rgba(201,168,76,0.4)', boxShadow: '0 0 40px rgba(201,168,76,0.25)' }}
          >
            <source src={VIDEO_URL} type="video/mp4" />
          </video>
          <p style={{ color: '#E63946', fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(10px, 1.1vw, 18px)', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginTop: '0.5em' }}>
            &#9654; Press Play — 2:40 Demonstration
          </p>
        </div>
      );
    }

    if (slide.type === 'spotify') {
      return (
        <div style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', position: 'relative',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1208 40%, #0a0a0a 100%)'
        }}>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#C9A84C', fontSize: 'clamp(20px, 3vw, 48px)', fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', marginBottom: '0.2em' }}>
            Rockin' Rockin' Boogie
          </h2>
          <p style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#f5e6c8', fontSize: 'clamp(12px, 1.3vw, 22px)', fontStyle: 'italic', marginBottom: '1em' }}>
            The Song That Started It All
          </p>
          <iframe
            src="https://open.spotify.com/embed/track/15i4m3akEhDxAchFz18eip?utm_source=generator&theme=0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            style={{ width: 550, maxWidth: '80%', height: 232, borderRadius: 12, border: '1px solid rgba(201,168,76,0.3)', boxShadow: '0 0 40px rgba(201,168,76,0.2)' }}
          />
          <div style={{ textAlign: 'center', marginTop: '1em' }}>
            <p style={{ color: '#C9A84C', fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(12px, 1.2vw, 20px)', fontWeight: 700 }}>
              Co-Written by Seabrun Candy Hunter
            </p>
            <p style={{ color: '#a0937a', fontSize: 'clamp(10px, 0.9vw, 16px)', marginTop: 3 }}>
              Registered through Payten Music in BMI
            </p>
          </div>
          <div style={{ display: 'flex', gap: '3em', marginTop: '1em', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#C9A84C', fontSize: 'clamp(8px, 0.8vw, 14px)', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>Listen on Spotify</p>
              <p style={{ color: '#f5e6c8', fontSize: 'clamp(9px, 0.9vw, 15px)' }}>Search: Rockin' Rockin' Boogie</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#C9A84C', fontSize: 'clamp(8px, 0.8vw, 14px)', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>Explore the Full Legacy</p>
              <p style={{ color: '#f5e6c8', fontSize: 'clamp(9px, 0.9vw, 15px)' }}>rockinrockinboogie.com</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#C9A84C', fontSize: 'clamp(8px, 0.8vw, 14px)', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>The Ecosystem</p>
              <p style={{ color: '#f5e6c8', fontSize: 'clamp(9px, 0.9vw, 15px)' }}>manuweb.sbs</p>
            </div>
          </div>
          <div style={{
            position: 'absolute', bottom: 0, width: '100%',
            background: 'linear-gradient(90deg, #C9A84C 0%, #a8893a 50%, #C9A84C 100%)',
            padding: '0.8em 0', textAlign: 'center'
          }}>
            <p style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#0a0a0a', fontSize: 'clamp(10px, 1.1vw, 18px)', fontWeight: 700 }}>
              This song gave the ecosystem its name. This legacy gave us our mission.
            </p>
            <p style={{ color: '#2a2010', fontSize: 'clamp(8px, 0.8vw, 14px)', marginTop: 2 }}>
              A Canryn Production &amp; Its Subsidiaries | sweetmiracleattt@gmail.com
            </p>
          </div>
        </div>
      );
    }

    return (
      <img
        src={slide.url}
        alt={slide.alt}
        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
      />
    );
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', position: 'relative', overflow: 'hidden', userSelect: 'none' }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
      
      {/* Slide */}
      <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#000' }}>
        {renderSlide()}
      </div>

      {/* Navigation arrows */}
      <button
        onClick={goPrev}
        style={{
          position: 'fixed', left: 15, top: '50%', transform: 'translateY(-50%)', zIndex: 100,
          background: 'rgba(201,168,76,0.7)', color: '#000', border: 'none', fontSize: '2em',
          width: 50, height: 50, borderRadius: '50%', cursor: 'pointer', opacity: 0.6
        }}
      >
        &#10094;
      </button>
      <button
        onClick={goNext}
        style={{
          position: 'fixed', right: 15, top: '50%', transform: 'translateY(-50%)', zIndex: 100,
          background: 'rgba(201,168,76,0.7)', color: '#000', border: 'none', fontSize: '2em',
          width: 50, height: 50, borderRadius: '50%', cursor: 'pointer', opacity: 0.6
        }}
      >
        &#10095;
      </button>

      {/* Slide counter */}
      <div style={{
        position: 'fixed', bottom: 15, right: 20, zIndex: 100, color: '#C9A84C',
        fontSize: '1em', background: 'rgba(0,0,0,0.6)', padding: '5px 12px', borderRadius: 20
      }}>
        {current + 1} / {total}
      </div>

      {/* Hint */}
      <div style={{
        position: 'fixed', bottom: 15, left: 20, zIndex: 100, color: '#a0937a',
        fontSize: '0.8em', background: 'rgba(0,0,0,0.6)', padding: '5px 12px', borderRadius: 20
      }}>
        Swipe or use arrow keys • Press F for fullscreen
      </div>
    </div>
  );
}
