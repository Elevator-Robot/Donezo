import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, LogOut, Settings, ChevronDown, ChevronUp } from 'lucide-react'

const UserProfile = ({ currentUser, onLogout, onOpenSettings }) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = () => {
    // Clear current user from localStorage
    localStorage.removeItem('doink-current-user')
    onLogout()
  }

  return (
    <div className="relative">
      {/* User Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-all duration-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-xs font-medium text-gray-900 dark:text-white">
            {currentUser?.username || 'User'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {currentUser?.email || ''}
          </p>
        </div>
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="up"
              initial={{ rotate: 0 }}
              animate={{ rotate: 180 }}
              exit={{ rotate: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 dark:text-gray-400" />
            </motion.div>
          ) : (
            <motion.div
              key="down"
              initial={{ rotate: 180 }}
              animate={{ rotate: 0 }}
              exit={{ rotate: 180 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 dark:text-gray-400" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 top-full mt-2 w-56 sm:w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 z-50"
          >
            <div className="p-4">
              {/* User Info */}
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200/50 dark:border-gray-700/50">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                    {currentUser?.username || 'User'}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    {currentUser?.email || ''}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Member since {currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </div>

              {/* Menu Items */}
              <div className="space-y-1">
                <motion.button
                  onClick={() => {
                    onOpenSettings()
                    setIsOpen(false)
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors duration-200"
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-sm">Settings</span>
                </motion.button>

                <motion.button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Sign Out</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default UserProfile
