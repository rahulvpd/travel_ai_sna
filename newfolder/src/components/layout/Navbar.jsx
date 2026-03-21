import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Destinations', path: '/destinations' },
        { name: 'Trip Planner', path: '/planner' },
        { name: 'Food & Culture', path: '/food' },
        { name: 'Travel Tools', path: '/tools' },
    ];

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
                ? 'bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-[0_0_30px_rgba(255,204,0,0.2)]'
                : 'bg-black/30 backdrop-blur-sm'
                }`}
        >
            <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/">
                        <motion.div
                            className="flex items-center gap-3 group"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <div className="relative">
                                <Compass className="w-8 h-8 text-vibrant-gold group-hover:rotate-180 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-vibrant-gold blur-lg opacity-0 group-hover:opacity-50 transition-opacity" />
                            </div>
                            <span className="font-heading text-2xl font-bold bg-gradient-to-r from-vibrant-gold to-vibrant-pink bg-clip-text text-transparent">
                                Tamil Nadu
                            </span>
                        </motion.div>
                    </Link>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link key={link.path} to={link.path}>
                                <motion.span
                                    className={`relative font-medium transition-colors ${location.pathname === link.path
                                        ? 'text-vibrant-gold'
                                        : 'text-white/80 hover:text-white'
                                        }`}
                                    whileHover={{ y: -2 }}
                                >
                                    {link.name}
                                    {location.pathname === link.path && (
                                        <motion.div
                                            layoutId="navbar-indicator"
                                            className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-vibrant-gold to-vibrant-pink"
                                            initial={false}
                                        />
                                    )}
                                </motion.span>
                            </Link>
                        ))}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden text-white hover:text-vibrant-gold transition-colors"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-black/95 backdrop-blur-xl border-t border-white/10"
                    >
                        <div className="container mx-auto px-6 py-6 space-y-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <motion.div
                                        whileTap={{ scale: 0.95 }}
                                        className={`text-lg font-medium ${location.pathname === link.path
                                            ? 'text-vibrant-gold'
                                            : 'text-white/80'
                                            }`}
                                    >
                                        {link.name}
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default Navbar;
