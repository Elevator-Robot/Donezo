gitimport React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Type, Heart } from 'lucide-react'

const fontOptions = [
  { name: 'Rock Salt', value: 'Rock Salt', preview: 'font-rock-salt' },
  { name: 'Pacifico', value: 'Pacifico', preview: 'font-pacifico' },
  { name: 'Inter', value: 'Inter', preview: 'font-inter' },
  { name: 'Poppins', value: 'Poppins', preview: 'font-poppins' },
  { name: 'Quicksand', value: 'Quicksand', preview: 'font-quicksand' },
  { name: 'Comic Sans', value: 'Comic Sans MS', preview: 'font-comic' },
  { name: 'Cursive', value: 'cursive', preview: 'font-cursive' }
]

function Settings({ isOpen, onClose, settings, onSettingsChange }) {
  const [tempSettings, setTempSettings] = useState(settings)

  // Update temp settings when settings prop changes
  React.useEffect(() => {
    setTempSettings(settings)
  }, [settings])

  const handleFontChange = (font) => {
    setTempSettings(prev => ({ ...prev, font: font }))
  }

  const handleApply = () => {
    onSettingsChange(tempSettings)
    onClose()
  }

  const handleCancel = () => {
    setTempSettings(settings) // Reset to original settings
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Font Settings</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                <X size={24} className="text-gray-700 dark:text-gray-300" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="space-y-6">
                {/* Font Selection */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Type size={20} className="text-gray-700 dark:text-gray-300" />
                    Choose Your Font
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {fontOptions.map((font) => (
                      <motion.button
                        key={font.value}
                        onClick={() => handleFontChange(font.value)}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                          tempSettings.font === font.value
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <p className={`text-lg ${font.preview} mb-2`}>{font.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Sample text</p>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* About Section */}
                <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-orange-400 rounded-2xl mx-auto flex items-center justify-center mb-4">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Donezo</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">Get things done with style</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Version 1.0.0 • Made with ❤️
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleCancel}
                className="px-6 py-3 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                className="ml-4 px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Apply
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Settings
