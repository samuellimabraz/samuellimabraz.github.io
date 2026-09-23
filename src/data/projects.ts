import { Project } from '../lib/types';

export const projects: Project[] = [
    {
        id: "nectar-sdk",
        title: "Nectar SDK",
        description: "ROS 2 kit with one flight interface for ArduPilot and PX4 (MAVROS, MAVLink, uXRCE-DDS), plus Bebop and Crazyflie; a camera factory (RealSense, OAK-D, USB, ROS topics); and detection, segmentation, and classification (YOLO, DETR, RF-DETR). PID navigation with GPS waypoint missions, obstacle handling from a depth camera, Gazebo SITL, and Docker images for x86_64 and ARM64. Built for Black Bee Drones as the shared software for competition missions.",
        tags: ["ROS 2", "Robotics", "Computer Vision", "Python", "C++", "OpenCV"],
        github: "https://github.com/Black-Bee-Drones/nectar-sdk",
        docs: "https://black-bee-drones.github.io/nectar-sdk/",
        image: "/images/projects/nectar-sdk.webp",
        featured: true,
        codeExamples: [
            {
                path: "nectar/nectar/control/base.py",
                description: "Abstract base drone: protocol used by every vehicle implementation",
                language: "python"
            },
            {
                path: "nectar/nectar/control/mavros/drone.py",
                description: "MAVROS drone: flight control through MAVROS",
                language: "python"
            },
            {
                path: "nectar/nectar/control/vehicle/navigator.py",
                description: "Navigator: PID and setpoint strategies in body, world, and takeoff frames",
                language: "python"
            },
            {
                path: "nectar/nectar/control/vehicle/gps_utils.py",
                description: "GPS utilities: EGM96 geoid correction for AMSL altitude",
                language: "python"
            },
            {
                path: "nectar/nectar/control/obstacles/depth_camera.py",
                description: "Depth camera obstacle detector",
                language: "python"
            },
            {
                path: "nectar/nectar/vision/camera/drivers/realsense_cam.py",
                description: "RealSense camera driver",
                language: "python"
            },
            {
                path: "nectar/nectar/vision/algorithms/line/line_detector.py",
                description: "Line detector: Hough, RANSAC, rotated rect, ellipse",
                language: "python"
            }
        ]
    },
    {
        id: "quantum-assistant",
        title: "Quantum Assistant",
        description: "Published in Expert Systems with Applications (Elsevier). Synthetic multimodal data and PEFT (rsLoRA) on Qwen3-VL-8B for Qiskit (circuit diagrams, Bloch spheres, histograms). 8,366-sample dataset, about 45% with images. On Qiskit HumanEval / Hard the fine-tuned model reached 41.72% / 30.46% Pass@1, +17.22 / +15.89 pp over the Qwen3-VL-8B base. Graduation project at UNIFEI.",
        tags: ["VLM", "PEFT", "Qiskit", "Python"],
        github: "https://github.com/samuellimabraz/quantum-assistant",
        demo: "https://huggingface.co/spaces/samuellimabraz/quantum-assistant",
        article: "https://www.sciencedirect.com/science/article/pii/S0957417426028381",
        articleLabel: "Paper",
        pdfUrl: "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=6271408",
        embedUrl: "https://samuellimabraz-quantum-assistant.hf.space",
        image: "/images/projects/quantum-assistant.webp",
        featured: true,
        codeExamples: [
            {
                path: "src/synthetic_data/generators/stages/answer.py",
                description: "Answer generation stage for the synthetic data pipeline",
                language: "python"
            },
            {
                path: "src/evaluate/evaluators/code.py",
                description: "Code evaluator with Pass@k metrics",
                language: "python"
            },
            {
                path: "src/finetune/preparer.py",
                description: "Fine-tuning data preparation for ms-swift",
                language: "python"
            },
            {
                path: "src/models/client.py",
                description: "LLM/VLM client for OpenAI-compatible APIs",
                language: "python"
            }
        ]
    },
    {
        id: "signature-detection",
        title: "Signature Detection Model",
        description: "Open-source signature detector. Hybrid dataset with public samples and Albumentations/OpenCV augmentations. Compared YOLO (v8 to v12), DETR, and YOLOS; chose YOLOv8s. Optuna search added 7.94 percentage points F1. Served on NVIDIA Triton with ONNX/OpenVINO, under 200 ms on CPU. Code, weights, data, and report are public. Hugging Face blog post with more than 100 upvotes.",
        tags: ["Computer Vision", "PyTorch", "ONNX", "OpenVINO", "Triton"],
        github: "https://github.com/tech4ai/t4ai-signature-detect-server",
        demo: "https://huggingface.co/collections/tech4humans/signature-detection-678b087d8b0ce22ae8c3f60e",
        article: "https://huggingface.co/blog/samuellimabraz/signature-detection-model",
        articleLabel: "Post",
        embedUrl: "https://tech4humans-signature-detection.hf.space",
        image: "/images/projects/signature-detection.webp",
        featured: true,
        codeExamples: [
            {
                path: "signature-detection/inference/inference_onnx.py",
                description: "ONNX inference",
                language: "python"
            },
            {
                path: "signature-detection/models/postprocess/1/model.py",
                description: "Post-process in the ensemble model",
                language: "python"
            },
            {
                path: "signature-detection/inference/predictors.py",
                description: "Predictors (HTTP, Vertex, Triton client)",
                language: "python"
            },
            {
                path: "Dockerfile",
                description: "Dockerfile for Triton Inference Server",
                language: "python"
            }
        ]
    },
    {
        id: "vision-to-mavros",
        title: "Vision to MAVROS for ROS 2",
        description: "ROS 2 C++ package that bridges visual pose estimation (Intel RealSense T265) with ArduPilot and PX4 through MAVROS, including ENU/NED conversion and covariance. Used for indoor GPS-denied flight on Black Bee vehicles.",
        tags: ["ROS 2", "Robotics", "ArduPilot", "RealSense", "C++"],
        github: "https://github.com/Black-Bee-Drones/vision_to_mavros",
        image: "/images/projects/vision-to-mavros.webp",
        featured: true,
        codeExamples: [
            {
                path: "src/vision_to_mavros.cpp",
                description: "Main node",
                language: "cpp"
            },
            {
                path: "launch/t265_all_nodes_launch.py",
                description: "Launch file for the full system",
                language: "python"
            },
            {
                path: "launch/t265_tf_to_mavros_launch.py",
                description: "T265 to MAVROS launch file",
                language: "python"
            }
        ]
    },
    {
        id: "chunkr-layout",
        title: "Chunkr Layout 1",
        description: "Synthetic document-layout generator from statistics of real pages (positions, co-occurrence, size), with an element pool in SQLite. Pretrained YOLO and RF-DETR on 500K+ synthetic samples mixed with real data, then fine-tuned. Fine-tuned LayoutLMv3-Large for reading order: 88.1% exact match and 98.2% Kendall's tau on an open benchmark (733 samples, 16 document categories). Served on NVIDIA Triton.",
        tags: ["Computer Vision", "Synthetic Data", "YOLO", "Triton"],
        article: "https://chunkr.ai/blog/introducing-chunkr-layout-1-state-of-the-art-document-layout-analysis%20",
        articleLabel: "Post",
        demo: "https://huggingface.co/datasets/ChunkrAI/chunkr-reading-order-bench-oss",
        image: "/images/projects/chunkr-layout.webp",
        featured: true
    },
    {
        id: "pid-controller",
        title: "PID Controller for ROS 2",
        description: "Generic PID controller as a ROS 2 node in C++, with gains that can be changed live. Used for line following, altitude, position, velocity, and yaw.",
        tags: ["ROS 2", "C++", "Control", "Robotics"],
        github: "https://github.com/Black-Bee-Drones/pid-controller",
        image: "/images/projects/pid-controller.webp",
        featured: true,
        codeExamples: [
            {
                path: "include/pid_controller/pid.hpp",
                description: "PID controller class header",
                language: "cpp"
            },
            {
                path: "src/pid.cpp",
                description: "PID controller implementation",
                language: "cpp"
            },
            {
                path: "src/pid_controller_node.cpp",
                description: "ROS 2 node",
                language: "cpp"
            },
            {
                path: "launch/pid_controller.launch.py",
                description: "Launch file",
                language: "python"
            }
        ]
    },
    {
        id: "roboarm",
        title: "RoboArm",
        description: "4-DOF RoboCore arm controlled from a webcam. MediaPipe hand landmarks and OpenCV map gestures to base rotation, height, reach, and gripper, sent to an Arduino Uno over Firmata (pyFirmata2). Built at Fundação Asimo to teach computer vision in public schools.",
        tags: ["Computer Vision", "MediaPipe", "OpenCV", "Arduino", "Python"],
        github: "https://github.com/Fundacao-Asimo/RoboArm",
        image: "/images/projects/roboarm.webp",
        featured: true,
        codeExamples: [
            {
                path: "src/main.py",
                description: "Webcam loop and gesture-to-servo mapping",
                language: "python"
            },
            {
                path: "src/model/HandTracker.py",
                description: "MediaPipe hand tracker",
                language: "python"
            },
            {
                path: "src/control/RoboArm.py",
                description: "Arm control over Firmata",
                language: "python"
            }
        ]
    },
    {
        id: "tinyml",
        title: "TinyML Capacitor Counting",
        description: "Object detection for capacitor counting on a Seeed XIAO ESP32S3 Sense (OV2640). Edge Impulse FOMO at 96x96 RGB, exported as an int8 Arduino library with the EON Compiler. Validation F1 82.1%, precision 98%, recall 71%. Test accuracy 75.58%, precision 97%, recall 73%, F1 83%. About 1.1 s inference and 229 KB RAM on device. UNIFEI IESTI01 final project, with José Anderson dos Reis and Tony Albert Lima.",
        tags: ["TinyML", "Edge Impulse", "FOMO", "ESP32", "Object Detection"],
        pdfUrl: "/docs/tinyml-capacitor-counting.pdf",
        image: "/images/projects/tinyml.webp",
        featured: true
    },
    {
        id: "cv-hangout",
        title: "Hugging Face Computer Vision Hangout",
        description: "Invited presenter at Hugging Face's Computer Vision Hangout. Live demo and walkthrough published on Hugging Face Spaces.",
        tags: ["Computer Vision", "Hugging Face"],
        demo: "https://huggingface.co/spaces/samuellimabraz/cv-hangout",
        embedUrl: "https://samuellimabraz-cv-hangout.hf.space",
        image: "/images/projects/cv-hangout.webp",
        featured: true,
        codeExamples: [
            {
                path: "app.py",
                description: "Gradio application for the hangout demo",
                language: "python"
            }
        ]
    },
    {
        id: "peft-methods",
        title: "PEFT Methods for Language Models",
        description: "Technical writing on parameter-efficient fine-tuning (full fine-tuning, LoRA, QLoRA, IA3). On dialogue summarization, training less than 1% of parameters matched full fine-tuning closely enough to be useful. English on the Hugging Face Community Blog; Portuguese in AI News Brazil.",
        tags: ["PEFT", "LoRA", "QLoRA", "NLP"],
        article: "https://huggingface.co/blog/samuellimabraz/peft-methods",
        articleLabel: "Post",
        articlePt: "https://ainews.net.br/ajuste-fino-de-modelos-transformers-atraves-detecnicas-peft-parameter-efficient-fine-tuning/",
        pdfUrl: "https://ainews.net.br/wp-content/uploads/2025/01/Ajuste-fino-de-modelos-Transformers-atraves-de-tecnicas-PEFT-Parameter-Efficient-Fine-Tuning.pdf",
        demo: "https://colab.research.google.com/drive/1B9RsKLMa8SwTxLsxRT8g9OedK10zfBEP?usp=sharing",
        image: "/images/projects/peft-methods.webp",
        featured: true
    },
    {
        id: "cafedl",
        title: "CafeDL",
        description: "Deep learning library in Java from scratch: Conv2D, Dense, Dropout, optimizers, ND4J tensors, MongoDB persistence via Morphia, and a QuickDraw-style sketch classifier in JavaFX.",
        tags: ["Java", "Deep Learning"],
        github: "https://github.com/samuellimabraz/cafedl",
        image: "/images/projects/cafedl.webp",
        featured: true,
        codeExamples: [
            {
                path: "src/main/java/br/cafedl/neuralnetwork/examples/classification/image/qdraw/QuickDrawNN.java",
                description: "Quick Draw network training",
                language: "java"
            },
            {
                path: "src/main/java/br/cafedl/neuralnetwork/core/optimizers/Adam.java",
                description: "Adam optimizer",
                language: "java"
            },
            {
                path: "src/main/java/br/cafedl/neuralnetwork/core/layers/Dense.java",
                description: "Dense layer",
                language: "java"
            },
            {
                path: "src/main/java/br/cafedl/neuralnetwork/core/train/Trainer.java",
                description: "Trainer",
                language: "java"
            }
        ]
    },
    {
        id: "opencv-gui",
        title: "OpenCV Explorer",
        description: "Web app for trying OpenCV filters and trackers on a live webcam. Streamlit and WebRTC.",
        tags: ["Computer Vision", "OpenCV", "Streamlit", "Python"],
        github: "https://github.com/samuellimabraz/OpenCVGUI",
        demo: "https://huggingface.co/spaces/samuellimabraz/opencv-gui",
        embedUrl: "https://samuellimabraz-opencv-gui.hf.space",
        image: "/images/projects/opencv-gui.webp",
        featured: true,
        codeExamples: [
            {
                path: "src/streamlit_app.py",
                description: "Streamlit app with WebRTC video processing",
                language: "python"
            },
            {
                path: "src/opencv_utils.py",
                description: "OpenCV filters and transforms",
                language: "python"
            },
            {
                path: "src/hand_tracker.py",
                description: "Hand tracker",
                language: "python"
            },
            {
                path: "src/face_mesh_tracker.py",
                description: "Face mesh tracker",
                language: "python"
            }
        ]
    },
    {
        id: "board-bringup",
        title: "Board Bring-Up PIC18F4550",
        description: "Firmware in C for a PIC18F4550 board: event-driven state machine, LCD 16x2, ADC, RTC (MCP7940 over I2C), PWM, keypad, USB-serial (MCP2200). Monitoring application with alarm thresholds and a serial command protocol. Compiled with XC8 / MPLAB X.",
        tags: ["Embedded", "C", "PIC18F4550", "I2C"],
        github: "https://github.com/samuellimabraz/BoardBring-Up-PIC18F4550",
        image: "/images/projects/board-bringup.webp",
        featured: false,
        codeExamples: [
            {
                path: "src/main.c",
                description: "Application entry point",
                language: "c"
            },
            {
                path: "src/stateMachine.c",
                description: "State machine",
                language: "c"
            },
            {
                path: "src/lcd.c",
                description: "LCD driver",
                language: "c"
            },
            {
                path: "src/adc.c",
                description: "ADC driver",
                language: "c"
            },
            {
                path: "src/serial.c",
                description: "Serial communication",
                language: "c"
            }
        ]
    },
    {
        id: "ev3-color-sensor",
        title: "EV3 Color Sensor for Arduino",
        description: "Arduino library that talks to a LEGO EV3 color sensor over UART (SoftwareSerial). Modes: red light, blue light, color, off. Developed at Fundação Asimo.",
        tags: ["Arduino", "UART", "Embedded", "C++"],
        github: "https://github.com/Fundacao-Asimo/Ev3ColorSensor",
        image: "/images/projects/ev3-color-sensor.webp",
        featured: false,
        codeExamples: [
            {
                path: "src/Ev3ColorSensor.h",
                description: "Sensor class header",
                language: "c"
            },
            {
                path: "src/Ev3ColorSensor.cpp",
                description: "UART protocol and color read",
                language: "cpp"
            },
            {
                path: "examples/SerialRead/SerialRead.ino",
                description: "Example: one sensor",
                language: "cpp"
            },
            {
                path: "examples/SerialReadWith2Sensors/SerialReadWith2Sensors.ino",
                description: "Example: two sensors",
                language: "cpp"
            }
        ]
    },
    {
        id: "emoji-compiler",
        title: "EmojiCompiler",
        description: "UNIFEI compilers course. A C-like language whose tokens are emojis. Lexer and parser in PLY, then translation to C, compile, and run. Sample programs in data/ (HelloWorld, parity, sphere volume, input/output).",
        tags: ["Compilers", "PLY", "Python", "C"],
        github: "https://github.com/samuellimabraz/EmojiCompiler",
        image: "/images/projects/emoji-compiler.webp",
        featured: false,
        codeExamples: [
            {
                path: "main.py",
                description: "CLI: lex, parse, translate, compile",
                language: "python"
            },
            {
                path: "src/emoji_lex.py",
                description: "PLY lexer for emoji tokens",
                language: "python"
            },
            {
                path: "src/emoji_parser.py",
                description: "PLY parser",
                language: "python"
            }
        ]
    },
    {
        id: "kruskal-mst",
        title: "Kruskal MST",
        description: "UNIFEI graphs course. Kruskal's algorithm on a random graph, with frames rendered in PIL/OpenCV and assembled into a video with moviepy.",
        tags: ["Algorithms", "Graphs", "Python", "OpenCV"],
        github: "https://github.com/samuellimabraz/Kruskal_Algorithm-MST",
        demo: "https://youtube.com/shorts/o_dGmxP0Gcg",
        image: "/images/projects/kruskal-mst.webp",
        featured: false,
        codeExamples: [
            {
                path: "Graph.py",
                description: "Graph and Kruskal",
                language: "python"
            },
            {
                path: "main.py",
                description: "Frame generation and video pipeline",
                language: "python"
            },
            {
                path: "Video.py",
                description: "Video assembly",
                language: "python"
            }
        ]
    },
    {
        id: "face-api",
        title: "Face API",
        description: "Facial recognition API using DeepFace, FastAPI, and MongoDB Atlas Vector Search. Multi-tenant orgs, API keys, Redis, Docker.",
        tags: ["FastAPI", "MongoDB", "Vector Search", "Python"],
        github: "https://github.com/samuellimabraz/face-api",
        image: "/images/projects/face-api.webp",
        featured: false,
        codeExamples: [
            {
                path: "src/api/main.py",
                description: "API endpoints",
                language: "python"
            },
            {
                path: "src/infrastructure/ml/detect/deepface_detector.py",
                description: "Face detector",
                language: "python"
            },
            {
                path: "src/infrastructure/database/mongodb.py",
                description: "MongoDB vector store",
                language: "python"
            }
        ]
    },
    {
        id: "hand-mouse",
        title: "Hand Mouse Controller",
        description: "Mouse control from hand landmarks: index finger for motion, pinch to click. OpenCV and MediaPipe.",
        tags: ["Computer Vision", "MediaPipe", "Python"],
        github: "https://github.com/samuellimabraz/HandMouseController",
        image: "/images/projects/hand-mouse.webp",
        featured: false,
        codeExamples: [
            {
                path: "src/HandTracker.py",
                description: "Hand detector",
                language: "python"
            },
            {
                path: "src/main.py",
                description: "Tracking and mouse control",
                language: "python"
            }
        ]
    },
    {
        id: "educai",
        title: "EducAI",
        description: "Team project at UNIFEI. Mathematics assistant with chat, OCR for handwritten problems, and graph visualization. FastAPI, React, OlmOCR, and a Qwen Math model served with vLLM.",
        tags: ["FastAPI", "React", "OCR", "vLLM"],
        github: "https://github.com/samuellimabraz/EducAI",
        image: "/images/projects/educai.webp",
        featured: false,
        codeExamples: [
            {
                path: "backend/app/main.py",
                description: "FastAPI application",
                language: "python"
            },
            {
                path: "backend/app/services/llm_service.py",
                description: "LLM service with vLLM",
                language: "python"
            },
            {
                path: "backend/app/services/ocr_service.py",
                description: "OCR service",
                language: "python"
            }
        ]
    },
    {
        id: "agent4ai",
        title: "Agent4ai",
        description: "Conversational agent for Tech4Humans onboarding. LangGraph routes each question to company documents (Adaptive, Corrective, and Self-RAG), Tavily web search, or Google Calendar.",
        tags: ["LangGraph", "RAG", "Python"],
        github: "https://github.com/samuellimabraz/Agent4ai",
        image: "https://raw.githubusercontent.com/samuellimabraz/Agent4ai/main/images/Cohere%20Multilingual%20Model.png",
        featured: false,
        codeExamples: [
            {
                path: "agent/graph/agent.py",
                description: "LangGraph agent",
                language: "python"
            },
            {
                path: "agent/tools/base_content_tool.py",
                description: "Document retriever",
                language: "python"
            },
            {
                path: "agent/tools/calendar_tool.py",
                description: "Google Calendar tool",
                language: "python"
            },
            {
                path: "agent/graph/chains/router.py",
                description: "Router chain",
                language: "python"
            }
        ]
    },
    {
        id: "sorting-algorithms",
        title: "Sorting Algorithms",
        description: "C++ implementations of Bubble, Selection, Insertion, Shell, Merge, and Quick Sort, timed on strings and integers. A Tkinter GUI plots the times, and a small SGD linear regression approximates the curves.",
        tags: ["C++", "Algorithms", "Tkinter", "Python"],
        github: "https://github.com/samuellimabraz/SortingAlgorithms",
        image: "https://raw.githubusercontent.com/samuellimabraz/SortingAlgorithms/main/resource/screenshot.png",
        featured: false,
        codeExamples: [
            {
                path: "include/SortAlgorithm.h",
                description: "Sorting interface",
                language: "cpp"
            },
            {
                path: "include/QuickSort.h",
                description: "Quick Sort",
                language: "cpp"
            },
            {
                path: "src/main.cpp",
                description: "Benchmark runner",
                language: "cpp"
            },
            {
                path: "src/gui.py",
                description: "Tkinter GUI",
                language: "python"
            }
        ]
    }
];
