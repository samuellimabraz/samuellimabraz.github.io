import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Award, Github, ExternalLink, Boxes } from 'lucide-react';
import { Competition, SectionProps } from '../lib/types';
import { competitions } from '../data/competitions';
import { shouldSkipVideoDownload } from './HeroSection';

const CompetitionVideo: React.FC<{ competition: Competition }> = ({ competition }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [manual, setManual] = useState(false);

  // Plays only while on screen; data-saver and reduced-motion users get the poster and controls.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (shouldSkipVideoDownload() || reducedMotion) {
      setManual(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.muted = true;
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative aspect-video bg-black overflow-hidden">
      <img
        src={competition.poster}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover blur-xl opacity-40 scale-110"
        loading="lazy"
        decoding="async"
      />
      <video
        ref={videoRef}
        src={competition.video}
        poster={competition.poster}
        className="relative w-full h-full object-contain"
        muted
        loop
        playsInline
        preload="none"
        controls={manual}
        onClick={manual ? (e) => e.stopPropagation() : undefined}
        aria-label={`${competition.event} run`}
      />
      <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-light-primary/95 px-2.5 py-1 text-xs font-semibold text-light-text-primary border border-light-border">
        {competition.podium && <Trophy size={14} className="text-yellow-500" />}
        <span>{competition.result}</span>
      </div>
    </div>
  );
};

const competitionLinks = (competition: Competition) => [
  { label: 'Code', url: competition.codeUrl, icon: <Github size={12} /> },
  ...(competition.modelsUrl ? [{ label: 'Models', url: competition.modelsUrl, icon: <Boxes size={12} /> }] : []),
  { label: 'Event', url: competition.eventUrl, icon: <ExternalLink size={12} /> },
];

const CompetitionsSection: React.FC<SectionProps> = ({ scrollDirection }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.2 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: scrollDirection === 'down' ? 20 : -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const openProject = (projectId: string) => {
    window.location.hash = `projects/${projectId}`;
  };

  return (
    <section id="competitions" className="py-20 bg-light-primary">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          className="flex flex-col items-center text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2 className="text-3xl font-bold text-light-text-primary">Competitions & Awards</h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-6xl flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-px-4 -mx-4 px-4 pb-2 sm:mx-auto sm:px-0 sm:pb-0 sm:scroll-px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible"
        >
          {competitions.map((competition) => (
            <motion.article
              key={competition.id}
              variants={cardVariants}
              role="link"
              tabIndex={0}
              aria-label={`${competition.event}: code and details`}
              onClick={() => openProject(competition.projectId)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target === e.currentTarget) openProject(competition.projectId);
              }}
              className="shrink-0 w-[85%] snap-start sm:w-auto bg-light-secondary border border-light-border hover:border-light-text-secondary hover:shadow-md transition-all duration-300 flex flex-col cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-light-accent"
            >
              <CompetitionVideo competition={competition} />

              <div className="p-4 flex flex-col flex-1">
                <div className="text-xs font-mono text-light-text-secondary mb-1">
                  {competition.date} · {competition.location}
                </div>
                <h3 className="text-base font-bold text-light-text-primary leading-tight">
                  {competition.event}
                </h3>
                <p className="text-xs text-light-text-secondary mt-0.5">{competition.fullName}</p>
                {competition.extra && (
                  <p className="flex items-start gap-1.5 text-sm text-light-text-primary mt-2">
                    <Award size={16} className="text-yellow-500 shrink-0 mt-0.5" />
                    <span>{competition.extra}</span>
                  </p>
                )}
                <p className="text-sm text-light-text-secondary mt-2 flex-1">{competition.summary}</p>

                <div className="flex flex-wrap gap-1.5 pt-3 mt-3 border-t border-light-border">
                  {competitionLinks(competition).map((link) => (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 px-2 py-0.5 bg-light-primary text-light-accent text-xs border border-light-border hover:bg-light-tertiary transition-colors duration-200"
                    >
                      {link.icon}
                      <span>{link.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default CompetitionsSection;
