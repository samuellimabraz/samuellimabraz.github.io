import React from 'react';
import { Github, Linkedin, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-dark-primary py-12 border-t border-dark-border">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <h3 className="text-xl font-bold mb-2 text-dark-text-primary">Samuel Lima Braz</h3>
            <p className="text-dark-text-secondary">Machine Learning Engineer</p>
          </div>

          <div className="flex space-x-6">
            <a
              href="mailto:samuellimabraz@gmail.com"
              className="text-dark-text-secondary hover:text-dark-text-primary transition-colors"
            >
              <span className="sr-only">Email</span>
              <Mail />
            </a>
            <a
              href="https://github.com/samuellimabraz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-dark-text-secondary hover:text-dark-text-primary transition-colors"
            >
              <span className="sr-only">GitHub</span>
              <Github />
            </a>
            <a
              href="https://br.linkedin.com/in/samuel-lima-braz/en"
              target="_blank"
              rel="noopener noreferrer"
              className="text-dark-text-secondary hover:text-dark-text-primary transition-colors"
            >
              <span className="sr-only">LinkedIn</span>
              <Linkedin />
            </a>
            <a
              href="https://huggingface.co/samuellimabraz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-dark-text-secondary hover:text-dark-text-primary transition-colors"
            >
              <span className="sr-only">Hugging Face</span>
              <img
                src="https://huggingface.co/front/assets/huggingface_logo-noborder.svg"
                alt="Hugging Face Logo"
                width="24"
                height="24"
                className="inline-block"
              />
            </a>
          </div>
        </div>

        <div className="border-t border-dark-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-dark-text-secondary/70 mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Samuel Lima Braz. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;