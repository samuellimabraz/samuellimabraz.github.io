import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { SectionProps } from '../lib/types';

interface RelatedProject {
  id: string;
  name: string;
  url: string;
}

interface WorkExperience {
  title: string;
  company: string;
  period: string;
  description: string[];
  skills: string[];
  relatedProjects?: RelatedProject[];
}

const WorkSection: React.FC<SectionProps> = ({ scrollDirection }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const experiences: WorkExperience[] = [
    {
      title: "ML Engineer",
      company: "Tech4Humans",
      period: "Aug 2024 — Present",
      description: [
        "Engineered an open-source signature detection model using hybrid datasets and advanced augmentations.",
        "Benchmarked YOLO (v8–v12), DETR, and YOLOS models, selecting YOLOv8s for optimal accuracy/inference speed trade-off.",
        "Deployed on Azure Container Apps via NVIDIA Triton Inference Server with ONNX/OpenVINO backend, achieving <200 ms CPU latency.",
        "Fine-tuned Vision-Language Models (VLMs) for structured data extraction from Brazilian documents using PEFT techniques.",
        "Built AI inference gateways and model-monitoring pipelines with LiteLLM and LangFuse."
      ],
      skills: ["Computer Vision", "Model Deployment", "PEFT", "Azure", "ONNX"],
      relatedProjects: [
        {
          id: "signature-detection",
          name: "Signature Detection Model",
          url: "#projects/signature-detection"
        }
      ]
    },
    {
      title: "AI Developer Intern",
      company: "Tech4Humans",
      period: "Jul 2024 — Feb 2025",
      description: [
        "Conducted R&D focused on Fine Tuning Small Generative Models methods for optimizing large language models.",
        "Explored and applied PEFT techniques including LoRA, QLoRA, and IA3, demonstrating their effectiveness in reducing computational requirements.",
        "Achieved performance comparable to full fine-tuning by training less than 1% of model parameters on tasks like dialogue summarization.",
        "Authored technical blog posts on PEFT methodologies and practical applications, published on Hugging Face Community Blog and AI News Brazil."
      ],
      skills: ["PEFT", "LoRA", "QLoRA", "LLMs", "Technical Writing"],
      relatedProjects: [
        {
          id: "peft-methods",
          name: "PEFT: Parameter-Efficient Fine-Tuning Methods for LLMs",
          url: "#projects/peft-methods"
        }
      ]
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
    <section id="work" className="py-20 bg-dark-secondary">
      <div className="container mx-auto px-4 md:px-6">
        <motion.h2
          className="text-3xl font-bold mb-12 text-center text-dark-text-primary"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          Work Experience
        </motion.h2>

        <div className="max-w-3xl mx-auto">
          <motion.div
            className="relative border-l border-dark-border pl-8 ml-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {experiences.map((experience, index) => (
              <motion.div
                key={index}
                className="mb-12 relative"
                variants={cardVariants}
              >
                <div className="absolute -left-12 mt-1.5 h-6 w-6 rounded-full border-4 border-dark-secondary bg-dark-accent"></div>

                <motion.div
                  className="bg-dark-tertiary p-6 rounded-lg shadow-sm border border-dark-border hover:shadow-md hover:shadow-black/10 transition-shadow"
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
                    <h3 className="text-xl font-bold text-dark-text-primary">{experience.title}</h3>
                    <span className="text-sm text-dark-text-secondary mt-1 sm:mt-0 font-mono">
                      {experience.period}
                    </span>
                  </div>

                  <p className="text-dark-text-secondary font-medium mb-3">{experience.company}</p>

                  <div className="mb-4 space-y-2 text-dark-text-secondary">
                    {expandedIndex === index ? (
                      <AnimatePresence>
                        <motion.ul
                          className="space-y-2"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {experience.description.map((item, idx) => (
                            <motion.li
                              key={idx}
                              className="flex"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.1 }}
                            >
                              <span className="mr-2">•</span>
                              <span>{item}</span>
                            </motion.li>
                          ))}
                        </motion.ul>
                      </AnimatePresence>
                    ) : (
                      <div className="flex">
                        <span className="mr-2">•</span>
                        <span>{experience.description[0]}...</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center mb-4">
                    <button
                      onClick={() => toggleExpand(index)}
                      className="text-sm text-dark-accent hover:text-dark-text-accent flex items-center"
                    >
                      {expandedIndex === index ? (
                        <>
                          <span>Show less</span>
                          <ChevronUp size={16} className="ml-1" />
                        </>
                      ) : (
                        <>
                          <span>Show more</span>
                          <ChevronDown size={16} className="ml-1" />
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4 mb-4">
                    {experience.skills.map(skill => (
                      <span
                        key={skill}
                        className="px-2 py-1 bg-dark-secondary text-dark-text-secondary text-xs rounded hover:bg-dark-primary hover:text-dark-text-primary transition-colors"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {experience.relatedProjects && experience.relatedProjects.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-dark-border">
                      <h4 className="text-sm font-semibold mb-2 text-dark-text-secondary">Related Projects</h4>
                      <div className="flex flex-wrap gap-2">
                        {experience.relatedProjects.map((project, idx) => (
                          <a
                            key={idx}
                            href={project.url}
                            className="group flex items-center px-3 py-1 bg-dark-primary text-dark-accent text-sm rounded-full hover:bg-dark-accent/10 transition-colors"
                          >
                            <span>{project.name}</span>
                            <ExternalLink size={14} className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WorkSection;