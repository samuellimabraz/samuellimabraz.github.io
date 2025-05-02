import React from 'react';
import { motion } from 'framer-motion';
import { SectionProps } from '../lib/types';
import NNPlayground from './NNPlayground';

const NNPlaygroundSection: React.FC<SectionProps> = ({ scrollDirection }) => {
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
        <section id="nn-playground" className="py-20 bg-dark-secondary">
            <div className="container mx-auto px-4">
                <motion.div
                    className="text-center mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true, margin: "-100px" }}
                >
                    <h2 className="text-3xl font-bold mb-3 text-dark-text-primary">Neural Network Playground</h2>
                    <p className="text-dark-text-secondary max-w-2xl mx-auto">
                        An interactive visualization of neural networks built with TypeScript and React.
                        Explore how neural networks learn to approximate various non-linear functions through real-time training.
                    </p>
                </motion.div>

                <div className="bg-dark-tertiary rounded-xl shadow-lg shadow-black/10 p-6 border border-dark-border">
                    <NNPlayground />
                </div>
            </div>
        </section>
    );
};

export default NNPlaygroundSection; 