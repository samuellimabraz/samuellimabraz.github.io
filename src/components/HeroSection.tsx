import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { SectionProps } from '../lib/types';

interface MosaicVideo {
  src: string;
  /** CSS grid-column span */
  colSpan: string;
  /** CSS grid-row span */
  rowSpan: string;
  /** Mobile: CSS grid-column span */
  mobileColSpan: string;
  /** Mobile: CSS grid-row span */
  mobileRowSpan: string;
}

const MOSAIC_VIDEOS: MosaicVideo[] = [
  // Row 1
  { src: 'videos/drone_line_following_video.mp4', colSpan: 'span 3', rowSpan: 'span 1', mobileColSpan: 'span 2', mobileRowSpan: 'span 1' },
  { src: 'videos/cafedl-game.mp4', colSpan: 'span 2', rowSpan: 'span 1', mobileColSpan: 'span 1', mobileRowSpan: 'span 1' },
  { src: 'videos/cbr-test.mp4', colSpan: 'span 1', rowSpan: 'span 2', mobileColSpan: 'span 1', mobileRowSpan: 'span 2' },
  // Row 2
  { src: 'videos/escola-bebop-1.mp4', colSpan: 'span 2', rowSpan: 'span 1', mobileColSpan: 'span 1', mobileRowSpan: 'span 1' },
  { src: 'videos/indoor-test-23-t265.mp4', colSpan: 'span 2', rowSpan: 'span 1', mobileColSpan: 'span 1', mobileRowSpan: 'span 1' },
  { src: 'videos/isaac-ros.mp4', colSpan: 'span 1', rowSpan: 'span 1', mobileColSpan: 'span 2', mobileRowSpan: 'span 1' },
  // Row 3
  { src: 'videos/black-bee-ui.mp4', colSpan: 'span 3', rowSpan: 'span 1', mobileColSpan: 'span 1', mobileRowSpan: 'span 1' },
  { src: 'videos/signature.mp4', colSpan: 'span 3', rowSpan: 'span 1', mobileColSpan: 'span 1', mobileRowSpan: 'span 1' },
];

const HeroSection: React.FC<SectionProps> = ({ scrollDirection: _scrollDirection }) => {
  const [typedText, setTypedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [textIndex, setTextIndex] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);
  const [isMobile, setIsMobile] = useState(false);

  const expertiseAreas = [
    "Machine Learning Engineer",
    "Computer Vision",
    "Autonomous Drone",
    "Fine Tuning",
    "PyTorch & Transformers",
    "PEFT Techniques",
    "AI Deployment",
    "Neural Networks",
    "Model Optimization"
  ];

  // Detect mobile breakpoint
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Typing animation effect
  useEffect(() => {
    const currentText = expertiseAreas[textIndex];

    const typingEffect = () => {
      if (isDeleting) {
        setTypedText(currentText.substring(0, typedText.length - 1));
        setTypingSpeed(20);
      } else {
        setTypedText(currentText.substring(0, typedText.length + 1));
        setTypingSpeed(80);
      }

      if (!isDeleting && typedText === currentText) {
        setTimeout(() => setIsDeleting(true), 1500);
      }

      if (isDeleting && typedText === '') {
        setIsDeleting(false);
        setTextIndex((prev) => (prev + 1) % expertiseAreas.length);
      }
    };

    const timer = setTimeout(typingEffect, typingSpeed);
    return () => clearTimeout(timer);
  }, [typedText, isDeleting, textIndex, typingSpeed, expertiseAreas]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const cursorVariants = {
    blinking: {
      opacity: [0, 1, 0],
      transition: {
        duration: 1,
        repeat: Infinity,
        repeatType: "loop" as const,
        ease: "linear",
      },
    },
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Video Mosaic Grid */}
      <div
        className="absolute inset-0 z-0"
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(6, 1fr)',
          gridTemplateRows: isMobile ? 'repeat(5, 1fr)' : 'repeat(3, 1fr)',
          gap: '2px',
        }}
      >
        {MOSAIC_VIDEOS.map((video) => (
          <div
            key={video.src}
            style={{
              gridColumn: isMobile ? video.mobileColSpan : video.colSpan,
              gridRow: isMobile ? video.mobileRowSpan : video.rowSpan,
              overflow: 'hidden',
              position: 'relative',
              backgroundColor: '#111',
            }}
          >
            <video
              src={video.src}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </div>
        ))}
      </div>

      {/* Dark overlay for text contrast */}
      <div className="absolute inset-0 z-[1] bg-black/55" />

      {/* Text overlay */}
      <motion.div
        className="container mx-auto px-4 md:px-6 z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div className="max-w-3xl mx-auto text-center">
          <motion.h1
            className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-white"
            variants={itemVariants}
          >
            <motion.div className="flex flex-col md:flex-row md:justify-center items-center">
              <motion.span className="md:mr-3" variants={itemVariants}>
                Samuel Lima
              </motion.span>
              <motion.span
                className="font-mono text-3xl md:text-5xl opacity-80 text-gray-300"
                variants={itemVariants}
              >
                Braz
              </motion.span>
            </motion.div>
          </motion.h1>

          <motion.div
            className="text-lg md:text-xl mb-8 font-light leading-relaxed h-8 flex justify-center items-center"
            variants={itemVariants}
          >
            <span className="font-medium text-blue-400">{typedText}</span>
            <motion.span
              className="w-1 h-6 ml-1 inline-block bg-blue-400"
              variants={cursorVariants}
              animate="blinking"
            />
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-4"
            variants={itemVariants}
          >
            <motion.a
              href="#projects"
              className="px-8 py-3 bg-blue-600 text-white font-medium border border-blue-600 hover:bg-blue-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View Projects
            </motion.a>
            <motion.a
              href="#about"
              className="px-8 py-3 bg-transparent text-white font-medium border border-gray-400 hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              About Me
            </motion.a>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-0 right-0 flex justify-center text-gray-300"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </motion.div>
    </section>
  );
};

export default HeroSection;
