import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle, 
  Clock, 
  Bell, 
  Plus, 
  Trash2, 
  Settings,
  Home,
  Calendar,
  Star,
  X
} from 'lucide-react'

const iconMap = {
  CheckCircle,
  Clock,
  Bell,
  Home,
  Calendar,
  Star
}

const colorMap = {
  teal: 'bg-gradient-to-br from-teal-500 to-teal-600',
  coral: 'bg-gradient-to-br from-orange-400 to-orange-500',
  lavender: 'bg-gradient-to-br from-lavender-500 to-lavender-600'
}

function Sidebar({ lists, activeList, setActiveList, addList, deleteList, onClose, onOpenSettings }) {
  const [showAddList, setShowAddList] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [newListColor, setNewListColor] = useState('teal')
  const [newListIcon, setNewListIcon] = useState('CheckCircle')
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50

  const onTouchStart = (e) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance

    if (isLeftSwipe && onClose) {
      onClose() // Close sidebar on left swipe
    }
  }

  const handleAddList = (e) => {
    e.preventDefault()
    if (newListName.trim()) {
      addList({
        name: newListName.trim(),
        color: newListColor,
        icon: newListIcon
      })
      setNewListName('')
      setNewListColor('teal')
      setNewListIcon('CheckCircle')
      setShowAddList(false)
    }
  }

  const handleDeleteList = (id) => {
    if (window.confirm('Are you sure you want to delete this list? All tasks will be lost.')) {
      deleteList(id)
    }
  }

  return (
    <div 
      className="w-80 bg-white/80 backdrop-blur-sm shadow-lg border-r border-gray-200/30 flex flex-col sidebar h-full"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="p-6 border-b border-gray-200/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 via-orange-400 to-teal-600 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden">
              {/* Custom Donezo Icon */}
              <svg className="w-7 h-7 text-white relative z-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Zen circle background */}
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.8"/>
                {/* Checkmark */}
                <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                {/* Peaceful dots */}
                <circle cx="9" cy="9" r="1" fill="currentColor" opacity="0.6"/>
                <circle cx="15" cy="9" r="1" fill="currentColor" opacity="0.6"/>
                <circle cx="9" cy="15" r="1" fill="currentColor" opacity="0.6"/>
                <circle cx="15" cy="15" r="1" fill="currentColor" opacity="0.6"/>
              </svg>
              {/* Subtle inner glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Donezo</h1>
              <p className="text-sm text-gray-600">Get things done</p>
            </div>
          </div>
          
          {/* Close button for mobile */}
          <button 
            onClick={onClose}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {lists.map((list, index) => {
            const IconComponent = iconMap[list.icon] || CheckCircle
            return (
              <motion.button
                key={list.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setActiveList(list.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-300 group ${
                  activeList === list.id
                    ? 'bg-teal-50 border border-teal-200 shadow-md dark:bg-teal-900/20 dark:border-teal-700/50'
                    : 'hover:bg-gray-50 border border-transparent dark:hover:bg-gray-800/50 dark:border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-10 h-10 ${colorMap[list.color]} rounded-xl flex items-center justify-center shadow-md`}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-gray-900">{list.name}</span>
                </div>
                
                {lists.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteList(list.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all duration-300 p-2 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </motion.button>
            )
          })}
        </div>

        <AnimatePresence>
          {showAddList && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200"
            >
              <form onSubmit={handleAddList} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">List Name</label>
                  <input
                    type="text"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    className="input-field"
                    placeholder="Enter list name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                  <div className="flex gap-2">
                    {Object.keys(colorMap).map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewListColor(color)}
                        className={`w-8 h-8 rounded-lg border-2 ${
                          newListColor === color
                            ? 'border-teal-500 bg-teal-50'
                            : 'border-gray-200 hover:border-gray-300'
                        } ${colorMap[color]}`}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                  <div className="flex gap-2">
                    {Object.keys(iconMap).slice(0, 6).map((icon) => {
                      const IconComponent = iconMap[icon]
                      return (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => setNewListIcon(icon)}
                          className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center ${
                            newListIcon === icon
                              ? 'border-teal-500 bg-teal-50 text-teal-600'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <IconComponent size={16} />
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                  >
                    Add List
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddList(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddList(true)}
          className="w-full mt-4 p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-teal-300 hover:text-teal-600 transition-colors duration-200 flex items-center justify-center gap-2 dark:border-gray-600 dark:text-gray-400 dark:hover:border-teal-400 dark:hover:text-teal-400"
        >
          <Plus size={20} />
          New List
        </motion.button>
      </div>

      <div className="p-4 border-t border-gray-200/30">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpenSettings}
          className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200 flex items-center gap-3 text-gray-600 dark:bg-gray-800/50 dark:hover:bg-gray-700/50 dark:text-gray-300"
        >
          <Settings size={20} />
          <span className="font-medium">Settings</span>
        </motion.button>
      </div>
    </div>
  )
}

export default Sidebar
