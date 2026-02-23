import React from 'react';
import { motion } from 'framer-motion';
import { SectionProps } from '../lib/types';

const AboutSection: React.FC<SectionProps> = ({ scrollDirection }) => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      }
    }
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: scrollDirection === 'down' ? 20 : -20
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <section id="about" className="py-20 bg-light-primary">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          className="flex flex-col gap-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div
            className="text-center"
            variants={cardVariants}
          >
            <h2 className="text-3xl font-bold mb-2 text-light-text-primary">About Me</h2>
          </motion.div>

          <motion.div
            className="max-w-3xl mx-auto"
            variants={cardVariants}
          >
            <div className="prose prose-lg max-w-none text-light-text-secondary">
              <p>
                I build and deploy machine learning models. My work spans object detection and segmentation systems, document layout analysis, and fine-tuning large language models (LLMs) and vision-language models (VLMs) using parameter-efficient techniques like LoRA and QLoRA. I optimize models for production using TensorRT, OpenVINO, and quantization techniques.
              </p>
              <p>
              I also dedicate a significant amount of time to robotics, developing fully autonomous drones for indoor environments in competitions and research. My work involves VIO, vSLAM, tracking and depth cameras, PID controllers, and model optimization. I use tools such as ROS2, OpenCV, Mavros, RealSense, and Isaac ROS to develop real missions that integrate computer vision and robust control systems.
              </p>
              <p>
                I like sharing what I learn through open source projects and writing. The best AI is open.
              </p>
              <blockquote className="border-l-4 border-light-accent pl-4 italic my-6 text-light-text-secondary">
                "We are stardust brought to life, then empowered by the universe to figure itself out – and we have only just begun."
                <footer className="text-sm mt-2 text-light-text-secondary/70">— Neil deGrasse Tyson, Astrophysics for People in a Hurry</footer>
              </blockquote>
            </div>

            <div className="mt-8 flex space-x-6">
              <a
                href="mailto:samuellimabraz@gmail.com"
                className="text-light-text-secondary hover:text-light-text-primary transition-colors"
                aria-label="Email"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </a>
              <a
                href="https://github.com/samuellimabraz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-light-text-secondary hover:text-light-text-primary transition-colors"
                aria-label="GitHub"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              </a>
              <a
                href="https://br.linkedin.com/in/samuel-lima-braz/en"
                target="_blank"
                rel="noopener noreferrer"
                className="text-light-text-secondary hover:text-light-text-primary transition-colors"
                aria-label="LinkedIn"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
              <a
                href="https://huggingface.co/samuellimabraz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-light-text-secondary hover:text-light-text-primary transition-colors"
                aria-label="Hugging Face"
              >
                <img
                  src="https://huggingface.co/front/assets/huggingface_logo-noborder.svg"
                  alt="Hugging Face Logo"
                  width="24"
                  height="24"
                  className="inline-block"
                />
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;