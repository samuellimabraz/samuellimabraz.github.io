import { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import NNPlaygroundSection from './components/NNPlaygroundSection';
import AboutSection from './components/AboutSection';
import WorkSection from './components/WorkSection';
import EducationSection from './components/EducationSection';
import ExtraCurricularSection from './components/ExtraCurricularSection';
import ProjectsCarousel from './components/ProjectsCarousel';
import CertificatesSection from './components/CertificatesSection';
import Footer from './components/Footer';

import { projects } from './data/projects';

export const navigateToSection = (id: string): void => {
  const element = document.getElementById(id);
  if (element) {
    window.scrollTo({
      top: element.offsetTop - 70,
      behavior: 'smooth'
    });

    // Update URL without causing a page reload (simpler than using router)
    window.history.pushState(null, '', `#${id}`);
  }
};

function MainLayout() {
  const [activeSection, setActiveSection] = useState('home');
  const [isMounted, setIsMounted] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');
  const [lastScrollY, setLastScrollY] = useState(0);
  const location = useLocation();

  // Map hash fragments to section IDs (in case they differ)
  const hashToSectionMap: Record<string, string> = {
    'home': 'home',
    'about': 'about',
    'nn': 'nn-playground', 
    'nn-playground': 'nn-playground',
    'projects': 'projects',
    'work': 'work',
    'extracurricular': 'extracurricular',
    'education': 'education',
    'certificates': 'certificates'
  };

  useEffect(() => {
    setIsMounted(true);

    let hash = location.hash.replace('#', '');

    if (hash.startsWith('#')) {
      hash = hash.replace('#', '');
    }

    if (hash) {
      const sectionId = hashToSectionMap[hash] || hash;
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          window.scrollTo({
            top: element.offsetTop - 70,
            behavior: 'smooth'
          });
          setActiveSection(sectionId);
        } else {
          console.warn(`Section with ID "${sectionId}" not found`);
        }
      }, 100);
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const sections = document.querySelectorAll('section');
      const scrollPosition = currentScrollY + 100;

      if (currentScrollY > lastScrollY) {
        setScrollDirection('down');
      } else if (currentScrollY < lastScrollY) {
        setScrollDirection('up');
      }
      setLastScrollY(currentScrollY);

      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          setActiveSection(section.id);
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, location.hash]);

  return (
    <div className={`min-h-screen bg-dark-primary text-dark-text-primary ${isMounted ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}>
      <Navbar activeSection={activeSection} />

      <main className="pt-16 overflow-hidden">
        <AnimatePresence mode="wait">
          <HeroSection key="hero" scrollDirection={scrollDirection} />
          <AboutSection key="about" scrollDirection={scrollDirection} />
          <NNPlaygroundSection key="nn" scrollDirection={scrollDirection} />
          <ProjectsCarousel key="projects" projects={projects} scrollDirection={scrollDirection} />
          <WorkSection key="work" scrollDirection={scrollDirection} />
          <ExtraCurricularSection key="extra" scrollDirection={scrollDirection} />
          <EducationSection key="education" scrollDirection={scrollDirection} />
          <CertificatesSection key="certificates" scrollDirection={scrollDirection} />
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />} />
        <Route path="*" element={<MainLayout />} />
      </Routes>
    </Router>
  );
}

export default App;