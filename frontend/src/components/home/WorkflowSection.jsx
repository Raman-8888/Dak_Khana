import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './WorkflowSection.css';

const STEPS = [
  {
    step: '01',
    title: 'Create Export Request',
    desc: 'Enter shipment details, destination, and package information through our intuitive interface.',
  },
  {
    step: '02',
    title: 'Auto-Generate Documents',
    desc: 'System generates customs declarations, invoices, and compliance paperwork automatically.',
  },
  {
    step: '03',
    title: 'Review & Approve',
    desc: 'Smart verification with fraud detection ensures all shipments meet regulatory requirements.',
  },
  {
    step: '04',
    title: 'Track & Deliver',
    desc: 'Real-time visibility from pickup to delivery with automated notifications at every stage.',
  },
];

export default function WorkflowSection() {
  const sectionRef = useRef(null);
  const stepsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.fromTo(
              stepsRef.current.filter(Boolean),
              { opacity: 0, x: -30 },
              {
                opacity: 1,
                x: 0,
                duration: 0.6,
                stagger: 0.15,
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
    <section className="workflow" ref={sectionRef} id="workflow">
      <div className="workflow__inner">
        <div className="workflow__header">
          <span className="workflow__label">How It Works</span>
          <h2 className="workflow__title">Four Steps to<br />Global Delivery</h2>
          <p className="workflow__sub">
            From export request to doorstep delivery, our streamlined process handles everything.
          </p>
        </div>

        <div className="workflow__steps">
          <div className="workflow__line" />
          {STEPS.map((s, i) => (
            <div
              className="workflow__step"
              key={i}
              ref={(el) => (stepsRef.current[i] = el)}
              id={`workflow-step-${i}`}
            >
              <div className="workflow__step-marker">
                <span className="workflow__step-num">{s.step}</span>
              </div>
              <div className="workflow__step-content">
                <h3 className="workflow__step-title">{s.title}</h3>
                <p className="workflow__step-desc">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
