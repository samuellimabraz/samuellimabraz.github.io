import { Project } from '../lib/types';

export const projects: Project[] = [
    {
        id: "nectar-sdk",
        title: "Nectar SDK",
        description: "ROS 2 kit with one flight interface for ArduPilot and PX4 (MAVROS, MAVLink, uXRCE-DDS), plus Bebop and Crazyflie; a camera factory (RealSense, OAK-D, USB, ROS topics); and detection, segmentation, and classification (YOLO, DETR, RF-DETR). PID navigation with GPS waypoint missions, obstacle handling from a depth camera, Gazebo SITL, and Docker images for x86_64 and ARM64. Built for Black Bee Drones as the shared software for competition missions.",
        tags: ["ROS 2", "Robotics", "Computer Vision", "Python", "OpenCV"],
        areas: ["vision", "robotics", "localization", "edge", "training", "software"],
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
        areas: ["training", "llm"],
        github: "https://github.com/samuellimabraz/quantum-assistant",
        demo: "https://huggingface.co/spaces/samuellimabraz/quantum-assistant",
        article: "https://www.sciencedirect.com/science/article/pii/S0957417426028381",
        articleLabel: "Paper",
        pdfUrl: "/docs/quantum-assistant.pdf",
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
        id: "sae-2026",
        title: "SAE EletroQuad 2026 (2nd Place Overall)",
        description: "YOLO instance segmentation of the sphere and hose for \"Hang the Right Wire\", and tiled gauge detection with PID centering for \"Faulty or Not?\". YASMIN state machines on Nectar SDK. Competição EletroQuad SAE BRASIL – AXIA Energia 2026: three outdoor GPS missions with a standardized quadrotor.",
        tags: ["ROS 2", "Instance Segmentation", "YOLO", "Nectar SDK", "Python"],
        areas: ["vision", "robotics", "localization", "edge"],
        github: "https://github.com/Black-Bee-Drones/SAE-2026",
        image: "/images/competitions/sae-2026-team.webp",
        featured: false,
        codeExamples: [
            {
                path: "hook/hook/core/perception.py",
                description: "Hook mission perception: segmentation filters, sphere and hose selection, hose pose",
                language: "python"
            },
            {
                path: "hook/hook/core/states.py",
                description: "Hook mission states: concurrent drone, camera, and segmentation-model init",
                language: "python"
            },
            {
                path: "faulty_or_not/faulty_or_not/states/gauge_reading.py",
                description: "Gauge reading: tiled detection and PID centering on the manometer",
                language: "python"
            }
        ]
    },
    {
        id: "signature-detection",
        title: "Signature Detection Model",
        description: "Open-source signature detector. Hybrid dataset with public samples and rotation, shear, brightness, blur, and noise augmentations. Compared YOLO (v8 to v12), DETR, and YOLOS; chose YOLOv8s. Optuna search added 7.94 percentage points F1 and raised recall from 76.2% to 91.2%. Served on NVIDIA Triton with ONNX/OpenVINO; 172 ms on CPU with ONNX Runtime. Code, weights, data, and report are public. Hugging Face blog post with more than 100 upvotes.",
        tags: ["Computer Vision", "PyTorch", "ONNX", "OpenVINO", "Triton"],
        areas: ["vision", "edge", "training"],
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
        id: "imav-2025",
        title: "IMAV 2025 Indoor (3rd Place)",
        description: "YOLO gate and platform detectors drive a sweep search, proportional alignment through the gate tunnel, and descent onto a platform moving in smoke. Isaac ROS Visual SLAM on a Jetson Orin Nano for indoor positioning; YASMIN state machines on Nectar SDK. 16th International Micro Air Vehicle Conference and Competition, Puebla, Mexico.",
        tags: ["ROS 2", "YOLO", "Isaac ROS", "Nectar SDK", "Python"],
        areas: ["vision", "robotics", "localization", "edge"],
        github: "https://github.com/Black-Bee-Drones/imav-2025",
        image: "/images/competitions/det-imav25-gate.webp",
        featured: false,
        codeExamples: [
            {
                path: "indoor/indoor/missions/gate/sm.py",
                description: "Gate mission state machine",
                language: "python"
            },
            {
                path: "indoor/indoor/missions/gate/states.py",
                description: "Gate states: sweep search with streaming detection, proportional alignment",
                language: "python"
            },
            {
                path: "indoor/indoor/missions/platform/states.py",
                description: "Moving-platform states: forward search, pre-centering, and descent",
                language: "python"
            }
        ]
    },
    {
        id: "chunkr-layout",
        title: "Chunkr Layout 1",
        description: "Synthetic document-layout generator from statistics of real pages (positions, co-occurrence, size), with an element pool in SQLite. Pretrained RF-DETR and YOLO on synthetic pages (up to 500K) mixed with real data, then fine-tuned on real data. Fine-tuned LayoutLMv3-Large for reading order: 88.1% exact match and 98.2% Kendall's tau on an open benchmark (733 samples). Served on NVIDIA Triton.",
        tags: ["Computer Vision", "Synthetic Data", "YOLO", "Triton"],
        areas: ["vision", "edge", "training", "llm"],
        article: "https://chunkr.ai/blog/introducing-chunkr-layout-1-state-of-the-art-document-layout-analysis",
        articleLabel: "Post",
        demo: "https://huggingface.co/datasets/ChunkrAI/chunkr-reading-order-bench-oss",
        image: "/images/projects/chunkr-layout.webp",
        featured: true
    },
    {
        id: "vision-to-mavros",
        title: "Vision to MAVROS for ROS 2",
        description: "ROS 2 C++ port of vision_to_mavros that bridges visual pose estimation (Intel RealSense T265) to ArduPilot through MAVROS, rotating camera poses into the ENU body frame with TF2. Launch files also run Isaac ROS Visual SLAM with a D435i and relay its pose with covariance to MAVROS. Used for indoor GPS-denied flight on Black Bee vehicles.",
        tags: ["ROS 2", "Robotics", "ArduPilot", "RealSense", "C++"],
        areas: ["robotics", "localization"],
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
        id: "cafedl",
        title: "CafeDL",
        description: "Deep learning library from scratch in Java: hand-written forward and backward passes for Conv2D, max pooling, dense, and dropout layers, 8 optimizers (SGD to Adam), losses, and a training loop with early stopping. No autograd; ND4J only for array math. Trained a QuickDraw sketch classifier used in a JavaFX game.",
        tags: ["Java", "Deep Learning"],
        areas: ["vision", "training", "software"],
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
        id: "imav-2023",
        title: "IMAV 2023 Indoor (3rd Place, Special Achievement Award)",
        description: "Line following with OpenCV (Hough, rotated rectangle, and ellipse fits), ArUco search, and PID alignment, orchestrated by a SMACH state machine on ROS. 14th International Micro Air Vehicle Conference and Competition, Aachen, Germany: indoor stacking challenge with pickup, transport along a guided route, and release. Only team to complete the indoor course fully autonomously.",
        tags: ["ROS", "OpenCV", "ArUco", "PID", "Python"],
        areas: ["vision", "robotics", "localization"],
        github: "https://github.com/Black-Bee-Drones/imav2023-indoor",
        image: "/images/competitions/ext-imav23-line.webp",
        featured: false,
        codeExamples: [
            {
                path: "indoor/src/state_machine.py",
                description: "Mission state machine (SMACH) with ArUco search",
                language: "python"
            },
            {
                path: "indoor/src/follow_line/LineDetector.py",
                description: "Line detector: Hough, rotated rect, and ellipse fits",
                language: "python"
            },
            {
                path: "indoor/src/aruco_control/aruco_control_node.py",
                description: "ArUco alignment node with x/y PID controllers",
                language: "python"
            }
        ]
    },
    {
        id: "pid-controller",
        title: "PID Controller for ROS 2",
        description: "Generic PID controller as a ROS 2 node and composable component in C++, with anti-windup, output limits, and gains that can be changed live. Used for red-hose centering and blue-line following in SAE 2025.",
        tags: ["ROS 2", "C++", "Control", "Robotics"],
        areas: ["robotics"],
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
        id: "peft-methods",
        title: "PEFT Methods for Language Models",
        description: "Technical writing on parameter-efficient fine-tuning (full fine-tuning, LoRA, QLoRA, IA3). On dialogue summarization, QLoRA trained less than 1% of parameters, used 55% less memory, and scored best on every automatic metric. English on the Hugging Face Community Blog; Portuguese in AI News Brazil.",
        tags: ["PEFT", "LoRA", "QLoRA", "NLP"],
        areas: ["training", "llm"],
        article: "https://huggingface.co/blog/samuellimabraz/peft-methods",
        articleLabel: "Post",
        articlePt: "https://ainews.net.br/ajuste-fino-de-modelos-transformers-atraves-detecnicas-peft-parameter-efficient-fine-tuning/",
        pdfUrl: "https://ainews.net.br/wp-content/uploads/2025/01/Ajuste-fino-de-modelos-Transformers-atraves-de-tecnicas-PEFT-Parameter-Efficient-Fine-Tuning.pdf",
        demo: "https://colab.research.google.com/drive/1B9RsKLMa8SwTxLsxRT8g9OedK10zfBEP?usp=sharing",
        image: "/images/projects/peft-methods.webp",
        featured: true
    },
    {
        id: "cbr-2025",
        title: "CBR 2025 Flying Robots League",
        description: "Isaac ROS Visual SLAM on a Jetson Orin Nano in place of GPS. YOLO finds landing bases and packages, a YOLO pose model reads body gestures, and YASMIN state machines run mapping, package pickup with a servo gripper, and human-swarm interaction. Competição Brasileira de Robótica PETROBRAS 2025, Vitória, Brazil.",
        tags: ["ROS 2", "Isaac ROS", "YOLO", "Pose Estimation", "Python"],
        areas: ["vision", "robotics", "localization", "edge"],
        github: "https://github.com/Black-Bee-Drones/cbr-2025",
        image: "/images/competitions/cbr-2025-arena.webp",
        featured: false,
        codeExamples: [
            {
                path: "delivery/delivery/state_machines/pickup_sm.py",
                description: "Phase 2: package pickup state machine",
                language: "python"
            },
            {
                path: "delivery/delivery/utils/yolo_detector.py",
                description: "YOLO detector wrapper: best detection, filtering inside a region",
                language: "python"
            },
            {
                path: "interaction/interaction/sm_interaction.py",
                description: "Phase 3: human-swarm interaction state machine",
                language: "python"
            }
        ]
    },
    {
        id: "roboarm",
        title: "RoboArm",
        description: "4-DOF RoboCore arm controlled from a webcam. MediaPipe hand landmarks and OpenCV map gestures to base rotation, height, reach, and gripper, sent to an Arduino Uno over Firmata (pyFirmata2). Built at Fundação Asimo to teach computer vision in public schools.",
        tags: ["Computer Vision", "MediaPipe", "OpenCV", "Arduino", "Python"],
        areas: ["vision", "robotics", "embedded"],
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
        areas: ["vision", "edge", "training", "embedded"],
        pdfUrl: "/docs/tinyml-capacitor-counting.pdf",
        image: "/images/projects/tinyml.webp",
        featured: true
    },
    {
        id: "sae-2025",
        title: "SAE EletroQuad 2025",
        description: "HSV colour filters for the slalom posts, red-hose centering for Hang the Hook, and an ONNX YOLOv11n detector with proportional landing control for Bouncing. ArduPilot through MAVROS, YASMIN state machines. First edition of the Competição EletroQuad SAE BRASIL – Eletrobras, São José dos Campos, Brazil.",
        tags: ["ROS 2", "OpenCV", "YOLO", "ONNX", "ArduPilot"],
        areas: ["vision", "robotics", "localization", "edge"],
        github: "https://github.com/Black-Bee-Drones/SAE-Eletroquad",
        image: "/images/competitions/sae-2025-me.webp",
        featured: false,
        codeExamples: [
            {
                path: "slalom/slalom/slalom_mission.py",
                description: "Slalom mission state machine",
                language: "python"
            },
            {
                path: "hook/hook/states/hook_operations/center_red_blob.py",
                description: "Hang the Hook: red-hose detection and centering states",
                language: "python"
            },
            {
                path: "bouncing/bouncing/ai/yolo/inference_onnx.py",
                description: "Bouncing: ONNX Runtime YOLO inference for the ground figures",
                language: "python"
            }
        ]
    },
    {
        id: "imav-2024",
        title: "IMAV 2024 Indoor and Outdoor",
        description: "Indoor: a five-task circuit (image capture, gate passage, precision landing, package delivery, line following) built as hierarchical YASMIN state machines with ArUco navigation. Outdoor: YOLO zebra detection with GPS coordinate mapping for a wildlife census. 15th International Micro Air Vehicle Conference and Competition, Bristol, UK.",
        tags: ["ROS 2", "YOLO", "ArUco", "GPS", "Python"],
        areas: ["vision", "robotics", "localization", "edge"],
        github: "https://github.com/Black-Bee-Drones/imav-2024",
        image: "/images/competitions/det-zebra.webp",
        featured: false,
        codeExamples: [
            {
                path: "indoor/indoor/tasks/mangalarga.py",
                description: "Indoor mission: top-level state machine chaining the five tasks",
                language: "python"
            },
            {
                path: "indoor/indoor/tasks/subtasks/aruco_control/aruco_centralize_state.py",
                description: "ArUco centering state",
                language: "python"
            },
            {
                path: "outdoor/outdoor/animal_census/zebras_folder/zebra_counter.py",
                description: "Outdoor census: YOLO zebra detection and GPS geolocation",
                language: "python"
            }
        ]
    },
    {
        id: "cv-hangout",
        title: "Hugging Face Computer Vision Hangout",
        description: "Invited presenter at Hugging Face's Computer Vision Hangout: autonomous drone missions at Black Bee, the hand-tracking robot arm at Fundação Asimo, CafeDL, and signature detection and VLM fine-tuning for document extraction at Tech4Humans. Live demo and walkthrough published on Hugging Face Spaces.",
        tags: ["Computer Vision", "Hugging Face"],
        areas: ["vision", "llm"],
        demo: "https://huggingface.co/spaces/samuellimabraz/cv-hangout",
        embedUrl: "https://samuellimabraz-cv-hangout.hf.space",
        image: "/images/projects/cv-hangout.webp",
        featured: true,
        codeExamples: [
            {
                path: "app.py",
                description: "Streamlit application for the hangout demo",
                language: "python"
            }
        ]
    },
    {
        id: "board-bringup",
        title: "Board Bring-Up PIC18F4550",
        description: "Firmware in C for a PIC18F4550 board: event-driven state machine, LCD 16x2, ADC, RTC (MCP7940 over I2C), PWM, keypad, USB-serial (MCP2200). Monitoring application with alarm thresholds and a serial command protocol. Compiled with XC8 / MPLAB X.",
        tags: ["Embedded", "C", "PIC18F4550", "I2C"],
        areas: ["embedded"],
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
        id: "face-api",
        title: "Face API",
        description: "Facial recognition API using DeepFace, FastAPI, and MongoDB Atlas Vector Search. Multi-tenant orgs, API keys, Redis, Docker.",
        tags: ["FastAPI", "MongoDB", "Vector Search", "Python"],
        areas: ["vision", "software"],
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
        id: "ev3-color-sensor",
        title: "EV3 Color Sensor for Arduino",
        description: "Arduino library that talks to a LEGO EV3 color sensor over UART (SoftwareSerial). Modes: red light, blue light, color, off. Developed with Tony Albert Lima at Fundação Asimo.",
        tags: ["Arduino", "UART", "Embedded", "C++"],
        areas: ["embedded"],
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
        id: "hand-mouse",
        title: "Hand Mouse Controller",
        description: "Mouse control from hand landmarks: index finger moves the cursor, touching the index and middle fingertips clicks, and a thumb–index pinch presses space. OpenCV, MediaPipe, and PyAutoGUI.",
        tags: ["Computer Vision", "MediaPipe", "Python"],
        areas: ["vision"],
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
        areas: ["llm", "software"],
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
        areas: ["llm", "software"],
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
        id: "opencv-gui",
        title: "OpenCV Explorer",
        description: "Web app for trying OpenCV filters, ArUco detection, optical flow, and MediaPipe hand and face-mesh landmarks on a live webcam. Streamlit and WebRTC.",
        tags: ["Computer Vision", "OpenCV", "Streamlit", "Python"],
        areas: ["vision"],
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
        id: "sorting-algorithms",
        title: "Sorting Algorithms",
        description: "C++ implementations of Bubble, Selection, Insertion, Shell, Merge, and Quick Sort, timed on strings and integers. A Tkinter GUI plots the times, and a small SGD linear regression approximates the curves.",
        tags: ["C++", "Algorithms", "Tkinter", "Python"],
        areas: ["software"],
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
    },
    {
        id: "kruskal-mst",
        title: "Kruskal MST",
        description: "UNIFEI graphs course. Kruskal's algorithm on a random graph, with frames drawn in PIL, assembled into a video with OpenCV, and given audio with moviepy.",
        tags: ["Algorithms", "Graphs", "Python", "OpenCV"],
        areas: ["software"],
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
        id: "emoji-compiler",
        title: "EmojiCompiler",
        description: "UNIFEI compilers course. A C-like language whose tokens are emojis. Lexer and parser in PLY, then translation to C, compile, and run. Sample programs in data/ (HelloWorld, parity, sphere volume, input/output).",
        tags: ["Compilers", "PLY", "Python", "C"],
        areas: ["software"],
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
    }
];
