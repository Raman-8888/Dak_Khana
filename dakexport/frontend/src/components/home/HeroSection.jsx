import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ALL_VIDEO_URLS } from '../../lib/videoCache';
import './HeroSection.css';

const ALL_VIDEOS = ALL_VIDEO_URLS;

// Map of filename-substring → max play duration (seconds).
const VIDEO_TIME_LIMITS = {
  '/3.mp4': 3,
  '/4.mp4': 4,
};

function getTimeLimit(src) {
  if (!src) return null;
  for (const [key, limit] of Object.entries(VIDEO_TIME_LIMITS)) {
    if (src.includes(key)) return limit;
  }
  return null;
}

function pickRandom(excludeSrc) {
  if (ALL_VIDEOS.length <= 1) return ALL_VIDEOS[0];
  let next;
  do {
    next = ALL_VIDEOS[Math.floor(Math.random() * ALL_VIDEOS.length)];
  } while (next === excludeSrc);
  return next;
}

export default function HeroSection() {
  const heroRef = useRef(null);
  const headlineRef = useRef(null);
  const subRef = useRef(null);
  const ctaRef = useRef(null);
  const playerRef = useRef(null);

  const videoARef = useRef(null);
  const videoBRef = useRef(null);

  const [activeLayer, setActiveLayer] = useState('a');
  const [srcA, setSrcA] = useState(() => ALL_VIDEOS[Math.floor(Math.random() * ALL_VIDEOS.length)]);
  const [srcB, setSrcB] = useState(null);
  const transitionLock = useRef(false);
  const cutoffFired = useRef(false);

  const advanceVideo = useCallback(() => {
    if (transitionLock.current) return;
    transitionLock.current = true;
    cutoffFired.current = false;

    const currentSrc = activeLayer === 'a' ? srcA : srcB;
    const nextSrc = pickRandom(currentSrc);
    const incomingLayer = activeLayer === 'a' ? 'b' : 'a';
    const incomingRef = activeLayer === 'a' ? videoBRef : videoARef;

    if (incomingLayer === 'a') {
      setSrcA(nextSrc);
    } else {
      setSrcB(nextSrc);
    }

    requestAnimationFrame(() => {
      const el = incomingRef.current;
      if (el) {
        el.currentTime = 0;
        el.playbackRate = 1.3;

        const onCanPlay = () => {
          el.removeEventListener('canplay', onCanPlay);
          el.play().catch(() => {});
          setActiveLayer(incomingLayer);
          setTimeout(() => {
            transitionLock.current = false;
          }, 700);
        };

        if (el.readyState >= 3) {
          onCanPlay();
        } else {
          el.addEventListener('canplay', onCanPlay);
        }
      } else {
        transitionLock.current = false;
      }
    });
  }, [activeLayer, srcA, srcB]);

  const handleTimeUpdate = useCallback((e) => {
    if (cutoffFired.current) return;
    const videoEl = e.target;
    const src = activeLayer === 'a' ? srcA : srcB;
    const limit = getTimeLimit(src);
    if (limit && videoEl.currentTime >= limit) {
      cutoffFired.current = true;
      advanceVideo();
    }
  }, [activeLayer, srcA, srcB, advanceVideo]);

  // Entrance animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set([headlineRef.current, subRef.current, ctaRef.current], {
        opacity: 0,
        y: 40,
      });
      gsap.set(playerRef.current, { opacity: 0, x: 60 });

      const tl = gsap.timeline({ delay: 0.3 });
      tl.to(headlineRef.current, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' })
        .to(subRef.current, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.5')
        .to(ctaRef.current, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.4')
        .to(playerRef.current, { opacity: 1, x: 0, duration: 1, ease: 'power3.out' }, '-=0.8');
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="hero" ref={heroRef} id="hero-section">
      <div className="hero__deco-lines">
        <div className="hero__deco-line hero__deco-line--1" />
        <div className="hero__deco-line hero__deco-line--2" />
        <div className="hero__deco-line hero__deco-line--3" />
      </div>

      <div className="hero__container">
        <div className="hero__content">
          <h1 className="hero__headline" ref={headlineRef} id="hero-headline">
            Delivering
            <br />
            <span className="hero__headline-accent">more than</span>
            <br />
            just packages
          </h1>

          <p className="hero__sub" ref={subRef} id="hero-subtext">
            Fast. Reliable. Always on time.
          </p>

          <div className="hero__cta" ref={ctaRef} id="hero-cta">
            <Link to="/register" className="hero__btn hero__btn--primary" id="hero-cta-primary">
              Get Started
            </Link>
          </div>
        </div>

        <div className="hero__player" ref={playerRef} id="hero-player">
          <div className="hero__player-frame">
            {/* Layer A */}
            <video
              ref={videoARef}
              src={srcA}
              className={`hero__player-video ${activeLayer === 'a' ? 'hero__player-video--active' : ''}`}
              muted
              playsInline
              autoPlay
              onLoadedData={(e) => { e.target.playbackRate = 1.3; }}
              onTimeUpdate={activeLayer === 'a' ? handleTimeUpdate : undefined}
              onEnded={activeLayer === 'a' ? advanceVideo : undefined}
            />
            {/* Layer B */}
            <video
              ref={videoBRef}
              src={srcB || undefined}
              className={`hero__player-video ${activeLayer === 'b' ? 'hero__player-video--active' : ''}`}
              muted
              playsInline
              preload="auto"
              onLoadedData={(e) => { e.target.playbackRate = 1.3; }}
              onTimeUpdate={activeLayer === 'b' ? handleTimeUpdate : undefined}
              onEnded={activeLayer === 'b' ? advanceVideo : undefined}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
