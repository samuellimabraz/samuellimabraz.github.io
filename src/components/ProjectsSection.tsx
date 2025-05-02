import React, { useState, useEffect, useMemo } from 'react';
import { Github, ExternalLink, X, Loader2, AlertTriangle, Code, FileCode, Download, Filter, Tag, Bookmark, BookmarkCheck } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  github?: string;
  demo?: string;
  image: string;
  featured: boolean;
  embedUrl?: string;
  codeExamples?: CodeExample[];
  article?: string;
  articlePt?: string;
}

interface CodeExample {
  path: string;
  description: string;
  language: string; // para syntax highlighting
}

interface CodeContent {
  content: string;
  loading: boolean;
  error: string | null;
}

const ProjectsSection: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const [gridColumns, setGridColumns] = useState<2 | 3>(3);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [modalType, setModalType] = useState<'demo' | 'repo' | null>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [codeContent, setCodeContent] = useState<CodeContent>({
    content: '',
    loading: false,
    error: null
  });
  const [selectedCodeExample, setSelectedCodeExample] = useState<CodeExample | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const projects: Project[] = [
    {
      id: "pid-controller",
      title: "PID Controller for ROS2",
      description: "Generic, configurable PID controller implemented as a ROS2 node in C++. Designed for versatile control applications including line following, altitude control, position control, velocity control, and heading/yaw control.",
      tags: ["ROS2", "C++", "Control Systems", "Robotics", "Real-time"],
      github: "https://github.com/Black-Bee-Drones/pid-controller",
      image: "https://i.postimg.cc/0y23yL92/Screenshot-from-2025-05-01-00-02-58.png",
      featured: true,
      codeExamples: [
        {
          path: "include/pid_controller/pid.hpp",
          description: "PID Controller Class Header",
          language: "cpp"
        },
        {
          path: "src/pid.cpp",
          description: "PID Controller Implementation",
          language: "cpp"
        },
        {
          path: "src/pid_controller_node.cpp",
          description: "ROS2 Node Implementation",
          language: "cpp"
        },
        {
          path: "launch/pid_controller.launch.py",
          description: "Launch File for PID Controller",
          language: "python"
        },
        {
          path: "src/pid_test_environment.cpp",
          description: "First Order System Test Environment",
          language: "python"
        },
      ]
    },
    {
      id: "vision-to-mavros",
      title: "Vision to MAVROS for ROS2",
      description: "ROS2 adaptation of the vision_to_mavros package that bridges visual pose estimation systems with flight controllers. Enables integration between Intel RealSense T265 tracking cameras and ArduPilot/PX4 via MAVROS with support for various mounting orientations.",
      tags: ["ROS2", "Robotics", "Drone", "Computer Vision", "ArduPilot", "RealSense"],
      github: "https://github.com/Black-Bee-Drones/vision_to_mavros",
      image: "https://i.postimg.cc/c1zMn27L/realsense-photo.jpg",
      featured: true,
      codeExamples: [
        {
          path: "src/vision_to_mavros.cpp",
          description: "Main Node Implementation",
          language: "cpp"
        },
        {
          path: "launch/t265_all_nodes_launch.py",
          description: "Launch File for Full System",
          language: "python"
        },
        {
          path: "launch/t265_tf_to_mavros_launch.py",
          description: "T265 Integration Launch File",
          language: "python"
        }
      ]
    },
    {
      id: "sorting-algorithms",
      title: "Sorting Algorithms",
      description: "Comprehensive implementation and performance analysis of various sorting algorithms in C++ with Python visualization. Includes a Tkinter GUI to visualize execution times and a custom SGD linear regression model for curve approximation.",
      tags: ["C++", "Python", "Algorithms", "Tkinter", "Data Visualization"],
      github: "https://github.com/samuellimabraz/SortingAlgorithms",
      image: "https://github.com/samuellimabraz/SortingAlgorithms/raw/main/resource/screenshot.png",
      featured: true,
      codeExamples: [
        {
          path: "include/BubbleSort.h",
          description: "Bubble Sort Implementation",
          language: "cpp"
        },
        {
          path: "include/QuickSort.h",
          description: "Quick Sort Implementation",
          language: "cpp"
        },
        {
          path: "include/SortAlgorithm.h",
          description: "A class for interface sorting algorithms",
          language: "cpp"
        },
        {
          path: "src/gui.py",
          description: "Tkinter GUI Implementation",
          language: "python"
        },
        {
          path: "src/model.py",
          description: "SGD Linear Regression Model",
          language: "python"
        },
        {
          path: "src/main.cpp",
          description: "Main Algorithm Benchmarking Code",
          language: "cpp"
        }
      ]
    },
    {
      id: "signature-detection",
      title: "Signature Detection Model",
      description: "Open-source signature detection model using hybrid datasets and advanced augmentations. Deployed on Azure Container Apps via NVIDIA Triton Inference Server with ONNX/OpenVINO backend.",
      tags: ["Computer Vision", "PyTorch", "ONNX", "Azure", "OpenVINO"],
      github: "https://github.com/tech4ai/t4ai-signature-detect-server",
      demo: "https://huggingface.co/collections/tech4humans/signature-detection-678b087d8b0ce22ae8c3f60e",
      article: "https://huggingface.co/blog/samuellimabraz/signature-detection-model",
      embedUrl: "https://tech4humans-signature-detection.hf.space",
      image: "https://cdn-uploads.huggingface.co/production/uploads/666b9ef5e6c60b6fc4156675/6AnC1ut7EOLa6EjibXZXY.webp",
      featured: true,
      codeExamples: [
        {
          path: "signature-detection/inference/inference_onnx.py",
          description: "Inference ONNX Model",
          language: "python"
        },
        {
          path: "signature-detection/models/postprocess/1/model.py",
          description: "Post Process in Ensemble Model",
          language: "python"
        },
        {
          path: "signature-detection/inference/predictors.py",
          description: "Predictors Class (Http, Vertex, Triton Client)",
          language: "python"
        },
        {
          path: "Dockerfile",
          description: "Dockerfile for Triton Inference Server",
          language: "python"
        },
      ]
    },
    {
      id: "peft-methods",
      title: "PEFT: Parameter-Efficient Fine-Tuning Methods for LLMs",
      description: "Comprehensive technical article exploring efficient fine-tuning methods for Large Language Models, with practical implementation in a Colab notebook comparing Full Fine-Tuning, LoRA, QLoRA, and IA³, demonstrating comparable results with just 1% of trainable parameters.",
      tags: ["LLM", "PEFT", "LoRA", "QLoRA", "IA³", "Fine-Tuning", "NLP"],
      article: "https://huggingface.co/blog/samuellimabraz/peft-methods",
      articlePt: "https://medium.com/@samuel.lima_75652/peft-m%C3%A9todos-de-fine-tuning-eficiente-para-llms-ffac60ac9d15",
      demo: "https://colab.research.google.com/drive/1B9RsKLMa8SwTxLsxRT8g9OedK10zfBEP?usp=sharing",
      image: "https://cdn-uploads.huggingface.co/production/uploads/666b9ef5e6c60b6fc4156675/K26QSN3Y5dE-rY2bGKymc.jpeg",
      featured: true,
      codeExamples: [
        {
          path: "peft_methods.ipynb",
          description: "Notebook with PEFT implementation examples",
          language: "python"
        },
        {
          path: "full_finetuning.py",
          description: "Full fine-tuning implementation",
          language: "python"
        },
        {
          path: "lora_implementation.py",
          description: "LoRA implementation",
          language: "python"
        },
        {
          path: "qlora_implementation.py",
          description: "QLoRA implementation",
          language: "python"
        },
        {
          path: "ia3_implementation.py",
          description: "IA³ implementation",
          language: "python"
        }
      ]
    },
    {
      id: "cv-hangout",
      title: "Hugging Face - Computer Vision Hangout",
      description: "Invited presenter at Hugging Face's open 'Computer Vision Hangout', sharing key CV projects and insights. Live demo and code walkthrough published on Hugging Face Spaces.",
      tags: ["Computer Vision", "Hugging Face", "Open Source", "Community"],
      demo: "https://huggingface.co/spaces/samuellimabraz/cv-hangout",
      embedUrl: "https://samuellimabraz-cv-hangout.hf.space",
      image: "https://media.licdn.com/dms/image/v2/D4E22AQGHKgZwTrxd4w/feedshare-shrink_2048_1536/B4EZY0Fb6oHgAo-/0/1744630563125?e=1749081600&v=beta&t=IzFK5yirtJK7A12pbcBHk4QQTPY8YJjs1RHjWlP7th4",
      featured: true,
      codeExamples: [
        {
          path: "app.py",
          description: "Main Gradio application for the CV Hangout demo",
          language: "python"
        }
      ]
    },
    {
      id: "cafedl",
      title: "CafeDL: Deep Learning Framework",
      description: "Java-based deep learning framework implemented from scratch, supporting various neural network architectures and training algorithms.",
      tags: ["Java", "Deep Learning", "Framework", "Educational"],
      github: "https://github.com/samuellimabraz/cafedl",
      image: "https://i.postimg.cc/QM7rGZ6H/image-2.png",
      featured: true,
      codeExamples: [
        {
          path: "src/main/java/br/cafedl/neuralnetwork/examples/classification/image/qdraw/QuickDrawNN.java",
          description: "Quick Draw Neural Network Training",
          language: "java"
        },
        {
          path: "src/main/java/br/cafedl/neuralnetwork/core/optimizers/Adam.java",
          description: "Adam Optimizer Implementation",
          language: "java"
        },
        {
          path: "src/main/java/br/cafedl/neuralnetwork/core/layers/Dense.java",
          description: "Dense Layer Implementation",
          language: "java"
        },
        {
          path: "src/main/java/br/cafedl/neuralnetwork/core/train/Trainer.java",
          description: "Trainer Class",
          language: "java"
        },
        {
          path: "src/main/java/br/cafedl/neuralnetwork/examples/regression/NonLinearFunctions.java",
          description: "Non Linear Functions Example Training",
          language: "java"
        },

      ]
    },
    {
      id: "face-api",
      title: "Face API: Facial Recognition System",
      description: "Scalable facial recognition system using DeepFace, FastAPI, and MongoDB Atlas Vector Search for efficient face matching and similarity search.",
      tags: ["Facial Recognition", "FastAPI", "MongoDB", "Vector Search"],
      github: "https://github.com/samuellimabraz/face-api",
      image: "https://i.postimg.cc/02SGwtH7/Screenshot-from-2025-04-30-22-42-31.png",
      featured: false,
      codeExamples: [
        {
          path: "src/api/main.py",
          description: "API endpoints for facial recognition",
          language: "python"
        },
        {
          path: "src/infrastructure/ml/detect/deepface_detector.py",
          description: "Face Detector",
          language: "python"
        },
        {
          path: "src/infrastructure/database/mongodb.py",
          description: "MongoDB Vector Store",
          language: "python"
        },
      ]
    },
    {
      id: "agent4ai",
      title: "Agent4ai: LLM Agent Framework",
      description: "Conversational AI agent using Python and LangGraph with advanced RAG pipeline for company onboarding and knowledge management.",
      tags: ["LLM", "Agents", "RAG", "LangGraph", "Python"],
      github: "https://github.com/samuellimabraz/Agent4ai",
      image: "https://github.com/samuellimabraz/Agent4ai/raw/main/images/Cohere%20Multilingual%20Model.png",
      featured: false,
      codeExamples: [
        {
          path: "agent/graph/agent.py",
          description: "LLM Agent implementation with LangGraph",
          language: "python"
        },
        {
          path: "agent/tools/base_content_tool.py",
          description: "Retrivier Content Tool",
          language: "python"
        },
        {
          path: "agent/tools/calendar_tool.py",
          description: "Google Calendar Tool",
          language: "python"
        },
        {
          path: "agent/graph/chains/router.py",
          description: "Router Chain",
          language: "python"
        },
      ]
    },
    {
      id: "hand-mouse",
      title: "Hand Mouse Controller",
      description: "Python application for real-time mouse control via hand gestures using OpenCV and Google MediaPipe for accessibility and hands-free computing.",
      tags: ["Computer Vision", "MediaPipe", "Accessibility", "Python"],
      github: "https://github.com/samuellimabraz/HandMouseController",
      image: "https://i.postimg.cc/3wxGkFqT/Screenshot-from-2025-04-30-22-47-42.png",
      featured: false,
      codeExamples: [
        {
          path: "hand_controller.py",
          description: "Main hand tracking and mouse control logic",
          language: "python"
        },
        {
          path: "gesture_recognition.py",
          description: "Gesture recognition algorithms",
          language: "python"
        }
      ]
    },
    {
      id: "opencv-gui",
      title: "OpenCV Explorer",
      description: "Interactive web application that allows real-time experimentation with computer vision techniques using your webcam. Built with OpenCV, Streamlit, and WebRTC.",
      tags: ["Computer Vision", "OpenCV", "Streamlit", "WebRTC", "Python"],
      github: "https://github.com/samuellimabraz/OpenCVGUI",
      demo: "https://huggingface.co/spaces/samuellimabraz/opencv-gui",
      embedUrl: "https://samuellimabraz-opencv-gui.hf.space",
      image: "https://i.postimg.cc/050J03qs/opencv-gui-2.png",
      featured: true,
      codeExamples: [
        {
          path: "src/streamlit_app.py",
          description: "Main Streamlit application with WebRTC video processing",
          language: "python"
        },
        {
          path: "src/opencv_utils.py",
          description: "Implementation of various OpenCV filters and transformations",
          language: "python"
        },
        {
          path: "src/hand_tracker.py",
          description: "Hand Tracker Class",
          language: "python"
        },
        {
          path: "src/face_mesh_tracker.py",
          description: "Face Mesh Tracker Class",
          language: "python"
        }
      ]
    },
  ];

  // Extract all unique tags from projects
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    projects.forEach(project => {
      project.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [projects]);

  // Filter projects based on active filters
  const filteredProjects = useMemo(() => {
    let result = projects;

    // Filter by featured/all
    if (activeFilter === 'featured') {
      result = result.filter(p => p.featured);
    }

    // Filter by tag if one is selected
    if (activeTagFilter) {
      result = result.filter(p => p.tags.includes(activeTagFilter));
    }

    return result;
  }, [projects, activeFilter, activeTagFilter]);

  // Toggle grid layout
  const toggleGridLayout = () => {
    setGridColumns(prev => prev === 3 ? 2 : 3);
  };

  // Clear all filters
  const clearFilters = () => {
    setActiveFilter('all');
    setActiveTagFilter(null);
  };

  const openProjectModal = (project: Project, type: 'demo' | 'repo') => {
    setSelectedProject(project);
    setModalType(type);
    document.body.style.overflow = 'hidden';
    setIframeLoaded(false);
    setIframeError(false);

    // Reset code content and selected example
    setCodeContent({ content: '', loading: false, error: null });
    setSelectedCodeExample(null);

    // If opening repository and project has code examples, select the first one by default
    if (type === 'repo' && project.codeExamples && project.codeExamples.length > 0) {
      const firstExample = project.codeExamples[0];
      setSelectedCodeExample(firstExample);
      fetchCodeContent(project.github!, firstExample.path);
    }
  };

  const closeProjectModal = () => {
    setSelectedProject(null);
    setModalType(null);
    document.body.style.overflow = 'auto';
    setCodeContent({ content: '', loading: false, error: null });
    setSelectedCodeExample(null);
  };

  const fetchCodeContent = async (repoUrl: string, filePath: string) => {
    try {
      setCodeContent({ content: '', loading: true, error: null });

      // Extract owner and repo name from GitHub URL
      const [owner, repo] = repoUrl.replace('https://github.com/', '').split('/');

      // GitHub API endpoint for getting file contents
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status}`);
      }

      const data = await response.json();

      // GitHub API returns content as Base64 encoded
      const decodedContent = atob(data.content);

      setCodeContent({ content: decodedContent, loading: false, error: null });
    } catch (error) {
      console.error('Error fetching file content:', error);
      setCodeContent({
        content: '',
        loading: false,
        error: 'Failed to load code from GitHub. The file may not exist or access may be restricted.'
      });
    }
  };

  const selectCodeExample = (example: CodeExample) => {
    setSelectedCodeExample(example);
    if (selectedProject && selectedProject.github) {
      fetchCodeContent(selectedProject.github, example.path);
    }
  };

  // Helper function to get the language from file extension
  const getLanguageFromPath = (path: string): string => {
    const extension = path.split('.').pop()?.toLowerCase() || '';
    const languageMap: Record<string, string> = {
      'py': 'python',
      'js': 'javascript',
      'jsx': 'jsx',
      'ts': 'typescript',
      'tsx': 'tsx',
      'java': 'java',
      'c': 'c',
      'cpp': 'cpp',
      'h': 'c',
      'hpp': 'cpp',
      'cs': 'csharp',
      'go': 'go',
      'rb': 'ruby',
      'php': 'php',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'md': 'markdown',
      'sh': 'bash',
      'yml': 'yaml',
      'yaml': 'yaml',
    };

    return languageMap[extension] || 'text';
  };

  // To handle iframe loading events
  const handleIframeLoad = () => {
    setIframeLoaded(true);
  };

  const handleIframeError = () => {
    setIframeError(true);
  };

  return (
    <section id="projects" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-3xl font-bold mb-6 text-center">Projects</h2>
        <p className="text-center text-lg mb-10 max-w-2xl mx-auto">
          Explore my projects including computer vision models, language model applications, and AI frameworks.
        </p>

        {/* Filter controls */}
        <div className="mb-10">
          {/* Primary filter buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${activeFilter === 'all'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
            >
              All Projects
            </button>
            <button
              onClick={() => setActiveFilter('featured')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${activeFilter === 'featured'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
            >
              <BookmarkCheck size={16} className="mr-2" />
              Featured Projects
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-2 rounded-md text-sm font-medium transition-colors bg-gray-100 text-gray-800 hover:bg-gray-200 flex items-center"
            >
              <Filter size={16} className="mr-2" />
              Filter by Tags
            </button>
            <button
              onClick={toggleGridLayout}
              className="px-6 py-2 rounded-md text-sm font-medium transition-colors bg-gray-100 text-gray-800 hover:bg-gray-200"
            >
              {gridColumns === 3 ? '2-Column Layout' : '3-Column Layout'}
            </button>
          </div>

          {/* Tag filters */}
          {showFilters && (
            <div className="max-w-4xl mx-auto mb-6">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium flex items-center">
                    <Tag size={16} className="mr-2" />
                    Filter by Tags
                  </h3>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-gray-500 hover:text-black"
                  >
                    Clear Filters
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setActiveTagFilter(activeTagFilter === tag ? null : tag)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${activeTagFilter === tag
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                        }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Active filter indicators */}
          {(activeFilter !== 'all' || activeTagFilter) && (
            <div className="flex justify-center mb-6">
              <div className="bg-gray-100 rounded-md px-4 py-2 flex items-center gap-2">
                <span className="text-sm text-gray-500">Active Filters:</span>
                {activeFilter === 'featured' && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                    Featured Only
                  </span>
                )}
                {activeTagFilter && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                    Tag: {activeTagFilter}
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  className="text-xs text-gray-500 hover:text-black ml-2"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Projects grid */}
        <div className={`grid gap-8 ${gridColumns === 3
          ? 'md:grid-cols-2 lg:grid-cols-3'
          : 'md:grid-cols-1 lg:grid-cols-2'
          }`}>
          {filteredProjects.map(project => (
            <div
              key={project.id}
              className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm transition-all hover:shadow-md flex flex-col"
            >
              <div className="h-48 overflow-hidden bg-gray-100 relative group">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity">
                  {project.embedUrl && (
                    <button
                      onClick={() => openProjectModal(project, 'demo')}
                      className="px-4 py-2 bg-white text-black rounded-md font-medium hover:bg-gray-100 transition-colors flex items-center"
                    >
                      <ExternalLink size={16} className="mr-2" />
                      Live Demo
                    </button>
                  )}
                  {project.github && (
                    <button
                      onClick={() => openProjectModal(project, 'repo')}
                      className="px-4 py-2 bg-white text-black rounded-md font-medium hover:bg-gray-100 transition-colors flex items-center"
                    >
                      <Code size={16} className="mr-2" />
                      View Code
                    </button>
                  )}
                </div>
                {project.featured && (
                  <div className="absolute top-2 right-2">
                    <span className="bg-black text-white text-xs px-2 py-1 rounded-md font-medium">
                      Featured
                    </span>
                  </div>
                )}
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                <p className="text-gray-600 mb-4 flex-1">{project.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setActiveTagFilter(tag)}
                      className="px-2 py-1 bg-gray-100 text-xs rounded hover:bg-gray-200 transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3 mt-auto">
                  {project.github && (
                    <button
                      onClick={() => openProjectModal(project, 'repo')}
                      className="px-3 py-1.5 border border-gray-200 rounded-md flex items-center text-sm hover:bg-gray-50 transition-colors"
                    >
                      <Github size={16} className="mr-1.5" />
                      GitHub
                    </button>
                  )}

                  {project.demo && (
                    <a
                      href={project.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 border border-gray-200 rounded-md flex items-center text-sm hover:bg-gray-50 transition-colors"
                    >
                      <ExternalLink size={16} className="mr-1.5" />
                      Demo
                    </a>
                  )}

                  {project.article && (
                    <a
                      href={project.article}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 border border-gray-200 rounded-md flex items-center text-sm hover:bg-gray-50 transition-colors"
                    >
                      <FileCode size={16} className="mr-1.5" />
                      Article
                    </a>
                  )}

                  {project.articlePt && (
                    <a
                      href={project.articlePt}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 border border-gray-200 rounded-md flex items-center text-sm hover:bg-gray-50 transition-colors"
                    >
                      <FileCode size={16} className="mr-1.5" />
                      Article (PT)
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <AlertTriangle size={40} className="mx-auto text-amber-500 mb-4" />
            <p className="text-lg text-gray-600 mb-4">No projects found with the selected filters.</p>
            <button
              onClick={clearFilters}
              className="mt-2 px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Project Demo Modal */}
      {selectedProject && modalType === 'demo' && selectedProject.embedUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <div className="flex-1">
                <h3 className="text-xl font-bold">{selectedProject.title} - Live Demo</h3>
                <p className="text-sm text-gray-500">Interact with the live demo below</p>
              </div>
              <button
                onClick={closeProjectModal}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-hidden relative">
              {!iframeLoaded && !iframeError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <Loader2 size={40} className="animate-spin text-gray-400" />
                  <p className="ml-3 text-gray-500">Loading demo...</p>
                </div>
              )}

              {iframeError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
                  <AlertTriangle size={40} className="text-amber-500 mb-3" />
                  <p className="text-red-500 mb-3">Failed to load the demo</p>
                  <a
                    href={selectedProject.embedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-black text-white rounded-md"
                  >
                    Open in New Tab
                  </a>
                </div>
              )}

              <iframe
                src={selectedProject.embedUrl}
                className="w-full h-full min-h-[600px]"
                title={`${selectedProject.title} Demo`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={handleIframeLoad}
                onError={handleIframeError}
              />
            </div>
          </div>
        </div>
      )}

      {/* Project Code Examples Modal */}
      {selectedProject && modalType === 'repo' && selectedProject.github && selectedProject.codeExamples && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <div className="flex-1">
                <h3 className="text-xl font-bold">{selectedProject.title} - Code Examples</h3>
                <p className="text-sm text-gray-500">Explore key code snippets from this project</p>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={selectedProject.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-black text-white rounded-md text-sm flex items-center hover:bg-gray-800 transition-colors"
                >
                  <Github size={16} className="mr-1.5" />
                  View on GitHub
                </a>
                <button
                  onClick={closeProjectModal}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* File Selector Sidebar */}
              <div className="w-64 border-r bg-gray-50 overflow-y-auto">
                <div className="p-4 border-b">
                  <div className="flex items-center">
                    <Github size={16} className="mr-2" />
                    <a
                      href={selectedProject.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-mono text-blue-600 hover:underline truncate"
                    >
                      {selectedProject.github.replace('https://github.com/', '')}
                    </a>
                  </div>
                </div>

                <div className="p-2">
                  <h4 className="px-2 py-1 text-sm font-medium text-gray-500">Code Files</h4>
                  <ul className="mt-2">
                    {selectedProject.codeExamples.map((example, index) => (
                      <li key={index}>
                        <button
                          onClick={() => selectCodeExample(example)}
                          className={`w-full flex items-start p-2 rounded text-left text-sm transition-colors ${selectedCodeExample && selectedCodeExample.path === example.path
                            ? 'bg-gray-200'
                            : 'hover:bg-gray-100'
                            }`}
                        >
                          <FileCode size={16} className="mr-2 flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="font-medium">{example.path.split('/').pop()}</div>
                            <div className="text-xs text-gray-500 mt-1">{example.description}</div>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Code Content */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {selectedCodeExample && (
                  <div className="p-2 border-b flex items-center justify-between bg-gray-50">
                    <div className="flex items-center">
                      <FileCode size={16} className="mr-2 text-gray-500" />
                      <span className="font-mono text-sm">{selectedCodeExample.path}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          // Copy code to clipboard
                          if (codeContent.content) {
                            navigator.clipboard.writeText(codeContent.content);
                          }
                        }}
                        className="flex items-center p-1 px-2 rounded text-xs bg-gray-200 hover:bg-gray-300 transition-colors"
                        disabled={!codeContent.content || codeContent.loading}
                      >
                        <Download size={14} className="mr-1" />
                        Copy Code
                      </button>
                      <a
                        href={`${selectedProject.github}/blob/main/${selectedCodeExample.path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-1 px-2 rounded text-xs bg-gray-200 hover:bg-gray-300 transition-colors"
                      >
                        <ExternalLink size={14} className="mr-1" />
                        View on GitHub
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex-1 overflow-auto relative">
                  {codeContent.loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
                      <Loader2 size={30} className="animate-spin text-gray-400" />
                    </div>
                  )}

                  {codeContent.error && (
                    <div className="p-4 flex flex-col items-center justify-center h-full">
                      <AlertTriangle size={30} className="text-amber-500 mb-3" />
                      <p className="text-red-500 text-center mb-3">{codeContent.error}</p>
                      <a
                        href={selectedProject.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-gray-100 rounded-md text-sm hover:bg-gray-200 transition-colors"
                      >
                        View Repository
                      </a>
                    </div>
                  )}

                  {!codeContent.loading && !codeContent.error && codeContent.content && selectedCodeExample && (
                    <div className="relative min-h-full">
                      <SyntaxHighlighter
                        language={selectedCodeExample.language || getLanguageFromPath(selectedCodeExample.path)}
                        style={tomorrow}
                        showLineNumbers={true}
                        customStyle={{
                          margin: 0,
                          padding: '16px',
                          borderRadius: 0,
                          minHeight: '100%',
                          fontSize: '14px'
                        }}
                      >
                        {codeContent.content}
                      </SyntaxHighlighter>
                    </div>
                  )}

                  {!codeContent.loading && !codeContent.error && !codeContent.content && (
                    <div className="flex items-center justify-center h-full p-6 text-gray-500">
                      Select a file to view the code
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProjectsSection;