import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, X } from 'lucide-react';

interface Certificate {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description: string;
  credential?: string;
  image: string;
  preview: string;
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

const CertificatesList: React.FC = () => {
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  const certificates: Certificate[] = [
    {
      id: "deep-learning-specialization",
      title: "Deep Learning Specialization",
      issuer: "DeepLearning.AI",
      date: "Jan 2024 to Jul 2024",
      description: "5-course specialization by Andrew Ng covering the deep learning pipeline from neural network fundamentals to advanced architectures and deployment strategies.",
      details: [
        "**Course 1 - Neural Networks and Deep Learning:** Built foundational understanding of deep learning, implemented core neural network components (forward/backward propagation, vectorization), and constructed shallow and deep networks.",
        "**Course 2 - Improving Deep Neural Networks:** Mastered practical aspects like hyperparameter tuning, regularization (L2, dropout), optimization algorithms (Adam, RMSprop, Momentum), batch normalization, and introductory TensorFlow implementation.",
        "**Course 3 - Structuring Machine Learning Projects:** Learned strategic approaches for building ML projects, including error analysis, bias/variance diagnosis, handling data mismatches, and understanding transfer/multi-task learning concepts.",
        "**Course 4 - Convolutional Neural Networks:** Implemented CNNs, explored architectures (ResNets, MobileNet), applied them to image classification, object detection (YOLO), image segmentation (U-Net), face recognition, and neural style transfer.",
        "**Course 5 - Sequence Models:** Built and trained RNNs, LSTMs, GRUs, and Transformers for NLP tasks. Explored word embeddings, attention mechanisms, speech recognition, and fine-tuned transformer models for specific applications like NER and QA."
      ],
      credential: "https://coursera.org/share/c41cc5a69d2f652411004575c01b7645",
      image: "/certificates/dl-specialization.jpg",
      preview: "/images/certificates/dl-specialization.webp"
    },
    {
      id: "ml-specialization",
      title: "Machine Learning Specialization",
      issuer: "DeepLearning.AI",
      date: "Sep 2023 to Nov 2023",
      description: "3-course specialization by Andrew Ng on machine learning fundamentals, algorithms, and practical applications with Python.",
      details: [
        "**Course 1 - Supervised Machine Learning:** Covered foundational supervised algorithms like linear and logistic regression, gradient descent, feature engineering, regularization, and practical implementation using Python (NumPy, Scikit-Learn).",
        "**Course 2 - Advanced Learning Algorithms:** Explored neural networks (TensorFlow/NumPy implementation, activation functions, multiclass classification), decision trees, and ensemble methods (Random Forests, XGBoost), alongside ML development best practices.",
        "**Course 3 - Unsupervised Learning, Recommenders, Reinforcement Learning:** Implemented K-Means clustering, anomaly detection, built recommender systems (collaborative & content-based), explored PCA, and introduced reinforcement learning concepts (Q-learning, DQN)."
      ],
      credential: "https://coursera.org/share/c1412dd699127cb2b3627a73d493eb87",
      image: "/certificates/ml-specialization.jpg",
      preview: "/images/certificates/ml-specialization.webp"
    },
    {
      id: "generative-ai-llm",
      title: "Generative AI with Large Language Models",
      issuer: "Amazon Web Services",
      date: "Dec 2024",
      description: "Hands-on course on generative AI fundamentals, transformer architectures, fine-tuning techniques, and responsible AI deployment.",
      details: [
        "Week 1: Explored generative AI use cases, transformer architecture, prompt engineering, and LLM pre-training fundamentals. Completed a hands-on lab on dialogue summarization.",
        "Week 2: Mastered instruction fine-tuning, model evaluation techniques, and parameter-efficient fine-tuning methods (PEFT) including LoRA and soft prompts.",
        "Week 3: Deep-dive into reinforcement learning from human feedback (RLHF), model deployment strategies, and advanced architectures including chain-of-thought, program-aided language models (PAL), and ReAct frameworks."
      ],
      credential: "https://coursera.org/share/84ec3e3b3ee61cc343feabb5ec8bf27f",
      image: "/certificates/generativeai-llm-.jpg",
      preview: "/images/certificates/generative-ai-llm.webp"
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
      image: "/certificates/finetune-codeacademy.jpg",
      preview: "/images/certificates/finetuning-transformers.webp"
    },
    {
      id: "opencv-bootcamp",
      title: "OpenCV Bootcamp",
      issuer: "OpenCV University",
      date: "Jun 2024",
      description: "Program covering essential computer vision techniques using OpenCV, from basic image processing to deep learning integration for practical applications.",
      details: [
        "**Fundamentals:** Mastered image representation, manipulation, annotation, and enhancement techniques. Worked with color spaces, histograms, and basic transformations for creating image processing pipelines.",
        "**Video Processing:** Implemented video capture, processing, and writing capabilities for analyzing video streams, including camera access for real-time applications.",
        "**Advanced Features:** Applied image filtering, feature detection, and image alignment techniques. Created panoramas and HDR imaging through feature matching and image registration.",
        "**Object Detection & Tracking:** Developed object tracking systems and implemented face detection using classical computer vision approaches and Haar Cascades.",
        "**Deep Learning Integration:** Utilized TensorFlow with OpenCV for object detection tasks and implemented human pose estimation using OpenPose, bridging traditional CV with modern deep learning techniques."
      ],
      credential: "https://courses.opencv.org/certificates/36b9a0bf22a543f4824d483951ca7761",
      image: "/certificates/opencv-bootcamp.jpg",
      preview: "/images/certificates/opencv-bootcamp.webp"
    }
  ];

  const openCertificate = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    document.body.style.overflow = 'hidden'; // Prevent page scrolling
  };

  const closeCertificate = () => {
    setSelectedCertificate(null);
    document.body.style.overflow = 'auto'; // Re-enable page scrolling
  };

  useEffect(() => {
    if (!selectedCertificate) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCertificate();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedCertificate]);

  // Modal for viewing certificate
  const CertificateModal = () => {
    if (!selectedCertificate) return null;

    return (
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeCertificate}
        >
          <motion.div
            className="relative max-w-4xl w-full max-h-[90vh] flex flex-col"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-light-tertiary  shadow-lg flex flex-col max-h-[90vh]">
              <div className="flex justify-between items-center p-4 border-b border-light-border">
                <h3 className="text-xl font-semibold text-light-text-primary">{selectedCertificate.title}</h3>
                <button
                  onClick={closeCertificate}
                  className="p-1  hover:bg-light-primary/40 transition-colors"
                >
                  <X className="h-6 w-6 text-light-text-secondary" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 p-4">
                <div className="overflow-hidden rounded-md mb-4">
                  <img
                    src={selectedCertificate.image}
                    alt={`${selectedCertificate.title} Certificate`}
                    className="w-full h-auto"
                  />
                </div>

                <div className="mt-4">
                  <p className="text-light-text-secondary mb-2">{selectedCertificate.description}</p>

                  {selectedCertificate.details && selectedCertificate.details.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <h4 className="text-sm font-semibold text-light-text-primary">Course Details:</h4>
                      <ul className="list-disc pl-5 space-y-2 text-sm text-light-text-secondary">
                        {selectedCertificate.details.map((detail, idx) => (
                          <li key={idx}>{parseMarkdownBold(detail)}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 flex justify-between items-center border-t border-light-border">
                <div>
                  <p className="text-light-text-secondary font-medium">{selectedCertificate.issuer}</p>
                  <p className="text-light-text-secondary/70 text-sm">{selectedCertificate.date}</p>
                </div>
                {selectedCertificate.credential && (
                  <a
                    href={selectedCertificate.credential}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-4 py-2 bg-light-accent/10 hover:bg-light-accent/20 text-light-accent rounded-md transition-colors"
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
    <>
      <ul className="grid gap-3">
        {certificates.map(certificate => (
          <li
            key={certificate.id}
            className="flex items-center gap-4 p-3 bg-light-primary border border-light-border hover:border-light-text-secondary transition-colors"
          >
            <button
              type="button"
              onClick={() => openCertificate(certificate)}
              className="flex flex-1 min-w-0 items-center gap-4 text-left"
            >
              <img
                src={certificate.preview}
                alt=""
                className="w-16 h-12 flex-shrink-0 object-cover border border-light-border"
                width={64}
                height={48}
                loading="lazy"
                decoding="async"
              />
              <span className="min-w-0">
                <span className="block font-semibold text-light-text-primary leading-snug">{certificate.title}</span>
                <span className="block text-sm text-light-text-secondary">
                  {certificate.issuer} · <span className="font-mono text-xs">{certificate.date}</span>
                </span>
              </span>
            </button>
            {certificate.credential && (
              <a
                href={certificate.credential}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-shrink-0 items-center text-sm text-light-text-secondary hover:text-light-accent transition-colors"
              >
                <ExternalLink size={14} className="mr-1" />
                Verify
              </a>
            )}
          </li>
        ))}
      </ul>

      <CertificateModal />
    </>
  );
};

export default CertificatesList;
