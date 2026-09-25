import React from 'react';
import { motion } from 'framer-motion';
import CertificatesList from './CertificatesList';

interface EducationItem {
  degree: string;
  institution: string;
  period: string;
  description: string;
  logo?: string;
}

const EducationSection: React.FC = () => {
  const education: EducationItem[] = [
    {
      degree: "Bachelor's degree in Computer Engineering",
      institution: "Universidade Federal de Itajubá",
      period: "Mar 2022 to Dec 2025",
      description: "Completed Computer Engineering with coursework in artificial intelligence, machine learning, computer vision, robotics, and embedded systems. Graduation project: Quantum Assistant, published in Expert Systems with Applications.",
      logo: '/images/logos/unifei.png'
    },
    {
      degree: "Industrial Automation, Integrated Technical High School",
      institution: "Instituto Federal de Educação, Ciência e Tecnologia de Minas Gerais (IFMG)",
      period: "Jan 2019 to Feb 2022",
      description: "Industrial automation systems, robotics, and embedded systems programming.",
      logo: '/images/logos/ifmg.png'
    }
  ];

  return (
    <section id="education" className="py-20 bg-light-primary">
      <div className="container mx-auto px-4 md:px-6">
        <motion.h2
          className="text-3xl font-bold mb-12 text-center text-light-text-primary"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          Education & Certificates
        </motion.h2>

        <div className="max-w-6xl mx-auto grid gap-10 lg:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-light-text-secondary mb-4">Education</h3>
            <div className="grid gap-6">
              {education.map((item, index) => (
                <div
                  key={index}
                  className="bg-light-primary p-6 border border-light-border transition-all hover:border-light-text-secondary"
                >
                  <div className="flex flex-col md:flex-row gap-4">
                    {item.logo && (
                      <div className="flex-shrink-0">
                        <img
                          src={item.logo}
                          alt={`${item.institution} logo`}
                          className="w-16 h-16 object-contain"
                          width={64}
                          height={64}
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    )}

                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row justify-between gap-1 sm:gap-4 mb-4">
                        <h4 className="text-xl font-bold text-light-text-primary">{item.degree}</h4>
                        <span className="text-sm text-light-text-secondary sm:mt-1 font-mono sm:whitespace-nowrap">
                          {item.period}
                        </span>
                      </div>

                      <p className="text-light-text-secondary font-medium mb-4">{item.institution}</p>
                      <p className="text-light-text-secondary">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div id="certificates">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-light-text-secondary mb-4">Certificates & Courses</h3>
            <CertificatesList />
          </div>
        </div>
      </div>
    </section>
  );
};

export default EducationSection;
