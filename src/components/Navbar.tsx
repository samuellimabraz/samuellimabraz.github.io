import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

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
    
    // If we're already on the same hash, manually scroll
    if (location.hash === `#${id}`) {
      const element = document.getElementById(id);
      if (element) {
        window.scrollTo({
          top: element.offsetTop - 70,
          behavior: 'smooth'
        });
      }
    }
    // Otherwise, navigation happens automatically through the Link component
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
        ? 'bg-white/90 backdrop-blur-md shadow-sm'
        : 'bg-transparent'
        }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          <motion.div
            className="font-bold text-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/#home" className="font-mono cursor-pointer" onClick={() => scrollToSection('home')}>
              Samuel Lima Braz
            </Link>
          </motion.div>

          <nav className="hidden md:block">
            <ul className="flex space-x-6">
              {navItems.map((item) => (
                <motion.li key={item.id}
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                >
                  <Link
                    to={`/#${item.id}`}
                    onClick={() => scrollToSection(item.id)}
                    className={`px-1 py-2 text-sm font-medium transition-all duration-300 relative ${activeSection === item.id
                      ? 'text-black'
                      : 'text-gray-600 hover:text-gray-900'
                      }`}
                  >
                    {item.label}
                    {activeSection === item.id && (
                      <motion.span
                        className="absolute inset-x-0 -bottom-1 h-0.5 bg-black"
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
                  </Link>
                </motion.li>
              ))}
            </ul>
          </nav>

          <div className="md:hidden">
            <motion.button
              className="p-2 rounded-md"
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
            className="md:hidden bg-white/95 backdrop-blur-lg shadow-lg"
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
                  <Link
                    to={`/#${item.id}`}
                    onClick={() => scrollToSection(item.id)}
                    className={`block w-full text-left px-4 py-3 rounded-md text-sm font-medium transition-colors ${activeSection === item.id
                      ? 'bg-black text-white'
                      : 'hover:bg-gray-100'
                      }`}
                  >
                    {item.label}
                  </Link>
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