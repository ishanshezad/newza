import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from "framer-motion"
import { Zap, Star, Award, Target, Flame, TrendingUp } from 'lucide-react'

interface SplashScreenProps {
  onComplete: () => void
}

const SplashScreen1 = ({ onComplete }: SplashScreenProps) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3000)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center"
      >
        <motion.div
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-8"
        >
          <div className="w-24 h-24 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-white rounded-2xl shadow-2xl flex items-center justify-center">
              <div className="text-4xl font-black text-transparent bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text">
                n!
              </div>
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-2 border-4 border-white/30 rounded-3xl"
            />
          </div>
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-4xl font-black text-white mb-2"
        >
          newza!
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="text-white/80 text-lg"
        >
          news that matters.
        </motion.p>
        
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ delay: 1.5, duration: 1 }}
          className="w-32 h-1 bg-white/30 rounded-full mx-auto mt-8 overflow-hidden"
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ delay: 1.5, duration: 1 }}
            className="h-full bg-white rounded-full"
          />
        </motion.div>
      </motion.div>
    </div>
  )
}

const SplashScreen2 = ({ onComplete }: SplashScreenProps) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3000)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="w-32 h-32 mx-auto relative">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 rounded-full shadow-2xl flex items-center justify-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                <Zap className="h-10 w-10 text-orange-500" />
              </div>
            </div>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0, 0.7] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                className="absolute inset-0 border-2 border-orange-400 rounded-full"
              />
            ))}
          </div>
        </motion.div>
        
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <h1 className="text-5xl font-black text-white mb-4">
            <span className="text-transparent bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text">
              New
            </span>
            <span className="text-transparent bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text">
              za!
            </span>
          </h1>
          <p className="text-gray-400 text-xl">Stay informed. Stay ahead.</p>
        </motion.div>
      </motion.div>
    </div>
  )
}

const SplashScreen3 = ({ onComplete }: SplashScreenProps) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3500)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="fixed inset-0 bg-gradient-to-t from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center z-50">
      <div className="text-center relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-12"
        >
          <div className="relative w-40 h-40 mx-auto">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
            >
              <div className="w-full h-full border-4 border-purple-500/30 rounded-full" />
              <div className="absolute top-0 left-1/2 w-3 h-3 bg-purple-400 rounded-full -translate-x-1/2 -translate-y-1/2" />
            </motion.div>
            
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute inset-4"
            >
              <div className="w-full h-full border-2 border-blue-400/40 rounded-full" />
              <div className="absolute top-0 right-0 w-2 h-2 bg-blue-400 rounded-full translate-x-1/2 -translate-y-1/2" />
            </motion.div>
            
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-2xl">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="text-white font-black text-xl"
                >
                  N!
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <h1 className="text-6xl font-black text-white mb-4 tracking-tight">
            Newza!
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.6 }}
            className="text-purple-200 text-xl font-medium"
          >
            News That Matters
          </motion.p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 0.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="flex space-x-1">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                className="w-2 h-2 bg-purple-400 rounded-full"
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

const SplashScreen4 = ({ onComplete }: SplashScreenProps) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3000)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="w-28 h-28 mx-auto relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-blue-600 rounded-3xl shadow-xl flex items-center justify-center transform rotate-12">
              <div className="text-3xl font-black text-white">N</div>
            </div>
            <div className="absolute inset-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg flex items-center justify-center transform -rotate-12">
              <div className="text-2xl font-black text-white">!</div>
            </div>
          </div>
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-5xl font-black text-gray-900 mb-2"
        >
          Newza!
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="text-gray-600 text-lg font-medium"
        >
          Read. Learn. Stay Updated.
        </motion.p>
        
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1.8, duration: 0.8 }}
          className="w-24 h-1 bg-gradient-to-r from-emerald-400 to-blue-600 rounded-full mx-auto mt-8"
        />
      </motion.div>
    </div>
  )
}

export const SplashScreens = {
  SplashScreen1,
  SplashScreen2,
  SplashScreen3,
  SplashScreen4
}

export default SplashScreen1