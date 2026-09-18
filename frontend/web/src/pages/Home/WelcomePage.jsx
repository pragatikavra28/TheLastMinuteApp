import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Zap, Clock, Shield, Star, Heart, Rocket, Gift, Percent } from "lucide-react";

const WelcomePage = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [show, setShow] = useState(true);

  const phrases = [
    "Discover amazing last-minute deals...",
    "Find hotels, restaurants, movies & concerts...",
    "Book instantly with best prices...",
    "Your next adventure awaits...",
    "Save up to 70% on last-minute bookings! 🔥",
    "Join 5M+ happy customers worldwide 🌍"
  ];

  useEffect(() => {
    // Progress bar animation
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 100) {
          clearInterval(timer);
          setTimeout(() => {
            setShow(false);
            setTimeout(onComplete, 500);
          }, 500);
          return 100;
        }
        const diff = Math.random() * 10;
        return Math.min(oldProgress + diff, 100);
      });
    }, 200);

    return () => clearInterval(timer);
  }, [onComplete]);

  useEffect(() => {
    // Rotating phrases
    const phraseInterval = setInterval(() => {
      setCurrentPhrase((prev) => (prev + 1) % phrases.length);
    }, 2000);

    return () => clearInterval(phraseInterval);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 z-50 bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 overflow-hidden"
        >
          {/* Animated background particles - Violet/Pink theme */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full"
                style={{
                  width: Math.random() * 150 + 50,
                  height: Math.random() * 150 + 50,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  x: [0, Math.random() * 100 - 50],
                  y: [0, Math.random() * 100 - 50],
                  scale: [1, Math.random() * 2 + 0.5],
                  rotate: [0, 360],
                }}
                transition={{
                  duration: Math.random() * 15 + 10,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              />
            ))}
          </div>

          {/* Floating deal text in background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {["🔥 HOT DEAL", "⚡ FLASH SALE", "🎉 LAST MINUTE", "💸 SAVE 70%", "🎫 LIMITED OFFER", "🏷️ BEST PRICE"].map((text, index) => (
              <motion.div
                key={index}
                className="absolute whitespace-nowrap text-4xl md:text-6xl font-bold text-white/5"
                initial={{ 
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                  rotate: Math.random() * 360
                }}
                animate={{
                  x: [null, Math.random() * window.innerWidth, Math.random() * window.innerWidth],
                  y: [null, Math.random() * window.innerHeight, Math.random() * window.innerHeight],
                  rotate: [null, Math.random() * 360, Math.random() * 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  duration: Math.random() * 20 + 15,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                {text}
              </motion.div>
            ))}
          </div>

          {/* Main content */}
          <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
            {/* Logo animation */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring",
                stiffness: 260,
                damping: 20,
                duration: 1 
              }}
              className="mb-8"
            >
              <div className="w-32 h-32 bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl shadow-2xl flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
            </motion.div>

            {/* Brand name */}
            <motion.h1
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold text-white mb-4 text-center"
            >
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                LastMinute
              </span>
            </motion.h1>

            {/* Rotating phrases */}
            <motion.div
              key={currentPhrase}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="h-12 mb-12"
            >
              <p className="text-xl md:text-2xl text-purple-200 text-center">
                {phrases[currentPhrase]}
              </p>
            </motion.div>

            {/* Feature icons */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-wrap justify-center gap-6 md:gap-8 mb-12"
            >
              {[
                { icon: Zap, label: "Instant", color: "from-yellow-400 to-orange-500" },
                { icon: Clock, label: "24/7", color: "from-blue-400 to-cyan-500" },
                { icon: Shield, label: "Secure", color: "from-green-400 to-emerald-500" },
                { icon: Star, label: "Top Rated", color: "from-amber-400 to-yellow-500" },
                { icon: Heart, label: "Save Faves", color: "from-pink-400 to-rose-500" },
                { icon: Rocket, label: "Fast", color: "from-purple-400 to-pink-500" }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.1, y: -5 }}
                  className="flex flex-col items-center"
                >
                  <div className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-full flex items-center justify-center backdrop-blur-sm mb-2 shadow-lg`}>
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs text-purple-200">{item.label}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Progress bar */}
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "300px", opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="w-64 md:w-96"
            >
              <div className="flex justify-between text-sm text-purple-200 mb-2">
                <span>Loading experience</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-purple-500/30 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>

            {/* Loading dots */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="mt-8 flex space-x-2"
            >
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </motion.div>

            {/* Deal Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.3, type: "spring", stiffness: 200 }}
              className="mt-8"
            >
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                <Gift className="w-4 h-4 text-pink-400" />
                <Percent className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-white">Last Minute Deals • Save up to 70%</span>
              </div>
            </motion.div>

            {/* Version */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="absolute bottom-8 text-xs text-purple-300"
            >
              v2.0.0 • Last Minute Deals • Instant Booking
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomePage;