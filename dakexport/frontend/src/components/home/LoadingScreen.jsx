import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { startPreload, offProgress, ALL_VIDEO_URLS } from '../../lib/videoCache';
import './LoadingScreen.css';


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
    const onProgress = (pct, isDone) => {
      setPercent(pct);
      if (isDone) {
        setTimeout(finishLoading, 300);
      }
    };

    startPreload(onProgress);
    return () => offProgress(onProgress);
  }, [finishLoading]);


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
