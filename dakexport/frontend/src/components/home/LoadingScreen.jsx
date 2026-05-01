import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import './LoadingScreen.css';

const videoModules = import.meta.glob('../../assets/videos/*.mp4', {
  eager: true,
  query: '?url',
  import: 'default',
});
const ALL_VIDEO_URLS = Object.values(videoModules);

export default function LoadingScreen({ onComplete }) {
  const overlayRef = useRef(null);
  const logoRef = useRef(null);
  const barTrackRef = useRef(null);
  const barFillRef = useRef(null);
  const percentRef = useRef(null);
  const taglineRef = useRef(null);
  const lineTopRef = useRef(null);
  const lineBotRef = useRef(null);

  const [percent, setPercent] = useState(0);
  const loadedCount = useRef(0);
  const totalVideos = ALL_VIDEO_URLS.length;
  const hasCompleted = useRef(false);

  const finishLoading = useCallback(() => {
    if (hasCompleted.current) return;
    hasCompleted.current = true;

    const tl = gsap.timeline({
      onComplete: () => {
        if (onComplete) onComplete();
      },
    });

    tl.to(percentRef.current, {
      opacity: 0,
      y: -10,
      duration: 0.3,
      ease: 'power2.in',
    })
    .to(barTrackRef.current, {
      opacity: 0,
      scaleX: 1.1,
      duration: 0.3,
      ease: 'power2.in',
    }, '-=0.2')
    .to(taglineRef.current, {
      opacity: 0,
      y: 10,
      duration: 0.3,
      ease: 'power2.in',
    }, '-=0.25')
    .to(logoRef.current, {
      scale: 0.85,
      opacity: 0,
      duration: 0.4,
      ease: 'power3.in',
    }, '-=0.15')
    .to([lineTopRef.current, lineBotRef.current], {
      scaleX: 0,
      duration: 0.35,
      ease: 'power2.in',
    }, '-=0.3')
    .to(overlayRef.current, {
      clipPath: 'inset(0 0 100% 0)',
      duration: 0.7,
      ease: 'power3.inOut',
    }, '-=0.1');
  }, [onComplete]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const entrance = gsap.timeline({ delay: 0.1 });

      gsap.set(logoRef.current, { opacity: 0, scale: 0.8, y: 20 });
      gsap.set(barTrackRef.current, { opacity: 0, scaleX: 0.3 });
      gsap.set(percentRef.current, { opacity: 0, y: 10 });
      gsap.set(taglineRef.current, { opacity: 0, y: 10 });
      gsap.set([lineTopRef.current, lineBotRef.current], { scaleX: 0 });

      entrance
        .to([lineTopRef.current, lineBotRef.current], {
          scaleX: 1,
          duration: 0.6,
          ease: 'power2.out',
          stagger: 0.1,
        })
        .to(logoRef.current, {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.7,
          ease: 'back.out(1.4)',
        }, '-=0.3')
        .to(barTrackRef.current, {
          opacity: 1,
          scaleX: 1,
          duration: 0.5,
          ease: 'power2.out',
        }, '-=0.3')
        .to(percentRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: 'power2.out',
        }, '-=0.2')
        .to(taglineRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: 'power2.out',
        }, '-=0.2');
    }, overlayRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (barFillRef.current) {
      gsap.to(barFillRef.current, {
        scaleX: percent / 100,
        duration: 0.4,
        ease: 'power2.out',
      });
    }
  }, [percent]);

  useEffect(() => {
    let cancelled = false;

    const preloadVideo = (url) =>
      new Promise((resolve) => {
        const video = document.createElement('video');
        video.preload = 'auto';
        video.muted = true;
        video.playsInline = true;
        video.src = url;

        const done = () => {
          if (cancelled) return;
          loadedCount.current += 1;
          const pct = Math.round((loadedCount.current / totalVideos) * 100);
          setPercent(pct);
          resolve();
        };

        video.addEventListener('canplaythrough', done, { once: true });

        video.addEventListener('error', done, { once: true });

        setTimeout(done, 8000);

        video.load();
      });

    const runPreload = async () => {
      const batchSize = 3;
      for (let i = 0; i < ALL_VIDEO_URLS.length; i += batchSize) {
        if (cancelled) return;
        const batch = ALL_VIDEO_URLS.slice(i, i + batchSize);
        await Promise.all(batch.map(preloadVideo));
      }

      await new Promise((r) => setTimeout(r, 300));

      if (!cancelled) finishLoading();
    };

    runPreload();

    return () => {
      cancelled = true;
    };
  }, [totalVideos, finishLoading]);

  return (
    <div className="loading-screen" ref={overlayRef} id="loading-screen">
      <div className="loading-screen__deco-line loading-screen__deco-line--top" ref={lineTopRef} />
      <div className="loading-screen__deco-line loading-screen__deco-line--bot" ref={lineBotRef} />

      <div className="loading-screen__center">
        <div className="loading-screen__logo" ref={logoRef}>
          <div className="loading-screen__logo-icon">
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
              <rect width="44" height="44" rx="12" fill="#45DB70" />
              <path
                d="M12 22L18 28L32 14"
                stroke="#fff"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="loading-screen__logo-text">Dak Ghar</span>
        </div>

        <div className="loading-screen__progress" ref={barTrackRef}>
          <div className="loading-screen__progress-fill" ref={barFillRef} />
        </div>

        <span className="loading-screen__percent" ref={percentRef}>
          {percent}%
        </span>

        <p className="loading-screen__tagline" ref={taglineRef}>
          Preparing your experience
        </p>
      </div>
    </div>
  );
}

export { ALL_VIDEO_URLS };
