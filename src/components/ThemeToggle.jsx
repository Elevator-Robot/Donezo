import React from 'react'
import { motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme()
  
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className="theme-toggle p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors duration-200"
      title={`Switch to ${theme === 'sunset' ? 'Night Sky' : 'Sunset'} theme`}
    >
      <motion.div
        key={theme}
        initial={{ rotate: -180, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {theme === 'sunset' ? (
          <Moon size={20} className="text-gray-700" />
        ) : (
          <Sun size={20} className="text-yellow-300" />
        )}
      </motion.div>
    </motion.button>
  )
}

export default ThemeToggle