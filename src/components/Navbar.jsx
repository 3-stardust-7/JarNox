import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isDisposablesOpen, setIsDisposablesOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const navbarRef = useRef(null);
  const desktopDropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      setIsScrolled(currentScrollY > 50);
      
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100 && !isProductsOpen && !isDisposablesOpen) {
        setIsVisible(false);
        setIsMenuOpen(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, isProductsOpen, isDisposablesOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to reset overflow when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // For desktop view - check if click is outside the dropdown
      if (window.innerWidth >= 1024) {
        if (desktopDropdownRef.current && !desktopDropdownRef.current.contains(event.target)) {
          setIsProductsOpen(false);
          setIsDisposablesOpen(false);
        }
      } else {
        // For mobile view - check if click is outside the entire navbar
        if (navbarRef.current && !navbarRef.current.contains(event.target)) {
          setIsMenuOpen(false);
          setIsProductsOpen(false);
          setIsDisposablesOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  const menuVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };
 
  const dropdownVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  return (<>
    <motion.nav 
      ref={navbarRef}
      className="fixed top-0 w-full z-30"
      initial={false}
      animate={{
        y: isVisible ? 0 : -100,
        opacity: isVisible ? 1 : 0
      }}
      transition={{ 
        duration: 0.3, 
        ease: "easeInOut" 
      }}
    >
      {!isScrolled && (
        <div className="absolute inset-0 z-[-2] bg-white transition-opacity duration-300" />
      )}

      <motion.div
        initial={false}
        animate={{
          backgroundColor: isScrolled ? "rgba(255, 255, 255, 0.95)" : "rgba(255,255,255,0)",
          backdropFilter: isScrolled ? "blur(12px)" : "blur(0px)",
        }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className={`absolute inset-0 z-[-1] transition-all duration-500 ${
          isScrolled ? 'shadow-xl border-b border-gray-200/50' : ''
        }`}
      />

      <div className=" md:max-w-full px-4 sm:px-6 mx-auto lg:px-8 2xl:px-60">
        <div className="flex lg:flex-col 2xl:flex-row justify-between items-center h-16 sm:h-20 mb-0 lg:mb-4 2xl:mb-0">
          {/* Logo Section */}
                    <div className="flex items-center space-x-3">
                    
                        <h1 className="text-gray-800 hover:text-blue-900 font-sans font-semibold text-2xl sm:text-3xl 2xl:text-4xl transition-colors duration-200 relative group">
                          JarNox
                        </h1>
                     
                    </div>
        

        </div>

        {/* Mobile Menu */}
   <AnimatePresence>
       {isMenuOpen && (
         <div className="absolute inset-0 lg:hidden z-40 ">
           <motion.div 
             className="max-h-screen  rounded rounded-b-2xl  overflow-y-auto bg-white shadow-2xl px-4 pt-4 "
             variants={menuVariants}
             initial="hidden"
             animate="visible"
             exit="exit"
             transition={{ duration: 0.3 }}
           >
                  <div className="flex items-center space-x-3">
           
                 <div>
                   <h1 className="text-gray-800 hover:text-blue-900 font-sans font-semibold text-2xl sm:text-4xl transition-colors duration-200 relative group">
                     JarNoxy
                   </h1>
                 </div>
               </div>
     
                   <div className="px-2  space-y-2 mb-4">
                     <a
                       href="/"
                       className="block text-gray-700 rounded rounded-xl hover:text-green-700 font-bold text-lg p-3 transition duration-200 hover:shadow-lg"
                       style={{ WebkitTapHighlightColor: 'transparent' }}
                     >
                       Home
                     </a>


                   </div>
                   
                 </motion.div>
                    </div>
                      )}           
                      
     </AnimatePresence>
      </div>
    </motion.nav>
    </>
  );
};

export default Navbar;