import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './StatsSection.css';

const STATS = [
  { value: '2.4M+', label: 'Shipments Processed' },
  { value: '190+', label: 'Countries Covered' },
  { value: '99.97%', label: 'Uptime Guarantee' },
  { value: '<2s', label: 'Document Generation' },
];

export default function StatsSection() {
  const sectionRef = useRef(null);
  const statsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.fromTo(
              statsRef.current.filter(Boolean),
              { opacity: 0, y: 30, scale: 0.95 },
              {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.6,
                stagger: 0.12,
                ease: 'power3.out',
              }
            );
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="stats" ref={sectionRef} id="stats">
      <div className="stats__inner">
        {STATS.map((s, i) => (
          <div
            className="stats__item"
            key={i}
            ref={(el) => (statsRef.current[i] = el)}
            id={`stat-item-${i}`}
          >
            <span className="stats__value">{s.value}</span>
            <span className="stats__label">{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
