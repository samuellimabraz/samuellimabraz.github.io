import React from 'react';
import { motion } from 'framer-motion';
import { SectionProps } from '../lib/types';

interface EducationItem {
  degree: string;
  institution: string;
  period: string;
  description: string;
}

const EducationSection: React.FC<SectionProps> = ({ scrollDirection }) => {
  const education: EducationItem[] = [
    {
      degree: "Bachelor's degree in Computer Engineering",
      institution: "Universidade Federal de Itajubá",
      period: "Mar 2022 — Dec 2025",
      description: "Pursuing Computer Engineering with focus on Artificial Intelligence, Machine Learning, and Computer Vision applications."
    },
    {
      degree: "Industrial Automation - Integrated Technical High School",
      institution: "Instituto Federal de Educação, Ciência e Tecnologia de Minas Gerais - IFMG",
      period: "Jan 2019 — Mar 2022",
      description: "Focused on industrial automation systems, robotics, and embedded systems programming."
    }
  ];

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
    <section id="education" className="py-20 bg-dark-secondary">
      <div className="container mx-auto px-4 md:px-6">
        <motion.h2
          className="text-3xl font-bold mb-12 text-center text-dark-text-primary"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          Education
        </motion.h2>

        <div className="max-w-3xl mx-auto grid gap-8">
          {education.map((item, index) => (
            <motion.div
              key={index}
              className="bg-dark-tertiary p-6 rounded-lg shadow-sm border border-dark-border transition-transform hover:translate-y-[-4px]"
              variants={cardVariants}
            >
              <div className="flex flex-col sm:flex-row justify-between mb-4">
                <h3 className="text-xl font-bold text-dark-text-primary">{item.degree}</h3>
                <span className="text-sm text-dark-text-secondary mt-1 sm:mt-0 font-mono">
                  {item.period}
                </span>
              </div>

              <p className="text-dark-text-secondary font-medium mb-4">{item.institution}</p>
              <p className="text-dark-text-secondary">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EducationSection;