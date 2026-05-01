import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import './CTASection.css';

export default function CTASection() {
  const sectionRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.fromTo(
              contentRef.current,
              { opacity: 0, y: 40, scale: 0.97 },
              {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.8,
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
    <section className="cta-section" ref={sectionRef} id="cta-section">
      <div className="cta-section__card" ref={contentRef}>
        <div className="cta-section__glow cta-section__glow--1" />
        <div className="cta-section__glow cta-section__glow--2" />
        <div className="cta-section__content">
          <h2 className="cta-section__title">
            Ready to Transform<br />Your Export Operations?
          </h2>
          <p className="cta-section__sub">
            Join thousands of logistics professionals already using Dak Ghar
            to streamline their international shipments.
          </p>
          <div className="cta-section__actions">
            <Link to="/register" className="cta-section__btn cta-section__btn--primary" id="cta-get-started">
              Get Started Free
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link to="/login" className="cta-section__btn cta-section__btn--ghost" id="cta-login">
              Talk to Sales
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
