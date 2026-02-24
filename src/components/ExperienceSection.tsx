import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { SectionProps } from '../lib/types';

interface RelatedProject {
  id: string;
  name: string;
  url: string;
}

interface ExperienceItem {
  title: string;
  organization: string;
  period: string;
  description: string[];
  skills: string[];
  relatedProjects?: RelatedProject[];
  logo?: string;
  type: 'work' | 'extracurricular';
}

const ExperienceSection: React.FC<SectionProps> = ({ scrollDirection }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const experiences: ExperienceItem[] = [
    // Work Experience
    {
      title: "Machine Learning Engineer — Summer Intern",
      organization: "Chunkr",
      period: "Jul 2025 — Present",
      type: 'work',
      logo: '/assets/chunkr_logo.jpeg',
      description: [
        "Developing state-of-the-art Document Layout Analysis (DLA) solutions for intelligent document processing.",
        "Created synthetic document datasets and benchmarks for training and evaluating layout detection models.",
        "Developed Chunkr Layout 1, a document layout detection model with multi-GPU training, fine-tuning, and scaling strategies.",
        "Implemented human reading order prediction algorithms and post-processing detection strategies.",
        "Deployed models using NVIDIA Triton Inference Server for production-grade inference.",
        "Conducted research on document understanding, studying articles and implementing novel algorithms for synthetic data generation."
      ],
      skills: [],
      relatedProjects: [
        {
          id: "chunkr-layout",
          name: "Chunkr Layout 1 — SOTA Document Layout Analysis",
          url: "https://chunkr.ai/blog/introducing-chunkr-layout-1-state-of-the-art-document-layout-analysis"
        },
        {
          id: "chunkr-bench",
          name: "Chunkr Layout Bench Dataset",
          url: "https://huggingface.co/datasets/ChunkrAI/chunkr-layout-bench-oss"
        }
      ]
    },
    {
      title: "ML Engineer",
      organization: "Tech4Humans",
      period: "Feb 2025 — Jul 2025",
      type: 'work',
      logo: '/assets/tech4humans_hyperautomation_logo.jpeg',
      description: [
        "Engineered an open-source signature detection model using hybrid datasets and advanced augmentations.",
        "Benchmarked YOLO (v8–v12), DETR, and YOLOS models, selecting YOLOv8s for optimal accuracy/inference speed trade-off.",
        "Deployed on Azure Container Apps via NVIDIA Triton Inference Server with ONNX/OpenVINO backend, achieving <200 ms CPU latency.",
        "Fine-tuned Vision-Language Models (VLMs) for structured data extraction from Brazilian documents using PEFT techniques.",
        "Built AI inference gateways and model-monitoring pipelines with LiteLLM and LangFuse."
      ],
      skills: [],
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
      organization: "Tech4Humans",
      period: "Jul 2024 — Feb 2025",
      type: 'work',
      logo: '/assets/tech4humans_hyperautomation_logo.jpeg',
      description: [
        "Conducted R&D focused on Fine Tuning Small Generative Models methods for optimizing large language models.",
        "Explored and applied PEFT techniques including LoRA, QLoRA, and IA3, demonstrating their effectiveness in reducing computational requirements.",
        "Achieved performance comparable to full fine-tuning by training less than 1% of model parameters on tasks like dialogue summarization.",
        "Authored technical blog posts on PEFT methodologies and practical applications, published on Hugging Face Community Blog and AI News Brazil."
      ],
      skills: [],
      relatedProjects: [
        {
          id: "peft-methods",
          name: "PEFT: Parameter-Efficient Fine-Tuning Methods for LLMs",
          url: "#projects/peft-methods"
        }
      ]
    },
    // Extracurricular Activities
    {
      title: "Software Engineer",
      organization: "Black Bee Drones - UNIFEI",
      period: "Apr 2023 — Present",
      type: 'extracurricular',
      logo: '/assets/black_bee_drones_logo.jpeg',
      description: [
        "Compete in national (CBR, SAE Electroquad) and international (IMAV) autonomous drone competitions, winning 3rd place indoor at IMAV 2023 and 2025 and the best autonomous indoor flight award in 2023.",
        "Lead developer of Nectar SDK, the team's open-source ROS 2 framework for flight control, computer vision, and AI detection that became the shared foundation for all competition missions.",
        "Built indoor autonomous navigation for GPS-denied environments using VIO with Intel RealSense T265, vSLAM with Isaac ROS and RealSense D435i, and Jetson Orin Nano for onboard compute.",
        "Implemented PID controllers and computer vision algorithms (line following, ArUco detection, object position estimation with OpenCV) for competition tasks: gate passage, mobile landing, figure identification, package delivery, and precise rope delivery.",
        "Optimized object detection models for edge deployment using TensorRT, OpenVINO, ONNX conversion, pruning, and quantization, with post-processing strategies for real-time accuracy.",
      ],
      skills: [],
      relatedProjects: [
        {
          id: "nectar-sdk",
          name: "Nectar SDK",
          url: "#projects/nectar-sdk"
        },
        {
          id: "pid-controller",
          name: "PID Controller for ROS2",
          url: "#projects/pid-controller"
        },
        {
          id: "vision-to-mavros",
          name: "Vision to MAVROS for ROS2",
          url: "#projects/vision-to-mavros"
        }
      ]
    },
    {
      title: "Teaching Instructor & Project Member",
      organization: "Fundação Asimo - UNIFEI Extension Project",
      period: "Apr 2023 — Jul 2024",
      type: 'extracurricular',
      logo: '/assets/asimo.png',
      description: [
        "Contributed to an educational equity project aimed at reducing disparities between public and private education by bringing STEAM learning to local public schools.",
        "Served as an instructor for elementary and high school classes, teaching computer literacy, programming fundamentals, and embedded systems using Arduino and C++.",
        "Developed hands-on projects with ESP32, Lego Mindstorms, and Arduino to promote practical learning experiences in technology and engineering.",
        "Created a 4-servo robotic arm controlled through computer vision that tracked hand movements, implementing advanced CV techniques for gesture recognition.",
        "Mentored students preparing for the Brazilian Robotics Olympiad (OBR), providing guidance on both theoretical knowledge and practical implementation."
      ],
      skills: []
    },
    {
      title: "Competitive Programming Student",
      organization: "UNIFEI",
      period: "Mar 2023 — Jan 2024",
      type: 'extracurricular',
      logo: '/assets/unifei-logo.png',
      description: [
        "Participated in programming competitions and marathons.",
        "Implemented advanced data structures and algorithms (DFS, BFS, Dijkstra, Bellman-Ford, balanced trees) in C++ under time constraints.",
        "Developed problem-solving skills and algorithmic thinking through competitive challenges."
      ],
      skills: [],
      relatedProjects: [
        {
          id: "sorting-algorithms",
          name: "Sorting Algorithms",
          url: "#projects/sorting-algorithms"
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
    <section id="experience" className="py-20 bg-light-secondary">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          className="flex items-center justify-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2 className="text-3xl font-bold text-light-text-primary">Experience</h2>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start"
          >
            {experiences.map((experience, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                className="bg-light-primary border border-light-border p-5 hover:border-light-text-secondary transition-all duration-300 flex flex-col"
              >
                {/* Period */}
                <div className="text-xs font-mono text-light-text-secondary mb-2">
                  {experience.period}
                </div>

                {/* Logo and organization */}
                <div className="flex items-center gap-3 mb-2">
                  {experience.logo && (
                    <img
                      src={experience.logo}
                      alt={`${experience.organization} logo`}
                      className="w-10 h-10 object-contain"
                    />
                  )}
                  <div>
                    <h3 className="text-base font-bold text-light-text-primary leading-tight">{experience.title}</h3>
                    <p className="text-light-text-secondary text-sm mt-0.5">
                      {experience.organization}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-3 text-light-text-secondary flex-1">
                  {expandedIndex === index ? (
                    <AnimatePresence>
                      <motion.ul
                        className="space-y-1.5 list-disc pl-5"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {experience.description.map((item, idx) => (
                          <motion.li
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="text-sm"
                          >
                            {item}
                          </motion.li>
                        ))}
                      </motion.ul>
                    </AnimatePresence>
                  ) : (
                    <p className="line-clamp-2 text-sm">{experience.description[0]}</p>
                  )}
                </div>

                {/* Expand/Collapse button */}
                <button
                  onClick={() => toggleExpand(index)}
                  className="text-sm text-light-accent hover:text-light-text-accent flex items-center transition-colors mb-3"
                  aria-expanded={expandedIndex === index}
                  aria-label={expandedIndex === index ? "Show less" : "Show more"}
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

                {/* Related Projects */}
                {experience.relatedProjects && experience.relatedProjects.length > 0 && (
                  <div className="pt-3 border-t border-light-border">
                    <h4 className="text-xs font-semibold mb-1.5 text-light-text-secondary">Related Projects</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {experience.relatedProjects.map((project, idx) => {
                        const isInternalProject = project.url.startsWith('#projects/');

                        return (
                          <a
                            key={idx}
                            href={project.url}
                            className="group flex items-center px-2 py-0.5 bg-light-secondary text-light-accent text-xs border border-light-border hover:bg-light-tertiary transition-colors duration-200"
                            onClick={(e) => {
                              if (isInternalProject) {
                                e.preventDefault();
                                window.location.hash = project.url.replace('#', '');
                              }
                            }}
                          >
                            <span>{project.name}</span>
                            <ExternalLink size={12} className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
