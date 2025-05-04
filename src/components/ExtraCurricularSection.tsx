import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { SectionProps } from '../lib/types';

interface RelatedProject {
    id: string;
    name: string;
    url: string;
}

interface ExtraCurricularItem {
    title: string;
    organization: string;
    period: string;
    description: string[];
    skills?: string[];
    relatedProjects?: RelatedProject[];
}

const ExtraCurricularSection: React.FC<SectionProps> = ({ scrollDirection }) => {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    const toggleExpand = (index: number) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    const activities: ExtraCurricularItem[] = [
        {
            title: "Software Engineer",
            organization: "Black Bee Drones - UNIFEI",
            period: "Apr 2023 — Present",
            description: [
                "Developed autonomous drone software for the IMAV competition using Python and C++, contributing to a 3rd place win with fully autonomous flight capabilities.",
                "Specialized in indoor autonomous navigation within GPS-denied environments using the ROS framework, implementing SLAM algorithms with sensors like Intel RealSense T265 and PX4 Flow.",
                "Implemented computer vision algorithms using OpenCV for tasks such as line following, ArUco marker detection, and object position estimation.",
                "Developed and deployed lightweight object detection models optimized for real-time execution on resource-constrained drone hardware.",
                "Engineered navigation logic integrating sensor/vision-based data for indoor flight and GPS data for outdoor scenarios."
            ],
            skills: ["ROS", "SLAM", "Computer Vision", "OpenCV", "Autonomous Navigation", "C++", "Python"],
            relatedProjects: [
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
            title: "Competitive Programming Student",
            organization: "UNIFEI",
            period: "Mar 2023 — Jan 2024",
            description: [
                "Participated in programming competitions and marathons.",
                "Implemented advanced data structures and algorithms (DFS, BFS, Dijkstra, Bellman-Ford, balanced trees) in C++ under time constraints.",
                "Developed problem-solving skills and algorithmic thinking through competitive challenges."
            ],
            skills: ["Algorithms", "Data Structures", "C++", "Problem Solving"],
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
        <section id="extracurricular" className="py-20 bg-dark-primary">
            <div className="container mx-auto px-4 md:px-6">
                <motion.div
                    className="flex items-center justify-center mb-12"
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true, margin: "-100px" }}
                >
                    <h2 className="text-3xl font-bold text-dark-text-primary">Extracurricular Activities</h2>
                </motion.div>

                <div className="max-w-4xl mx-auto">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        className="space-y-8"
                    >
                        {activities.map((activity, index) => (
                            <motion.div
                                key={index}
                                variants={cardVariants}
                                className="group"
                            >
                                <motion.div
                                    className="bg-dark-tertiary p-6 rounded-lg shadow-md border border-dark-border hover:shadow-lg hover:shadow-black/10 transition-all duration-300"
                                    whileHover={{ scale: 1.01 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {/* Date badge */}
                                    <div className="inline-block px-3 py-1 mb-4 bg-dark-secondary rounded-full text-xs font-mono text-dark-text-secondary">
                                        {activity.period}
                                    </div>

                                    <div className="flex flex-col mb-4">
                                        <h3 className="text-xl font-bold text-dark-text-primary">{activity.title}</h3>
                                        <p className="text-dark-text-secondary font-medium mt-1">{activity.organization}</p>
                                    </div>

                                    <div className="mb-4 text-dark-text-secondary">
                                        {expandedIndex === index ? (
                                            <AnimatePresence>
                                                <motion.ul
                                                    className="space-y-3 list-disc pl-5"
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    {activity.description.map((item, idx) => (
                                                        <motion.li
                                                            key={idx}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: idx * 0.1 }}
                                                        >
                                                            {item}
                                                        </motion.li>
                                                    ))}
                                                </motion.ul>
                                            </AnimatePresence>
                                        ) : (
                                            <p className="line-clamp-2">{activity.description[0]}...</p>
                                        )}
                                    </div>

                                    <div className="flex justify-between items-center mb-4">
                                        <button
                                            onClick={() => toggleExpand(index)}
                                            className="text-sm text-dark-accent hover:text-dark-accent/80 flex items-center transition-colors"
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
                                    </div>

                                    {activity.skills && (
                                        <div className="flex flex-wrap gap-2 mt-4 mb-4">
                                            {activity.skills.map(skill => (
                                                <span
                                                    key={skill}
                                                    className="px-2 py-1 bg-dark-primary text-dark-text-secondary text-xs rounded-md hover:bg-dark-secondary hover:text-dark-text-primary transition-colors duration-200"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {activity.relatedProjects && activity.relatedProjects.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-dark-border">
                                            <h4 className="text-sm font-semibold mb-2 text-dark-text-secondary">Related Projects</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {activity.relatedProjects.map((project, idx) => (
                                                    <a
                                                        key={idx}
                                                        href={project.url}
                                                        className="group flex items-center px-3 py-1 bg-dark-secondary text-dark-accent text-sm rounded-full hover:bg-dark-accent/10 transition-colors duration-200"
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

export default ExtraCurricularSection; 