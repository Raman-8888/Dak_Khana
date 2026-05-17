import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './FeaturesSection.css';

const FEATURES = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M9 12h6M9 16h6M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="#45DB70" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Smart Documentation',
    desc: 'Auto-generate customs declarations, export invoices, and compliance documents with AI-powered templates.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="#45DB70" strokeWidth="1.5"/>
        <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10A15.3 15.3 0 0112 2z" stroke="#45DB70" strokeWidth="1.5"/>
      </svg>
    ),
    title: 'Global Tracking',
    desc: 'Real-time shipment visibility across 190+ countries with predictive delivery estimates and route optimization.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#45DB70" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M9 12l2 2 4-4" stroke="#45DB70" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Fraud Detection',
    desc: 'ML-powered fraud prevention with real-time risk scoring, anomaly detection, and automated compliance checks.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="3" width="20" height="14" rx="2" stroke="#45DB70" strokeWidth="1.5"/>
        <path d="M8 21h8M12 17v4" stroke="#45DB70" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M6 8h4M6 11h8" stroke="#45DB70" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Dashboard Analytics',
    desc: 'Comprehensive export metrics, revenue tracking, and operational insights with customizable reporting views.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="#45DB70" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Instant Pricing',
    desc: 'Dynamic pricing engine with real-time rate comparisons across carriers, zones, and package dimensions.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="#45DB70" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="8.5" cy="7" r="4" stroke="#45DB70" strokeWidth="1.5"/>
        <path d="M20 8v6M23 11h-6" stroke="#45DB70" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Role-Based Access',
    desc: 'Granular permissions for admins, clerks, and customers with two-factor authentication and audit logging.',
  },
];

export default function FeaturesSection() {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.fromTo(
              cardsRef.current.filter(Boolean),
              { opacity: 0, y: 50 },
              {
                opacity: 1,
                y: 0,
                duration: 0.7,
                stagger: 0.1,
                ease: 'power3.out',
              }
            );
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="features" ref={sectionRef} id="features">
      <div className="features__header">
        <span className="features__label">Features</span>
        <h2 className="features__title">Everything You Need to Export</h2>
        <p className="features__sub">
          A comprehensive suite of tools designed for modern logistics operations.
        </p>
      </div>

      <div className="features__grid">
        {FEATURES.map((f, i) => (
          <div
            className="features__card"
            key={i}
            ref={(el) => (cardsRef.current[i] = el)}
            id={`feature-card-${i}`}
          >
            <div className="features__card-icon">{f.icon}</div>
            <h3 className="features__card-title">{f.title}</h3>
            <p className="features__card-desc">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
