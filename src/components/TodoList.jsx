import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Clock, Trash2, Repeat, AlertTriangle, Calendar } from 'lucide-react'
import { formatDueDate, isOverdue, getPriorityColor, getPriorityBackground, getRecurrenceDescription } from '../utils/recurringTaskUtils'

function TodoList({ todos, onToggle, onDelete }) {
  const createCompletionParticles = (event, todo) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const particlesContainer = document.querySelector('.completion-particles')
    if (!particlesContainer) return
    
    // Create particles based on theme
    const theme = document.documentElement.getAttribute('data-theme')
    const particleCount = 8
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div')
      particle.className = theme === 'cyberpunk' ? 'cyberpunk-particle' : 'completion-particle'
      
      const angle = (i / particleCount) * Math.PI * 2
      const velocity = 100 + Math.random() * 50
      const startX = centerX
      const startY = centerY
      
      particle.style.left = startX + 'px'
      particle.style.top = startY + 'px'
      
      particlesContainer.appendChild(particle)
      
      // Animate particle
      const animation = particle.animate([
        {
          transform: 'translate(0, 0) scale(1)',
          opacity: 1
        },
        {
          transform: `translate(${Math.cos(angle) * velocity}px, ${Math.sin(angle) * velocity}px) scale(0)`,
          opacity: 0
        }
      ], {
        duration: 1000,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      })
      
      animation.onfinish = () => {
        particle.remove()
      }
    }
    
    // Add hologram effect for cyberpunk theme
    if (theme === 'cyberpunk') {
      const hologram = document.createElement('div')
      hologram.className = 'cyberpunk-hologram'
      hologram.style.left = centerX + 'px'
      hologram.style.top = centerY + 'px'
      
      particlesContainer.appendChild(hologram)
      
      const hologramAnimation = hologram.animate([
        {
          transform: 'scale(0) rotate(0deg)',
          opacity: 1
        },
        {
          transform: 'scale(2) rotate(360deg)',
          opacity: 0
        }
      ], {
        duration: 1500,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      })
      
      hologramAnimation.onfinish = () => {
        hologram.remove()
      }
    }
  }

  if (todos.length === 0) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center py-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4 relative"
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          whileHover={{
            scale: 1.2,
            rotate: [0, 10, -10, 0],
            transition: { duration: 0.5 }
          }}
        >
          {/* Neon glow effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 opacity-20 blur-sm animate-pulse"></div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-15 blur-md animate-pulse" style={{animationDelay: '0.5s'}}></div>
          
          <CheckCircle className="w-8 h-8 text-blue-400 dark:text-blue-300 relative z-10 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)] dark:drop-shadow-[0_0_8px_rgba(147,197,253,0.8)]" />
        </motion.div>
        <motion.p
          className="text-green-400 dark:text-green-300 text-lg font-semibold"
          animate={{
            y: [0, -5, 0],
            transition: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
        >
          All caught up! 🎉
        </motion.p>
        <motion.p
          className="text-cyan-400 dark:text-cyan-300 text-sm mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Add a new task to get started
        </motion.p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {todos.map((todo) => (
          <motion.div
            key={todo.id}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className={`card p-4 transition-all duration-300 ${
              todo.completed ? 'opacity-75' : ''
            } ${isOverdue(todo.dueDate, todo.dueTime) && !todo.completed ? 'border-red-300 dark:border-red-600' : ''}`}
          >
            <div className="flex items-start gap-3">
              {/* Heart Checkbox */}
              <button
                onClick={(e) => {
                  onToggle(todo.id)
                  if (!todo.completed) {
                    createCompletionParticles(e, todo)
                  }
                }}
                className={`flex-shrink-0 w-5 h-5 transition-all duration-300 hover:scale-110 ${
                  todo.completed
                    ? 'text-teal-500 cyberpunk-heart-completed [data-theme="cyberpunk"]:animate-[cyberpunkPulse_2s_ease-in-out_infinite]'
                    : 'text-gray-300 dark:text-gray-600 hover:text-teal-400 dark:hover:text-teal-400 [data-theme="cyberpunk"]:hover:text-[#00ff00]'
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill={todo.completed ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-full h-full transition-all duration-300"
                >
                  <path
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  />
                </svg>
              </button>

              {/* Task Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <motion.h3
                      className={`font-medium text-gray-600 dark:text-gray-400 ${
                        todo.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''
                      }`}
                      initial={false}
                      animate={{ textDecoration: todo.completed ? 'line-through' : 'none' }}
                      transition={{ duration: 0.2 }}
                    >
                      {todo.title}
                    </motion.h3>
                    
                    {todo.description && (
                      <motion.p
                        className={`text-sm text-gray-600 dark:text-gray-400 mt-1 ${
                          todo.completed ? 'line-through' : ''
                        }`}
                        initial={false}
                        animate={{ textDecoration: todo.completed ? 'line-through' : 'none' }}
                        transition={{ duration: 0.2 }}
                      >
                        {todo.description}
                      </motion.p>
                    )}

                    {/* Task Metadata */}
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      {/* Priority */}
                      {todo.priority && (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityBackground(todo.priority)}`}>
                          {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
                        </span>
                      )}

                      {/* Due Date */}
                      {todo.dueDate && (
                        <div className={`flex items-center gap-1 text-xs ${
                          isOverdue(todo.dueDate, todo.dueTime) && !todo.completed 
                            ? 'text-red-600 dark:text-red-400' 
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          <Calendar className="w-3 h-3" />
                          <span>{formatDueDate(todo.dueDate, todo.dueTime)}</span>
                          {isOverdue(todo.dueDate, todo.dueTime) && !todo.completed && (
                            <AlertTriangle className="w-3 h-3 text-red-500" />
                          )}
                        </div>
                      )}

                      {/* Recurring Task Indicator */}
                      {todo.isRecurring && (
                        <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                          <Repeat className="w-3 h-3" />
                          <span>{getRecurrenceDescription(todo.recurrence)}</span>
                        </div>
                      )}

                      {/* Reminders */}
                      {todo.reminders && todo.reminders.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                          <Clock className="w-3 h-3" />
                          <span>{todo.reminders.length} reminder{todo.reminders.length > 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Delete Button */}
                  <motion.button
                    onClick={() => onDelete(todo.id)}
                    className="flex-shrink-0 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default TodoList
