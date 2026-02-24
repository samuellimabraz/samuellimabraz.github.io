import React from 'react';
import { motion } from 'framer-motion';
import { SectionProps } from '../lib/types';
import NNPlayground from './NNPlayground';

const NNPlaygroundSection: React.FC<SectionProps> = ({ }) => {

    return (
        <section id="nn-playground" className="py-20 bg-light-secondary">
            <div className="container mx-auto px-4">
                <motion.div
                    className="text-center mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true, margin: "-100px" }}
                >
                    <h2 className="text-3xl font-bold mb-3 text-light-text-primary">Neural Network Playground</h2>
                    <p className="text-light-text-secondary max-w-2xl mx-auto">
                        An interactive visualization of dense neural networks built with TypeScript and React.
                        Explore how neural networks learn to approximate various non-linear functions through real-time training.
                    </p>
                </motion.div>

                <div className="bg-light-primary shadow-lg shadow-black/10 p-6 border border-light-border">
                    <NNPlayground />
                </div>
            </div>
        </section>
    );
};

export default NNPlaygroundSection; 