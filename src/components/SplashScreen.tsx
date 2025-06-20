```tsx
import React, { useEffect } from 'react'
import { motion } from "framer-motion"

interface SplashScreenProps {
  onComplete: () => void
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000); // Show splash for 3 seconds

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{
        background: "linear-gradient(135deg, #8B8680 0%, #800000 50%, #F5F5DC 100%)"
      }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: \`radial-gradient(circle at 25% 25%, rgba(139, 134, 128, 0.3) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(128, 0, 0, 0.3) 0%, transparent 50%)`
        }} />
      </div>

      {/* Main Content */}
      <div className="relative flex flex-col items-center">
        {/* Logo Animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 260, 
            damping: 20,
            duration: 1.2 
          }}
          className="mb-8"
        >
          <div className="relative">
            {/* Logo Background Circle */}
            <motion.div
              className="w-24 h-24 rounded-full flex items-center justify-center shadow-2xl"
              style={{ backgroundColor: "#F5F5DC" }}
              initial={{ boxShadow: "0 0 0 0 rgba(128, 0, 0, 0.4)" }}
              animate={{ 
                boxShadow: [
                  "0 0 0 0 rgba(128, 0, 0, 0.4)",
                  "0 0 0 20px rgba(128, 0, 0, 0)",
                  "0 0 0 0 rgba(128, 0, 0, 0)"
                ]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1
              }}
            >
              {/* Logo Text */}
              <motion.span
                className="text-3xl font-bold"
                style={{ color: "#800000" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                n!
              </motion.span>
            </motion.div>
          </div>
        </motion.div>

        {/* App Name */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center"
        >
          <h1 
            className="text-4xl font-bold mb-2 tracking-wide font-serif"
            style={{ 
              color: "#F5F5DC",
              fontFamily: "'Times New Roman', 'Georgia', 'serif'"
            }}
          >
            newza!
          </h1>
          <motion.p
            className="text-lg opacity-80"
            style={{ color: "#F5F5DC" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            Your News, Reimagined
          </motion.p>
        </motion.div>

        {/* Loading Animation */}
        <motion.div
          className="mt-12 flex space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: "#F5F5DC" }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: index * 0.2
              }}
            />
          ))}
        </motion.div>
      </div>

      {/* Subtle Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full opacity-30"
            style={{ 
              backgroundColor: "#F5F5DC",
              left: \`${Math.random() * 100}%`,
              top: \`${Math.random() * 100}%`
            }}
            animate={{
              y: [-20, -100],
              opacity: [0, 0.6, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeOut"
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

export const SplashScreens = {
  SplashScreen1: SplashScreen,
  SplashScreen2: SplashScreen,
  SplashScreen3: SplashScreen,
  SplashScreen4: SplashScreen
}

export default SplashScreen
```