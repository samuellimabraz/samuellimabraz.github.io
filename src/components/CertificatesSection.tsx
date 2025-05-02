import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { SectionProps } from '../lib/types';

interface Certificate {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description: string;
  credential?: string;
}

const CertificatesSection: React.FC<SectionProps> = ({ scrollDirection }) => {
  const certificates: Certificate[] = [
    {
      id: "generative-ai-llm",
      title: "Generative AI with Large Language Models",
      issuer: "Amazon Web Services",
      date: "Dec 2024",
      description: "Comprehensive course on generative AI technologies, focusing on the development and application of large language models.",
      credential: "https://coursera.org/share/84ec3e3b3ee61cc343feabb5ec8bf27f"
    },
    {
      id: "finetuning-transformers",
      title: "Finetuning Transformer Models Course",
      issuer: "Codeacademy",
      date: "Aug 2024",
      description: "Practical course on fine-tuning transformer-based language models for various NLP tasks and applications.",
      credential: "https://www.codecademy.com/profiles/core1125022600/certificates/c48eab73789f42f49e97464d5ffdeb06"
    },
    {
      id: "deep-learning-specialization",
      title: "Deep Learning Specialization",
      issuer: "DeepLearning.AI",
      date: "Aug 2023 — Nov 2023",
      description: "5-course specialization covering neural networks, hyperparameter tuning, convolutional networks, sequence models, and deep learning projects.",
      credential: "https://coursera.org/share/c41cc5a69d2f652411004575c01b7645"
    },
    {
      id: "ml-specialization",
      title: "Machine Learning Specialization",
      issuer: "DeepLearning.AI",
      date: "Jul 2023 — Sep 2023",
      description: "3-course specialization covering foundational machine learning algorithms, techniques, and best practices for implementing ML solutions.",
      credential: "https://coursera.org/share/c1412dd699127cb2b3627a73d493eb87"
    },
    {
      id: "opencv-bootcamp",
      title: "OpenCV Bootcamp",
      issuer: "OpenCV University",
      date: "Jun 2024",
      description: "OpenCV Fundamentals, Image & Video Manipulation, Image Enhancement, Filtering, Edge Detection, Object Detection and Tracking, Face Detection, and the OpenCV Deep Learning Module",
      credential: "https://courses.opencv.org/certificates/36b9a0bf22a543f4824d483951ca7761"
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
    <section id="certificates" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        <motion.h2
          className="text-3xl font-bold mb-6 text-center"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          Certificates & Courses
        </motion.h2>

        <motion.p
          className="text-center text-lg mb-10 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          viewport={{ once: true }}
        >
          Continuous education and specialized training in machine learning, deep learning, and AI technologies.
        </motion.p>

        <motion.div
          className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {certificates.map(certificate => (
            <motion.div
              key={certificate.id}
              className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              variants={cardVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold">{certificate.title}</h3>
                <span className="text-sm text-gray-500 font-mono">{certificate.date}</span>
              </div>

              <p className="text-gray-700 font-medium mb-2">{certificate.issuer}</p>
              <p className="text-gray-600 mb-4 text-sm">{certificate.description}</p>

              <div className="flex justify-end items-center">
                {certificate.credential && (
                  <a
                    href={certificate.credential}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-sm text-gray-700 hover:text-black transition-colors group"
                  >
                    <ExternalLink size={14} className="mr-1 group-hover:text-blue-600" />
                    <span className="group-hover:text-blue-600">Verify</span>
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default CertificatesSection;