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
    {
      title: "Machine Learning Engineer Intern",
      organization: "Chunkr",
      period: "Jul 2025 to Jul 2026",
      type: 'work',
      logo: '/assets/chunkr_logo.jpeg',
      description: [
        "Built a synthetic document-layout generator from statistics of real pages (positions, co-occurrence, size). Element pool in SQLite with vectorized search and multiprocessing.",
        "Pretrained YOLO and RF-DETR on 500K+ synthetic samples mixed with real data, then fine-tuned. Stratified rare classes, multi-GPU training, TensorBoard.",
        "After training: per-class confidence filters, statistical anomaly checks, and box refinement from pixel density. Compared WBF, soft-NMS, and DIoU-NMS and kept a merge that corrected class confusions, raising F1 on every class.",
        "Fine-tuned LayoutLMv3-Large for reading order: 88.1% exact match and 98.2% Kendall's tau on the open benchmark (733 samples, 16 document categories). Served models on NVIDIA Triton; workers on Redis."
      ],
      skills: [],
      relatedProjects: [
        {
          id: "chunkr-layout",
          name: "Chunkr Layout 1",
          url: "#projects/chunkr-layout"
        },
        {
          id: "chunkr-bench",
          name: "Chunkr Layout Bench Dataset",
          url: "https://huggingface.co/datasets/ChunkrAI/chunkr-layout-bench-oss"
        },
        {
          id: "chunkr-reading-order",
          name: "Reading-order benchmark",
          url: "https://huggingface.co/datasets/ChunkrAI/chunkr-reading-order-bench-oss"
        }
      ]
    },
    {
      title: "ML Engineer",
      organization: "Tech4Humans",
      period: "Feb 2025 to Jul 2025",
      type: 'work',
      logo: '/assets/tech4humans_hyperautomation_logo.jpeg',
      description: [
        "Open-source signature detector on Hugging Face (50M+ downloads). Compared YOLO (v8 to v12), DETR, and YOLOS; chose YOLOv8s. Public code, weights, data, and report.",
        "Optuna search: +7.94 percentage points F1. Triton with ONNX/OpenVINO, under 200 ms on CPU.",
        "Fine-tuned open VLMs (12B or smaller) for fields on Brazilian documents with LoRA and QLoRA (Unsloth, MS-Swift), evaluated with vLLM, and served JSON extraction on GPU. Experiment tracking in Weights & Biases and MLflow."
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
      period: "Jul 2024 to Feb 2025",
      type: 'work',
      logo: '/assets/tech4humans_hyperautomation_logo.jpeg',
      description: [
        "Studied PEFT (LoRA, QLoRA, IA3) for language models under a small compute budget.",
        "On dialogue summarization, training less than 1% of parameters matched full fine-tuning closely enough to be useful.",
        "Wrote up the methods on the Hugging Face Community Blog and AI News Brazil."
      ],
      skills: [],
      relatedProjects: [
        {
          id: "peft-methods",
          name: "PEFT methods",
          url: "#projects/peft-methods"
        }
      ]
    },
    {
      title: "Robotics Engineer",
      organization: "Black Bee Drones, UNIFEI",
      period: "Apr 2023 to Present",
      type: 'extracurricular',
      logo: '/assets/black_bee_drones_logo.jpeg',
      description: [
        "Volunteer on a university autonomous drone team. Competed in IMAV, CBR, and SAE Eletroquad. 3rd place indoor at IMAV 2023 (stacking challenge) and IMAV 2025. Special Achievement Award at IMAV 2023 for highly automated MAV operation. 2nd place at SAE Eletroquad 2026.",
        "Lead developer of Nectar SDK, a ROS 2 kit that became the shared software for the team's missions. One flight interface for ArduPilot and PX4 (MAVROS, MAVLink, uXRCE-DDS), plus Bebop and Crazyflie; camera factory; detection, segmentation, and classification. Docker images for x86_64 and ARM64.",
        "Indoor navigation without GPS: VIO with Intel RealSense T265 on a Raspberry Pi, then vSLAM with Isaac ROS and RealSense D435i on a Jetson Orin Nano, feeding ArduPilot EKF3 and PX4 EKF2.",
        "PID position control in body, world, and takeoff frames; GPS waypoint navigation with EGM96 geoid correction; obstacle handling from a depth camera. Same missions in Gazebo SITL before flight.",
        "OpenCV on the vehicle: HSV/LAB color filters, line estimates, ArUco, and distance from detections. Trained YOLO, DETR, and RF-DETR for competition tasks, converted with TensorRT, OpenVINO, and ONNX."
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
          name: "PID Controller for ROS 2",
          url: "#projects/pid-controller"
        },
        {
          id: "vision-to-mavros",
          name: "Vision to MAVROS for ROS 2",
          url: "#projects/vision-to-mavros"
        }
      ]
    },
    {
      title: "Teaching Member",
      organization: "Fundação Asimo, UNIFEI",
      period: "Apr 2023 to Aug 2024",
      type: 'extracurricular',
      logo: '/images/logos/asimo.png',
      description: [
        "Taught programming and embedded systems (Arduino, C++, ESP32, Lego Mindstorms) to elementary and high school students in local public schools.",
        "Built a 4-servo arm with MediaPipe and OpenCV, used to teach computer vision.",
        "Mentored students preparing for the Brazilian Robotics Olympiad (OBR)."
      ],
      skills: [],
      relatedProjects: [
        {
          id: "roboarm",
          name: "RoboArm",
          url: "#projects/roboarm"
        },
        {
          id: "ev3-color-sensor",
          name: "EV3 Color Sensor",
          url: "#projects/ev3-color-sensor"
        }
      ]
    },
    {
      title: "Competitive Programming Student",
      organization: "UNIFEI",
      period: "Mar 2023 to Dec 2023",
      type: 'extracurricular',
      logo: '/images/logos/unifei.png',
      description: [
        "Participated in programming marathons.",
        "Implemented data structures and algorithms (DFS, BFS, Dijkstra, Bellman-Ford, balanced trees) in C++ under time constraints."
      ],
      skills: [],
      relatedProjects: [
        {
          id: "kruskal-mst",
          name: "Kruskal MST",
          url: "#projects/kruskal-mst"
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
                      width={40}
                      height={40}
                      loading="lazy"
                      decoding="async"
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
