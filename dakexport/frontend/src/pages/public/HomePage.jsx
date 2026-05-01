import { useEffect, useState } from 'react';
import Navbar from '../../components/layout/Navbar';
import HeroSection from '../../components/home/HeroSection';
import FeaturesSection from '../../components/home/FeaturesSection';
import StatsSection from '../../components/home/StatsSection';
import WorkflowSection from '../../components/home/WorkflowSection';
import CTASection from '../../components/home/CTASection';
import Footer from '../../components/layout/Footer';
import LoadingScreen from '../../components/home/LoadingScreen';
import './HomePage.css';

export default function HomePage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Dak Ghar Export System — Modern Logistics Platform';
  }, []);

  return (
    <>
      {loading && (
        <LoadingScreen onComplete={() => setLoading(false)} />
      )}
      <div
        className={`homepage ${loading ? 'homepage--hidden' : 'homepage--visible'}`}
        id="homepage"
      >
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
    </>
  );
}
