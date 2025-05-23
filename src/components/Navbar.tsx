import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { navigateToSection } from '../App';

interface NavbarProps {
  activeSection: string;
}

const Navbar: React.FC<NavbarProps> = ({ activeSection }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    // Closing the mobile menu regardless
    setMobileMenuOpen(false);

    // Use the utility function for reliable navigation
    navigateToSection(id);
  };

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'nn-playground', label: 'NN Playground' },
    { id: 'projects', label: 'Projects' },
    { id: 'work', label: 'Work' },
    { id: 'extracurricular', label: 'Activities' },
    { id: 'education', label: 'Education' },
    { id: 'certificates', label: 'Certificates' }
  ];

  return (
    <motion.header
      className={`fixed top-0 left-0 w-full z-50 ${isScrolled
        ? 'bg-dark-secondary/90 backdrop-blur-md shadow-md shadow-black/20'
        : 'bg-transparent'
        }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          <motion.div
            className="font-bold text-xl text-dark-text-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <a
              href="#home"
              className="font-mono cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('home');
              }}
            >
              Samuel Lima Braz
            </a>
          </motion.div>

          <nav className="hidden md:block">
            <ul className="flex space-x-6">
              {navItems.map((item) => (
                <motion.li key={item.id}
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                >
                  <a
                    href={`#${item.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(item.id);
                    }}
                    className={`px-1 py-2 text-sm font-medium transition-all duration-300 relative ${activeSection === item.id
                      ? 'text-dark-text-primary'
                      : 'text-dark-text-secondary hover:text-dark-text-primary'
                      }`}
                  >
                    {item.label}
                    {activeSection === item.id && (
                      <motion.span
                        className="absolute inset-x-0 -bottom-1 h-0.5 bg-dark-accent"
                        layoutId="underline"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30
                        }}
                      />
                    )}
                  </a>
                </motion.li>
              ))}
            </ul>
          </nav>

          <div className="md:hidden">
            <motion.button
              className="p-2 rounded-md text-dark-text-primary"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              whileTap={{ scale: 0.9 }}
            >
              {mobileMenuOpen ? (
                <X size={24} />
              ) : (
                <Menu size={24} />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-dark-secondary/95 backdrop-blur-lg shadow-lg"
          >
            <motion.ul
              className="px-4 py-4 space-y-2"
              initial="closed"
              animate="open"
              exit="closed"
              variants={{
                open: { transition: { staggerChildren: 0.05 } },
                closed: { transition: { staggerChildren: 0.05, staggerDirection: -1 } }
              }}
            >
              {navItems.map((item) => (
                <motion.li
                  key={item.id}
                  variants={{
                    open: { opacity: 1, y: 0 },
                    closed: { opacity: 0, y: -10 }
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <a
                    href={`#${item.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(item.id);
                    }}
                    className={`block w-full text-left px-4 py-3 rounded-md text-sm font-medium transition-colors ${activeSection === item.id
                      ? 'bg-dark-accent text-dark-text-primary'
                      : 'hover:bg-dark-tertiary text-dark-text-secondary hover:text-dark-text-primary'
                      }`}
                  >
                    {item.label}
                  </a>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;