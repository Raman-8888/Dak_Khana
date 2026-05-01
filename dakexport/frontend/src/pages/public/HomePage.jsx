import { useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import HeroSection from '../../components/home/HeroSection';
import FeaturesSection from '../../components/home/FeaturesSection';
import StatsSection from '../../components/home/StatsSection';
import WorkflowSection from '../../components/home/WorkflowSection';
import CTASection from '../../components/home/CTASection';
import Footer from '../../components/layout/Footer';
import './HomePage.css';

export default function HomePage() {
  useEffect(() => {
    document.title = 'Dak Ghar Export System — Modern Logistics Platform';
  }, []);

  return (
    <div className="homepage" id="homepage">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <StatsSection />
        <WorkflowSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
