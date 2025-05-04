import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, X, Award, Maximize2 } from 'lucide-react';
import { SectionProps } from '../lib/types';

interface Certificate {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description: string;
  credential?: string;
  image: string;
  details?: string[];
}

// Helper function to convert markdown-style bold formatting to JSX
const parseMarkdownBold = (text: string) => {
  // Split by ** markers
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    // Check if this part is wrapped in ** markers
    if (part.startsWith('**') && part.endsWith('**')) {
      // Remove the markers and wrap in <strong>
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

const CertificatesSection: React.FC<SectionProps> = ({ scrollDirection }) => {
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  const certificates: Certificate[] = [
    {
      id: "deep-learning-specialization",
      title: "Deep Learning Specialization",
      issuer: "DeepLearning.AI",
      date: "Aug 2023 — Nov 2023",
      description: "Comprehensive 5-course specialization by Andrew Ng covering the complete deep learning pipeline from neural network fundamentals to advanced architectures and deployment strategies.",
      details: [
        "**Course 1 - Neural Networks and Deep Learning:** Built foundational understanding of deep learning, implemented core neural network components (forward/backward propagation, vectorization), and constructed shallow and deep networks.",
        "**Course 2 - Improving Deep Neural Networks:** Mastered practical aspects like hyperparameter tuning, regularization (L2, dropout), optimization algorithms (Adam, RMSprop, Momentum), batch normalization, and introductory TensorFlow implementation.",
        "**Course 3 - Structuring Machine Learning Projects:** Learned strategic approaches for building ML projects, including error analysis, bias/variance diagnosis, handling data mismatches, and understanding transfer/multi-task learning concepts.",
        "**Course 4 - Convolutional Neural Networks:** Implemented CNNs, explored architectures (ResNets, MobileNet), applied them to image classification, object detection (YOLO), image segmentation (U-Net), face recognition, and neural style transfer.",
        "**Course 5 - Sequence Models:** Built and trained RNNs, LSTMs, GRUs, and Transformers for NLP tasks. Explored word embeddings, attention mechanisms, speech recognition, and fine-tuned transformer models for specific applications like NER and QA."
      ],
      credential: "https://coursera.org/share/c41cc5a69d2f652411004575c01b7645",
      image: "/certificates/dl-specialization.jpg"
    },
    {
      id: "ml-specialization",
      title: "Machine Learning Specialization",
      issuer: "DeepLearning.AI",
      date: "Jul 2023 — Sep 2023",
      description: "Comprehensive 3-course specialization by Andrew Ng providing a solid foundation in machine learning concepts, algorithms, and practical applications with Python implementation.",
      details: [
        "**Course 1 - Supervised Machine Learning:** Covered foundational supervised algorithms like linear and logistic regression, gradient descent, feature engineering, regularization, and practical implementation using Python (NumPy, Scikit-Learn).",
        "**Course 2 - Advanced Learning Algorithms:** Explored neural networks (TensorFlow/NumPy implementation, activation functions, multiclass classification), decision trees, and ensemble methods (Random Forests, XGBoost), alongside ML development best practices.",
        "**Course 3 - Unsupervised Learning, Recommenders, Reinforcement Learning:** Implemented K-Means clustering, anomaly detection, built recommender systems (collaborative & content-based), explored PCA, and introduced reinforcement learning concepts (Q-learning, DQN)."
      ],
      credential: "https://coursera.org/share/c1412dd699127cb2b3627a73d493eb87",
      image: "/certificates/ml-specialization.jpg"
    },
    {
      id: "generative-ai-llm",
      title: "Generative AI with Large Language Models",
      issuer: "Amazon Web Services",
      date: "Dec 2024",
      description: "Comprehensive, hands-on course covering the fundamentals and advanced aspects of generative AI, including transformer architectures, fine-tuning techniques, and responsible AI deployment.",
      details: [
        "Week 1: Explored generative AI use cases, transformer architecture, prompt engineering, and LLM pre-training fundamentals. Completed a hands-on lab on dialogue summarization.",
        "Week 2: Mastered instruction fine-tuning, model evaluation techniques, and parameter-efficient fine-tuning methods (PEFT) including LoRA and soft prompts.",
        "Week 3: Deep-dive into reinforcement learning from human feedback (RLHF), model deployment strategies, and advanced architectures including chain-of-thought, program-aided language models (PAL), and ReAct frameworks."
      ],
      credential: "https://coursera.org/share/84ec3e3b3ee61cc343feabb5ec8bf27f",
      image: "/certificates/generativeai-llm-.jpg"
    },
    {
      id: "finetuning-transformers",
      title: "Finetuning Transformer Models Course",
      issuer: "Codeacademy",
      date: "Aug 2024",
      description: "Mastered the art of LLM fine-tuning using Hugging Face libraries, focusing on efficient adaptation of pre-trained models like LoRA and QLoRA for specialized tasks.",
      details: [
        "Explored the fundamentals of transfer learning and the transformer architecture in the context of fine-tuning.",
        "Learned data preparation techniques, including tokenization and formatting datasets for supervised fine-tuning using the Hugging Face `datasets` library.",
        "Implemented Parameter-Efficient Fine-Tuning (PEFT) methods like Low-Rank Adaptation (LoRA) and Quantized LoRA (QLoRA) for efficient model training.",
        "Utilized the Hugging Face `transformers` library (Trainer API) to manage the training loop, optimize hyperparameters, and evaluate model performance on specific NLP tasks (e.g., text classification, summarization).",
        "Gained practical experience in optimizing models for deployment, considering computational efficiency and task-specific accuracy."
      ],
      credential: "https://www.codecademy.com/profiles/core1125022600/certificates/c48eab73789f42f49e97464d5ffdeb06",
      image: "/certificates/finetune-codeacademy.jpg"
    },
    {
      id: "opencv-bootcamp",
      title: "OpenCV Bootcamp",
      issuer: "OpenCV University",
      date: "Jun 2024",
      description: "Comprehensive program covering essential computer vision techniques using OpenCV, from basic image processing to advanced deep learning integration for practical applications.",
      details: [
        "**Fundamentals:** Mastered image representation, manipulation, annotation, and enhancement techniques. Worked with color spaces, histograms, and basic transformations for creating image processing pipelines.",
        "**Video Processing:** Implemented video capture, processing, and writing capabilities for analyzing video streams, including camera access for real-time applications.",
        "**Advanced Features:** Applied image filtering, feature detection, and image alignment techniques. Created panoramas and HDR imaging through feature matching and image registration.",
        "**Object Detection & Tracking:** Developed object tracking systems and implemented face detection using classical computer vision approaches and Haar Cascades.",
        "**Deep Learning Integration:** Utilized TensorFlow with OpenCV for object detection tasks and implemented human pose estimation using OpenPose, bridging traditional CV with modern deep learning techniques."
      ],
      credential: "https://courses.opencv.org/certificates/36b9a0bf22a543f4824d483951ca7761",
      image: "/certificates/opencv-bootcamp.jpg"
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

  const openCertificate = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
  };

  const closeCertificate = () => {
    setSelectedCertificate(null);
  };

  // Modal for viewing certificate
  const CertificateModal = () => {
    if (!selectedCertificate) return null;

    return (
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeCertificate}
        >
          <motion.div
            className="relative max-w-4xl w-full"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-dark-tertiary p-4 rounded-lg shadow-lg">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xl font-semibold text-dark-text-primary">{selectedCertificate.title}</h3>
                <button
                  onClick={closeCertificate}
                  className="p-1 rounded-full hover:bg-dark-primary/40 transition-colors"
                >
                  <X className="h-6 w-6 text-dark-text-secondary" />
                </button>
              </div>

              <div className="overflow-hidden rounded-md">
                <img
                  src={selectedCertificate.image}
                  alt={`${selectedCertificate.title} Certificate`}
                  className="w-full h-auto"
                />
              </div>

              <div className="mt-4">
                <p className="text-dark-text-secondary mb-2">{selectedCertificate.description}</p>

                {selectedCertificate.details && selectedCertificate.details.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <h4 className="text-sm font-semibold text-dark-text-primary">Course Details:</h4>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-dark-text-secondary">
                      {selectedCertificate.details.map((detail, idx) => (
                        <li key={idx}>{parseMarkdownBold(detail)}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-between items-center pt-3 border-t border-dark-border">
                <div>
                  <p className="text-dark-text-secondary font-medium">{selectedCertificate.issuer}</p>
                  <p className="text-dark-text-secondary/70 text-sm">{selectedCertificate.date}</p>
                </div>
                {selectedCertificate.credential && (
                  <a
                    href={selectedCertificate.credential}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-4 py-2 bg-dark-accent/10 hover:bg-dark-accent/20 text-dark-accent rounded-md transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink size={16} className="mr-2" />
                    <span>Verify Certificate</span>
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <section id="certificates" className="py-20 bg-dark-secondary">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          className="flex items-center justify-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="bg-dark-accent/10 p-2 rounded-full mr-3">
            <Award className="h-6 w-6 text-dark-accent" />
          </div>
          <h2 className="text-3xl font-bold text-dark-text-primary">Certificates & Courses</h2>
        </motion.div>

        <motion.p
          className="text-center text-lg mb-10 max-w-2xl mx-auto text-dark-text-secondary"
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
              className="group"
              variants={cardVariants}
            >
              <div
                className="bg-dark-tertiary rounded-lg border border-dark-border shadow-sm hover:shadow-md hover:shadow-black/10 transition-all duration-300 overflow-hidden cursor-pointer"
                onClick={() => openCertificate(certificate)}
              >
                <div className="flex flex-col md:flex-row">
                  {/* Certificate preview (about 1/4 of the card) */}
                  <div className="md:w-1/4 h-24 md:h-auto relative overflow-hidden bg-dark-primary">
                    <div className="absolute inset-0 flex justify-center items-center">
                      <img
                        src={certificate.image}
                        alt={`${certificate.title} preview`}
                        className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-dark-primary/80 md:bg-gradient-to-l md:from-transparent md:to-dark-primary/80" />
                    </div>
                    <div className="absolute bottom-2 right-2 bg-dark-primary/80 p-1 rounded-full">
                      <Maximize2 className="h-4 w-4 text-dark-accent" />
                    </div>
                  </div>

                  {/* Certificate info (about 3/4 of the card) */}
                  <div className="p-5 md:w-3/4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-bold text-dark-text-primary">{certificate.title}</h3>
                      <span className="text-sm text-dark-text-secondary font-mono">{certificate.date}</span>
                    </div>

                    <p className="text-dark-text-secondary font-medium mb-2">{certificate.issuer}</p>
                    <p className="text-dark-text-secondary mb-4 text-sm line-clamp-2">{certificate.description}</p>

                    <div className="flex justify-end items-center">
                      {certificate.credential && (
                        <a
                          href={certificate.credential}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-sm text-dark-text-secondary hover:text-dark-text-primary transition-colors group"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink size={14} className="mr-1 group-hover:text-dark-accent" />
                          <span className="group-hover:text-dark-accent">Verify</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Certificate modal */}
      <CertificateModal />
    </section>
  );
};

export default CertificatesSection;