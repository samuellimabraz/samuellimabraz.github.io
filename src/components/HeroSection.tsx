import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { SectionProps } from '../lib/types';

interface MosaicVideo {
  src: string;
  poster: string;
  /** Desktop grid-column, 6 tracks */
  column: string;
  /** Desktop grid-row, 6 tracks */
  row: string;
  mobileColumn: string;
  mobileRow: string;
}

const MOSAIC_VIDEOS: MosaicVideo[] = [
  // Large 16:9. The lines around it do not run the full height.
  { src: 'videos/imav26-gate.mp4?v=2', poster: 'videos/posters/imav26-gate.jpg?v=2', column: '1 / 4', row: '1 / 4', mobileColumn: '1 / 3', mobileRow: '1 / 2' },
  { src: 'videos/hook-segmentation.mp4', poster: 'videos/posters/hook-segmentation.jpg', column: '4 / 6', row: '1 / 3', mobileColumn: '1 / 3', mobileRow: '2 / 3' },
  { src: 'videos/pble0.mp4', poster: 'videos/posters/pble0.jpg', column: '6 / 7', row: '1 / 4', mobileColumn: '2 / 3', mobileRow: '3 / 5' },
  { src: 'videos/vslam-indoor.mp4', poster: 'videos/posters/vslam-indoor.jpg', column: '4 / 6', row: '3 / 5', mobileColumn: '1 / 2', mobileRow: '4 / 5' },
  { src: 'videos/cafedl-game.mp4', poster: 'videos/posters/cafedl-game.jpg', column: '1 / 3', row: '4 / 7', mobileColumn: '1 / 3', mobileRow: '5 / 6' },
  { src: 'videos/tennis-fomo.mp4', poster: 'videos/posters/tennis-fomo.jpg', column: '3 / 4', row: '4 / 7', mobileColumn: '1 / 2', mobileRow: '6 / 7' },
  { src: 'videos/escola-bebop-1.mp4', poster: 'videos/posters/escola-bebop-1.jpg', column: '4 / 6', row: '5 / 7', mobileColumn: '1 / 2', mobileRow: '3 / 4' },
  { src: 'videos/imav25-smoke.mp4', poster: 'videos/posters/imav25-smoke.jpg', column: '6 / 7', row: '4 / 7', mobileColumn: '2 / 3', mobileRow: '6 / 7' },
];

/** Data-saver and very slow links keep the poster and skip the eight clips. */
export const shouldSkipVideoDownload = (): boolean => {
  const connection = (navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string };
  }).connection;
  if (!connection) return false;
  if (connection.saveData) return true;
  return connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g';
};

const HeroSection: React.FC<SectionProps> = ({ scrollDirection: _scrollDirection }) => {
  const [isMobile, setIsMobile] = useState(false);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);

  // Posters paint first. Playback starts on the next frame unless the
  // connection is marked as data-saver or 2G.
  useEffect(() => {
    if (shouldSkipVideoDownload()) return;
    let innerFrame = 0;
    const outerFrame = window.requestAnimationFrame(() => {
      innerFrame = window.requestAnimationFrame(() => {
        videoRefs.current.forEach((video) => {
          if (!video) return;
          video.muted = true;
          video.play().catch(() => {});
        });
      });
    });
    return () => {
      window.cancelAnimationFrame(outerFrame);
      window.cancelAnimationFrame(innerFrame);
    };
  }, []);

  // Detect mobile breakpoint
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

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

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Video Mosaic Grid */}
      <div
        className="absolute inset-0 z-0"
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(6, 1fr)',
          gridTemplateRows: isMobile ? 'repeat(6, 1fr)' : 'repeat(6, 1fr)',
          gap: '2px',
        }}
      >
        {MOSAIC_VIDEOS.map((video, index) => (
          <div
            key={video.src}
            style={{
              gridColumn: isMobile ? video.mobileColumn : video.column,
              gridRow: isMobile ? video.mobileRow : video.row,
              overflow: 'hidden',
              position: 'relative',
              backgroundColor: '#111',
            }}
          >
            <video
              ref={(node) => {
                videoRefs.current[index] = node;
              }}
              src={video.src}
              poster={video.poster}
              muted
              loop
              playsInline
              preload="none"
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

      {/* Dark overlay for button contrast */}
      <div className="absolute inset-0 z-[1] bg-black/30" />

      {/* Text overlay */}
      <motion.div
        className="container mx-auto px-4 md:px-6 z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div className="max-w-3xl mx-auto text-center">
          <h1 className="sr-only">Samuel Lima Braz</h1>

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
              className="px-8 py-3 bg-black/50 text-white font-medium border border-gray-400 hover:bg-black/70 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              About Me
            </motion.a>
            <motion.a
              href="/Samuel-Lima-Braz-Resume.pdf"
              className="px-8 py-3 bg-black/50 text-white font-medium border border-gray-400 hover:bg-black/70 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Resume
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
