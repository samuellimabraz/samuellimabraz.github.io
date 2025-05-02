import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { SectionProps } from '../lib/types';
import { FaBrain } from 'react-icons/fa';

interface Node {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  color?: string;
}

interface Connection {
  from: number;
  to: number;
}

const HeroSection: React.FC<SectionProps> = ({ scrollDirection }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [typedText, setTypedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [textIndex, setTextIndex] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);
  const nodesRef = useRef<Node[]>([]);
  const connectionsRef = useRef<Connection[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  // List of expertise areas to display in the typing animation
  const expertiseAreas = [
    "Machine Learning Engineer",
    "Computer Vision",
    "Autonomous Drone",
    "Fine Tuning",
    "PyTorch & Transformers",
    "PEFT Techniques",
    "AI Deployment",
    "Neural Networks",
    "Model Optimization"
  ];

  // Typing animation effect
  useEffect(() => {
    const currentText = expertiseAreas[textIndex];

    const typingEffect = () => {
      if (isDeleting) {
        // Deleting mode
        setTypedText(currentText.substring(0, typedText.length - 1));
        setTypingSpeed(20); // Faster when deleting
      } else {
        // Typing mode
        setTypedText(currentText.substring(0, typedText.length + 1));
        setTypingSpeed(80); // Slower when typing
      }

      // If we've completed typing the word
      if (!isDeleting && typedText === currentText) {
        // Pause at the end of typing before starting to delete
        setTimeout(() => setIsDeleting(true), 1500);
      }

      // If we've deleted the word
      if (isDeleting && typedText === '') {
        setIsDeleting(false);
        // Move to the next word
        setTextIndex((prev) => (prev + 1) % expertiseAreas.length);
      }
    };

    const timer = setTimeout(typingEffect, typingSpeed);

    return () => clearTimeout(timer);
  }, [typedText, isDeleting, textIndex, typingSpeed, expertiseAreas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let mouseX = 0;
    let mouseY = 0;

    // Use custom colors for nodes that match your tech stack and dark theme
    const colors = [
      'rgba(109, 119, 246, 0.7)', // dark-accent
      'rgba(125, 130, 240, 0.7)',  // dark-text-accent
      'rgba(200, 100, 255, 0.7)', // pink/purple
      'rgba(64, 185, 169, 0.7)', // green-ish
      'rgba(245, 158, 11, 0.7)',  // amber
    ];

    const nodeCount = 400; // Increased for more visual density

    // Initialize canvas and generate nodes/connections
    const initializeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Clear previous nodes and connections
      nodesRef.current = [];
      connectionsRef.current = [];

      // Generate new nodes based on current canvas dimensions
      for (let i = 0; i < nodeCount; i++) {
        nodesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 3 + 1,
          vx: Math.random() * 1 - 0.5,
          vy: Math.random() * 1 - 0.5,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }

      // Create connections
      for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
          if (Math.random() > 0.95) { // Slightly increased connection probability
            connectionsRef.current.push({
              from: i,
              to: j
            });
          }
        }
      }
    };

    // Initialize canvas on mount
    initializeCanvas();

    // Resize handler
    const handleResize = () => {
      const oldWidth = canvas.width;
      const oldHeight = canvas.height;

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Scale existing nodes to new dimensions
      if (nodesRef.current.length > 0) {
        nodesRef.current.forEach(node => {
          // Scale coordinates proportionally
          node.x = (node.x / oldWidth) * canvas.width;
          node.y = (node.y / oldHeight) * canvas.height;

          // Ensure nodes stay within boundaries
          node.x = Math.min(Math.max(node.x, 0), canvas.width);
          node.y = Math.min(Math.max(node.y, 0), canvas.height);
        });
      } else {
        // If no nodes exist (this shouldn't happen), initialize them
        initializeCanvas();
      }
    };

    // Interactive effect - nodes respond to mouse
    const handleMouseMove = (event: MouseEvent) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      nodesRef.current.forEach((node, idx) => {
        // Apply slight attraction to mouse position
        const dx = mouseX - node.x;
        const dy = mouseY - node.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 200) {
          const force = 0.02;
          node.vx += (dx / distance) * force;
          node.vy += (dy / distance) * force;
        }

        // Apply some damping to prevent too much acceleration
        node.vx *= 0.99;
        node.vy *= 0.99;

        node.x += node.vx;
        node.y += node.vy;

        // Bounce off edges - ensure nodes stay within the canvas
        if (node.x < 0 || node.x > canvas.width) {
          node.vx *= -1;
          node.x = Math.min(Math.max(node.x, 0), canvas.width);
        }
        if (node.y < 0 || node.y > canvas.height) {
          node.vy *= -1;
          node.y = Math.min(Math.max(node.y, 0), canvas.height);
        }

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color || 'rgba(109, 119, 246, 0.5)';
        ctx.fill();
      });

      connectionsRef.current.forEach(connection => {
        const fromNode = nodesRef.current[connection.from];
        const toNode = nodesRef.current[connection.to];

        if (!fromNode || !toNode) return;

        const dx = toNode.x - fromNode.x;
        const dy = toNode.y - fromNode.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 200) {
          ctx.beginPath();
          ctx.moveTo(fromNode.x, fromNode.y);
          ctx.lineTo(toNode.x, toNode.y);

          // Use gradient colors for connections
          const gradient = ctx.createLinearGradient(fromNode.x, fromNode.y, toNode.x, toNode.y);
          gradient.addColorStop(0, fromNode.color || 'rgba(109, 119, 246, 0.2)');
          gradient.addColorStop(1, toNode.color || 'rgba(109, 119, 246, 0.2)');

          ctx.strokeStyle = gradient;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      });

      animationFrameRef.current = requestAnimationFrame(render);
    };

    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);

    // Start animation loop
    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Animation variants for text elements
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  // Blinking cursor animation
  const cursorVariants = {
    blinking: {
      opacity: [0, 1, 0],
      transition: {
        duration: 1,
        repeat: Infinity,
        repeatType: "loop" as const,
        ease: "linear",
      },
    },
  };

  // Pulsing animation for Neural Network button
  const pulseVariants = {
    pulse: {
      scale: [1, 1.03, 1],
      boxShadow: [
        "0 0 0 0 rgba(109, 119, 246, 0.4)",
        "0 0 0 10px rgba(109, 119, 246, 0)",
        "0 0 0 0 rgba(109, 119, 246, 0)"
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "loop" as const,
      },
    },
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-dark-primary">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full z-0"
      />

      <motion.div
        className="container mx-auto px-4 md:px-6 z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div className="max-w-3xl mx-auto text-center">
          <motion.h1
            className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-dark-text-primary"
            variants={itemVariants}
          >
            <motion.div className="flex flex-col md:flex-row md:justify-center items-center">
              <motion.span
                className="md:mr-3"
                variants={itemVariants}
              >
                Samuel Lima
              </motion.span>
              <motion.span
                className="font-mono text-3xl md:text-5xl opacity-80 text-dark-text-secondary"
                variants={itemVariants}
              >
                Braz
              </motion.span>
            </motion.div>
          </motion.h1>

          <motion.div
            className="text-lg md:text-xl mb-8 font-light leading-relaxed h-8 flex justify-center items-center"
            variants={itemVariants}
          >
            <span className="font-medium text-dark-text-accent">{typedText}</span>
            <motion.span
              className="w-1 h-6 ml-1 inline-block bg-dark-text-accent"
              variants={cursorVariants}
              animate="blinking"
            />
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-4"
            variants={itemVariants}
          >
            <motion.a
              href="#projects"
              className="px-8 py-3 bg-dark-accent text-dark-text-primary font-medium rounded-md hover:bg-dark-text-accent transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View Projects
            </motion.a>
            <motion.a
              href="#about"
              className="px-8 py-3 bg-dark-tertiary text-dark-text-primary font-medium rounded-md border border-dark-border hover:bg-dark-secondary transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              About Me
            </motion.a>
            <motion.a
              href="#nn-playground"
              className="px-8 py-3 text-dark-text-primary font-medium rounded-md flex items-center justify-center bg-dark-secondary"
              whileHover={{ scale: 1.05, backgroundColor: "#273045" }}
              whileTap={{ scale: 0.95 }}
              variants={pulseVariants}
              animate="pulse"
            >
              <FaBrain className="mr-2 text-lg text-dark-accent" />
              Neural Network
            </motion.a>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute bottom-8 left-0 right-0 flex justify-center text-dark-text-secondary"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </motion.div>
    </section>
  );
};

export default HeroSection;