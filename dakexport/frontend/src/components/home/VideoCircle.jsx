import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import './VideoCircle.css';

export default function VideoCircle({ videoSrc, config, index }) {
  const containerRef = useRef(null);
  const videoARef = useRef(null);
  const videoBRef = useRef(null);
  const [activeSlot, setActiveSlot] = useState('A');
  const [slotASrc, setSlotASrc] = useState(videoSrc);
  const [slotBSrc, setSlotBSrc] = useState(null);
  const isTransitioning = useRef(false);
  const floatTl = useRef(null);
  const prevVideoSrc = useRef(videoSrc);

  const configDelay = config?.delay ?? 0;
  const configSize = config?.size ?? 150;

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !config) return;

    gsap.set(el, { opacity: 0, scale: 0.7, force3D: true });
    gsap.to(el, {
      opacity: 1,
      scale: 1,
      duration: 0.9,
      delay: configDelay + 0.5,
      ease: 'back.out(1.4)',
      force3D: true,
    });

    const yDrift = 8 + Math.random() * 10;
    const dur = 6 + Math.random() * 4;

    floatTl.current = gsap.to(el, {
      y: yDrift,
      duration: dur,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      force3D: true,
    });

    return () => {
      if (floatTl.current) floatTl.current.kill();
    };
  }, [configDelay, config]);

  const startVideo = useCallback((videoEl) => {
    if (!videoEl) return;
    videoEl.playbackRate = 1.3;
    videoEl.play().catch(() => {});
  }, []);

  const pauseVideo = useCallback((videoEl) => {
    if (!videoEl) return;
    videoEl.pause();
  }, []);

  useEffect(() => {
    if (videoSrc === prevVideoSrc.current || isTransitioning.current) return;
    prevVideoSrc.current = videoSrc;
    isTransitioning.current = true;

    const isAActive = activeSlot === 'A';
    const newSlot = isAActive ? 'B' : 'A';

    if (isAActive) {
      setSlotBSrc(videoSrc);
    } else {
      setSlotASrc(videoSrc);
    }

    const runTransition = () => {
      const incoming = isAActive ? videoBRef.current : videoARef.current;
      const outgoing = isAActive ? videoARef.current : videoBRef.current;

      if (!incoming) {
        isTransitioning.current = false;
        return;
      }

      startVideo(incoming);

      gsap.set(incoming, { opacity: 0, force3D: true });

      gsap.to(incoming, {
        opacity: 1,
        duration: 0.5,
        ease: 'power1.inOut',
        force3D: true,
        onComplete: () => {
          if (outgoing) {
            gsap.set(outgoing, { opacity: 0, force3D: true });
            pauseVideo(outgoing);
          }
          setActiveSlot(newSlot);
          isTransitioning.current = false;
        },
      });

      if (outgoing) {
        gsap.to(outgoing, {
          opacity: 0,
          duration: 0.5,
          ease: 'power1.inOut',
          force3D: true,
        });
      }
    };

    requestAnimationFrame(runTransition);
  }, [videoSrc, activeSlot, startVideo, pauseVideo]);

  if (!config) return null;

  const style = {
    width: configSize,
    height: configSize,
    ...(config.top !== undefined && { top: config.top }),
    ...(config.bottom !== undefined && { bottom: config.bottom }),
    ...(config.left !== undefined && { left: config.left }),
    ...(config.right !== undefined && { right: config.right }),
  };

  return (
    <div
      className="video-circle"
      ref={containerRef}
      style={style}
      data-index={index}
    >
      <div className="video-circle__inner">
        <video
          ref={videoARef}
          className="video-circle__video"
          src={slotASrc}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          style={{ opacity: activeSlot === 'A' ? 1 : 0 }}
          onLoadedData={(e) => { if (activeSlot === 'A') startVideo(e.target); }}
        />
        {slotBSrc && (
          <video
            ref={videoBRef}
            className="video-circle__video"
            src={slotBSrc}
            muted
            loop
            playsInline
            preload="auto"
            style={{ opacity: activeSlot === 'B' ? 1 : 0 }}
            onLoadedData={(e) => { if (activeSlot === 'B') startVideo(e.target); }}
          />
        )}
        <div className="video-circle__border" />
      </div>
    </div>
  );
}
