import { Project, CodeExample } from '../lib/types';

export const projects: Project[] = [
    {
        id: "quantum-assistant",
        title: "Quantum Assistant: Multimodal VLM for Quantum Computing",
        description: "Specializing multimodal vision-language models for quantum computing with Qiskit through synthetic data generation, efficient fine-tuning (rsLoRA), and evaluation. Built an 8,366-sample multimodal dataset (45% with images) achieving +11-17pp improvement on Qiskit HumanEval benchmark. Fine-tuned Qwen3-VL-8B models available on HuggingFace.",
        tags: ["VLM", "Multimodal", "PEFT", "LoRA", "Qiskit", "Quantum Computing", "Python"],
        github: "https://github.com/samuellimabraz/quantum-assistant",
        demo: "https://huggingface.co/spaces/samuellimabraz/quantum-assistant",
        embedUrl: "https://samuellimabraz-quantum-assistant.hf.space",
        image: "https://media.githubusercontent.com/media/samuellimabraz/quantum-assistant/main/assets/images/synthetic-pipeline.png",
        featured: true,
        codeExamples: [
            {
                path: "src/synthetic_data/generators/stages/answer.py",
                description: "Answer Generation Stage for Synthetic Data Pipeline",
                language: "python"
            },
            {
                path: "src/evaluate/evaluators/code.py",
                description: "Code Evaluator with Pass@k Metrics",
                language: "python"
            },
            {
                path: "src/finetune/preparer.py",
                description: "Fine-tuning Data Preparation for ms-swift",
                language: "python"
            },
            {
                path: "src/models/client.py",
                description: "LLM/VLM Client for OpenAI-compatible APIs",
                language: "python"
            }
        ]
    },
    {
        id: "signature-detection",
        title: "Signature Detection Model",
        description: "Developed an open-source signature detection system by building a hybrid dataset with refined public samples and strong augmentations (Albumentations, OpenCV). Benchmarked multiple object detection architectures (YOLOv8–v12, DETR, YOLOS) and fine-tuned YOLOv8s for the best performance-speed trade-off. Used Optuna for hyperparameter optimization, improving F1-score by 7.94%. Deployed on Azure via NVIDIA Triton Inference Server with ONNX/OpenVINO backends, achieving sub-200 ms latency on CPU. Implemented CI/CD with GitHub Actions and tracked experiments using Weights & Biases. Dataset, code, and demo are fully open-source and featured on the Hugging Face blog (>100 upvotes).",
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
        id: "cafedl",
        title: "CafeDL: Deep Learning Framework",
        description: "A Java‑based deep learning library built from scratch (inspired by Keras and 'Deep Learning From Scratch'), featuring core layers (Conv2D, Dense, Dropout, etc.), activation/loss/optimizer modules, ND4J‑powered tensor operations, MongoDB persistence via Morphia, and a QuickDraw‑style sketch‑classification game using JavaFX and MVC.",
        tags: ["Java", "Deep Learning", "Framework", "Educational"],
        github: "https://github.com/samuellimabraz/cafedl",
        image: "https://raw.githubusercontent.com/samuellimabraz/samuellimabraz.github.io/refs/heads/main/assets/cafe-dl.png",
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
        id: "vision-to-mavros",
        title: "Vision to MAVROS for ROS2",
        description: "ROS2 adaptation of the vision_to_mavros package that bridges visual pose estimation systems with flight controllers. Enables integration between Intel RealSense T265 tracking cameras and ArduPilot/PX4 via MAVROS with support for various mounting orientations.",
        tags: ["ROS2", "Robotics", "Drone", "Computer Vision", "ArduPilot", "RealSense"],
        github: "https://github.com/Black-Bee-Drones/vision_to_mavros",
        image: "https://raw.githubusercontent.com/samuellimabraz/samuellimabraz.github.io/refs/heads/main/assets/realsense-photo.jpg",
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
        id: "opencv-gui",
        title: "OpenCV Explorer",
        description: "Interactive web application that allows real-time experimentation with computer vision techniques using your webcam. Built with OpenCV, Streamlit, and WebRTC.",
        tags: ["Computer Vision", "OpenCV", "Streamlit", "WebRTC", "Python"],
        github: "https://github.com/samuellimabraz/OpenCVGUI",
        demo: "https://huggingface.co/spaces/samuellimabraz/opencv-gui",
        embedUrl: "https://samuellimabraz-opencv-gui.hf.space",
        image: "https://raw.githubusercontent.com/samuellimabraz/samuellimabraz.github.io/refs/heads/main/assets/opencv-gui-2.png",
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
        id: "pid-controller",
        title: "PID Controller for ROS2",
        description: "Generic, configurable PID controller implemented as a ROS2 node in C++. Designed for versatile control applications including line following, altitude control, position control, velocity control, and heading/yaw control.",
        tags: ["ROS2", "C++", "Control Systems", "Robotics", "Real-time"],
        github: "https://github.com/Black-Bee-Drones/pid-controller",
        image: "https://raw.githubusercontent.com/samuellimabraz/samuellimabraz.github.io/refs/heads/main/assets/pid.png",
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
        id: "peft-ainews",
        title: "PEFT Techniques for Fine-Tuning Transformer Models",
        description: "Academic article published in AINews about Parameter-Efficient Fine-Tuning (PEFT) techniques for Transformer models, exploring efficient methods to adapt large language models with limited computational resources.",
        tags: ["PEFT", "Transformers", "NLP", "Fine-Tuning", "LoRA", "Academic Paper", "Portuguese"],
        pdfUrl: "https://ainews.net.br/wp-content/uploads/2025/01/Ajuste-fino-de-modelos-Transformers-atraves-de-tecnicas-PEFT-Parameter-Efficient-Fine-Tuning.pdf",
        externalUrl: "https://ainews.net.br/ajuste-fino-de-modelos-transformers-atraves-detecnicas-peft-parameter-efficient-fine-tuning/",
        image: "https://cdn-uploads.huggingface.co/production/uploads/666b9ef5e6c60b6fc4156675/dz0AdSqt4QP7iRjpiXDE1.png",
        featured: true,
        languagePt: true,
    },
    {
        id: "cv-hangout",
        title: "Hugging Face - Computer Vision Hangout",
        description: "Invited presenter at Hugging Face's open 'Computer Vision Hangout', sharing key CV projects and insights. Live demo and code walkthrough published on Hugging Face Spaces.",
        tags: ["Computer Vision", "Hugging Face", "Open Source", "Community"],
        demo: "https://huggingface.co/spaces/samuellimabraz/cv-hangout",
        embedUrl: "https://samuellimabraz-cv-hangout.hf.space",
        image: "https://raw.githubusercontent.com/samuellimabraz/samuellimabraz.github.io/refs/heads/main/assets/hf-hangout.png",
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
        id: "face-api",
        title: "Face API: Facial Recognition System",
        description: "Scalable facial recognition system using DeepFace, FastAPI, and MongoDB Atlas Vector Search for efficient face matching and similarity search.",
        tags: ["Facial Recognition", "FastAPI", "MongoDB", "Vector Search"],
        github: "https://github.com/samuellimabraz/face-api",
        image: "https://raw.githubusercontent.com/samuellimabraz/samuellimabraz.github.io/refs/heads/main/assets/face-api.png",
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
        id: "educai",
        title: "EducAI: AI Math Assistant",
        description: "AI-powered mathematics platform with natural language chat, OCR for handwritten problems, graph visualization, and step-by-step problem solving. Built with FastAPI, React, OlmOCR, and Qwen Math LLM served via vLLM. Developed as a team project at UNIFEI.",
        tags: ["FastAPI", "React", "LLM", "OCR", "vLLM", "Docker", "Math"],
        github: "https://github.com/samuellimabraz/EducAI",
        image: "https://raw.githubusercontent.com/samuellimabraz/samuellimabraz.github.io/refs/heads/main/assets/educai-home.png",
        featured: false,
        codeExamples: [
            {
                path: "docker/models/Dockerfile.vllm",
                description: "Dockerfile for vLLM models",
                language: "docker"
            },
            {
                path: "backend/app/main.py",
                description: "FastAPI Main Application",
                language: "python"
            },
            {
                path: "backend/app/services/llm_service.py",
                description: "LLM Service with vLLM",
                language: "python"
            },
            {
                path: "backend/app/services/ocr_service.py",
                description: "OCR Service for image to text conversion",
                language: "python"
            },
            {
                path: "frontend/src/components/ChatInterface.js",
                description: "React Chat Interface",
                language: "javascript"
            },
            {
                path: "frontend/src/components/GraphVisualizer.js",
                description: "React Graph Visualizer",
                language: "javascript"
            },
            {
                path: "frontend/src/components/SketchPad.js",
                description: "React Sketch Pad",
                language: "javascript"
            }
        ]
    },
    {
        id: "agent4ai",
        title: "Agent4ai: LLM Agent Framework",
        description: "A LangGraph‑based conversational agent for Tech4Humans onboarding, leveraging Adaptive, Corrective and Self‑RAG for dynamic document retrieval, real‑time web search (Tavily), Google Calendar integration, and a modular graph architecture to guide new employees through company info, tools and events.",
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
        tags: ["Computer Vision", "MediaPipe", "Python"],
        github: "https://github.com/samuellimabraz/HandMouseController",
        image: "https://raw.githubusercontent.com/samuellimabraz/samuellimabraz.github.io/refs/heads/main/assets/hand-controller.png",
        featured: false,
        codeExamples: [
            {
                path: "src/HandTracker.py",
                description: "Hand Detector Class",
                language: "python"
            },
            {
                path: "src/main.py",
                description: "Main hand tracking and mouse control logic",
                language: "python"
            }
        ]
    },
    {
        id: "board-bringup",
        title: "Board Bring-Up PIC18F4550",
        description: "PCB board bring-up and validation project for PIC18F4550 microcontroller. Built firmware with state machine architecture, LCD display, ADC monitoring, RTC clock, I2C communication, and USB serial control. Features multilingual IHM menu with alarm system.",
        tags: ["Embedded Systems", "C", "PIC18F4550", "State Machine", "I2C", "MPLAB X"],
        github: "https://github.com/samuellimabraz/BoardBring-Up-PIC18F4550",
        image: "https://raw.githubusercontent.com/samuellimabraz/BoardBring-Up-PIC18F4550/main/docs/DiagramaDeEstados.png",
        featured: false,
        codeExamples: [
            {
                path: "src/main.c",
                description: "Main Application Entry Point",
                language: "c"
            },
            {
                path: "src/stateMachine.c",
                description: "State Machine Implementation",
                language: "c"
            },
            {
                path: "src/lcd.c",
                description: "LCD Driver",
                language: "c"
            },
            {
                path: "src/adc.c",
                description: "ADC Driver",
                language: "c"
            },
            {
                path: "src/var.c",
                description: "Storing system variables",
                language: "c"
            },
            {
                path: "src/serial.c",
                description: "Serial Communication",
                language: "c"
            }
        ]
    }
]; 