import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../contexts/ThemeContext'
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
  Moon,
  Sun,
  Keyboard,
  X,
  BarChart3
} from 'lucide-react'

const iconMap = {
  CheckCircle,
  Clock,
  Bell,
  Home,
  Calendar,
  Star,
  BarChart3
}

const colorMap = {
  teal: 'bg-teal-500',
  coral: 'bg-coral-500',
  lavender: 'bg-lavender-500'
}

function Sidebar({ lists, activeList, setActiveList, addList, deleteList, showStats, setShowStats }) {
  const { isDarkMode, toggleTheme } = useTheme()
  const [showAddList, setShowAddList] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [newListColor, setNewListColor] = useState('teal')
  const [newListIcon, setNewListIcon] = useState('CheckCircle')

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

  const shortcuts = [
    { key: 'Ctrl + N', description: 'Add new task' },
    { key: 'Ctrl + F', description: 'Focus search' },
    { key: 'Ctrl + Shift + F', description: 'Toggle filters' },
    { key: 'Ctrl + 1/2/3', description: 'Switch between lists' },
    { key: 'Escape', description: 'Close panels/clear search' },
  ]

  return (
    <div className="w-80 bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 flex flex-col transition-colors duration-300">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Donezo</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">Get things done</p>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </motion.button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Stats Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowStats(!showStats)}
          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 mb-4 ${
            showStats
              ? 'bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-700 text-teal-700 dark:text-teal-300'
              : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          <div className={`w-8 h-8 ${showStats ? 'bg-teal-500' : 'bg-gray-400'} rounded-lg flex items-center justify-center`}>
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
          <span className="font-medium">Statistics</span>
        </motion.button>

        <div className="space-y-2">
          {lists.map((list) => {
            const IconComponent = iconMap[list.icon] || CheckCircle
            return (
              <motion.button
                key={list.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveList(list.id)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                  activeList === list.id
                    ? 'bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-700 text-teal-700 dark:text-teal-300'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 ${colorMap[list.color]} rounded-lg flex items-center justify-center`}>
                    <IconComponent className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-medium">{list.name}</span>
                </div>
                
                {lists.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteList(list.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity"
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <form onSubmit={handleAddList} className="space-y-3">
                <input
                  type="text"
                  placeholder="List name"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  className="input-field"
                  autoFocus
                />
                
                <div className="flex gap-2">
                  {Object.entries(colorMap).map(([color, bgClass]) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewListColor(color)}
                      className={`w-8 h-8 ${bgClass} rounded-lg ${
                        newListColor === color ? 'ring-2 ring-offset-2 ring-teal-500' : ''
                      }`}
                    />
                  ))}
                </div>

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
          className="w-full mt-4 p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-teal-300 dark:hover:border-teal-600 hover:text-teal-600 dark:hover:text-teal-400 transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          New List
        </motion.button>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <button 
          onClick={() => setShowShortcuts(!showShortcuts)}
          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors duration-200"
        >
          <Keyboard size={20} />
          <span>Keyboard Shortcuts</span>
        </button>
        
        <AnimatePresence>
          {showShortcuts && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden"
            >
              <div className="p-3">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Shortcuts</h3>
                  <button
                    onClick={() => setShowShortcuts(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="space-y-2">
                  {shortcuts.map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">{shortcut.description}</span>
                      <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-gray-700 dark:text-gray-300 font-mono">
                        {shortcut.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors duration-200">
          <Settings size={20} />
          <span>Settings</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar
