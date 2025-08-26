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
  X,
  Heart,
  Zap,
  Music,
  Camera,
  BookOpen,
  Coffee,
  Pizza,
  Flower,
  Car,
  Plane,
  Gift,
  ShoppingBag,
  ShoppingCart,
  Activity,
  Book,
  User,
  LogOut
} from 'lucide-react'

// Simple, focused icon mapping for practical list types
const iconMap = {
  Heart: Heart,
  Zap: Zap,
  Music: Music,
  Camera: Camera,
  BookOpen: BookOpen,
  Book: Book,
  Coffee: Coffee,
  Pizza: Pizza,
  Flower: Flower,
  Car: Car,
  Plane: Plane,
  Gift: Gift,
  ShoppingBag: ShoppingBag,
  ShoppingCart: ShoppingCart,
  Activity: Activity,
  Home: Home,
  Calendar: Calendar,
  Star: Star,
  Clock: Clock,
  Bell: Bell,
  CheckCircle: CheckCircle,
  Settings: Settings
}

const colorMap = {
  teal: 'bg-teal-500',
  blue: 'bg-blue-500',
  pink: 'bg-pink-500',
  purple: 'bg-purple-500',
  emerald: 'bg-emerald-500',
  orange: 'bg-orange-500',
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
  green: 'bg-green-500',
  indigo: 'bg-indigo-500',
  rose: 'bg-rose-500',
  cyan: 'bg-cyan-500',
  amber: 'bg-amber-500',
  lime: 'bg-lime-500',
  sage: 'bg-gray-500',
  moss: 'bg-gray-600',
  earth: 'bg-amber-700',
  bark: 'bg-amber-800',
  soil: 'bg-amber-900',
  stone: 'bg-gray-400'
}

const gradientMap = {
  sunset: 'bg-gradient-to-r from-orange-400 to-pink-500',
  ocean: 'bg-gradient-to-r from-blue-400 to-cyan-500',
  forest: 'bg-gradient-to-r from-green-400 to-emerald-500',
  lavender: 'bg-gradient-to-r from-purple-400 to-pink-500',
  fire: 'bg-gradient-to-r from-red-400 to-orange-500',
  sky: 'bg-gradient-to-r from-sky-400 to-blue-500',
  spring: 'bg-gradient-to-r from-green-400 to-teal-500',
  berry: 'bg-gradient-to-r from-purple-400 to-indigo-500'
}

function Sidebar({ lists, activeList, setActiveList, addList, deleteList, onClose, onOpenSettings, currentUser, onLogout }) {
  const [showAddList, setShowAddList] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [newListColor, setNewListColor] = useState('teal')
  const [newListIcon, setNewListIcon] = useState('Heart')
  const [touchStart, setTouchStart] = useState(null)

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX)
  }

  const handleTouchMove = (e) => {
    if (!touchStart) return
    
    const currentTouch = e.touches[0].clientX
    const diff = touchStart - currentTouch
    
    if (diff > 50) {
      onClose()
    }
  }

  const handleTouchEnd = () => {
    setTouchStart(null)
  }

  const handleAddList = () => {
    if (newListName.trim()) {
      addList({
        name: newListName,
        color: newListColor,
        icon: newListIcon
      })
      setNewListName('')
      setNewListColor('teal')
      setNewListIcon('Heart')
      setShowAddList(false)
    }
  }

  const IconComponent = iconMap[newListIcon]

  return (
    <motion.div
      className="sidebar w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-orange-500 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Donezo</h1>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* User Profile Section */}
        {currentUser && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                {currentUser.username}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {currentUser.email}
              </p>
            </div>
            <button
              onClick={onLogout}
              className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4 text-red-500" />
            </button>
          </div>
        )}
      </div>

      {/* Lists */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-2">
          {lists.map((list) => {
            const ListIcon = iconMap[list.icon] || Heart
            const isActive = activeList?.id === list.id
            
            return (
              <motion.div
                key={list.id}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  isActive 
                    ? 'bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-700' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                onClick={() => {
                  setActiveList(list)
                  onClose()
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={`w-8 h-8 ${colorMap[list.color] || gradientMap[list.color]} rounded-lg flex items-center justify-center`}>
                  <ListIcon className="w-4 h-4 text-white" />
                </div>
                <span className={`font-medium ${
                  isActive ? 'text-teal-700 dark:text-teal-300' : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {list.name}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteList(list.id)
                  }}
                  className="ml-auto p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </motion.div>
            )
          })}
          
          {/* Add List Button */}
          <motion.button
            onClick={() => setShowAddList(true)}
            className="w-full flex items-center gap-3 p-3 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-teal-400 dark:hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <Plus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </div>
            <span className="font-medium text-gray-600 dark:text-gray-400">Add List</span>
          </motion.button>
        </div>
      </div>

      {/* Settings Button */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          <span className="font-medium text-gray-700 dark:text-gray-300">Settings</span>
        </button>
      </div>

      {/* Add List Modal */}
      <AnimatePresence>
        {showAddList && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowAddList(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 w-96 max-w-[90vw]"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Create New List</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    List Name
                  </label>
                  <input
                    type="text"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter list name"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Color
                  </label>
                  <div className="space-y-2">
                    {/* First row - Solid colors */}
                    <div className="grid grid-cols-7 gap-2">
                      {Object.entries(colorMap).map(([color, className]) => (
                        <button
                          key={color}
                          onClick={() => setNewListColor(color)}
                          className={`w-10 h-10 rounded-lg ${className} ${
                            newListColor === color ? 'ring-2 ring-gray-400 ring-offset-2' : ''
                          } hover:scale-110 transition-transform`}
                          title={color}
                        />
                      ))}
                    </div>
                    {/* Second row - Gradient colors */}
                    <div className="grid grid-cols-8 gap-2">
                      {Object.entries(gradientMap).map(([gradient, className]) => (
                        <button
                          key={gradient}
                          onClick={() => setNewListColor(gradient)}
                          className={`w-10 h-10 rounded-lg ${className} ${
                            newListColor === gradient ? 'ring-2 ring-gray-400 ring-offset-2' : ''
                          } hover:scale-110 transition-transform`}
                          title={gradient}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Icon
                  </label>
                  <div className="grid grid-cols-7 gap-2">
                    {Object.entries(iconMap).map(([iconName, IconComp]) => (
                      <button
                        key={iconName}
                        onClick={() => setNewListIcon(iconName)}
                        className={`w-10 h-10 rounded-lg border-2 ${
                          newListIcon === iconName 
                            ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20' 
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        } flex items-center justify-center transition-all hover:scale-105`}
                        title={iconName}
                      >
                        <IconComp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddList(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddList}
                  className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                >
                  Create List
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default Sidebar