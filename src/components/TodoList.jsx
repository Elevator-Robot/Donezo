import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Clock, Trash2, Repeat, AlertTriangle, Calendar } from 'lucide-react'
import { formatDueDate, isOverdue, getPriorityColor, getPriorityBackground, getRecurrenceDescription } from '../utils/recurringTaskUtils'

function TodoList({ todos, onToggle, onDelete }) {
  const [swipeStates, setSwipeStates] = useState({})
  const [isDragging, setIsDragging] = useState(false)
  const dragStartX = useRef(0)
  const dragCurrentX = useRef(0)

  const handleSwipeStart = (e, todoId) => {
    setIsDragging(true)
    dragStartX.current = e.touches ? e.touches[0].clientX : e.clientX
    dragCurrentX.current = dragStartX.current
    setSwipeStates(prev => ({ ...prev, [todoId]: { startX: dragStartX.current, currentX: dragStartX.current } }))
  }

  const handleSwipeMove = (e, todoId) => {
    if (!isDragging) return
    e.preventDefault()
    dragCurrentX.current = e.touches ? e.touches[0].clientX : e.clientX
    const deltaX = dragCurrentX.current - dragStartX.current
    
    // Only allow left swipes (negative deltaX)
    if (deltaX < 0) {
      setSwipeStates(prev => ({ ...prev, [todoId]: { startX: dragStartX.current, currentX: dragCurrentX.current } }))
    }
  }

  const handleSwipeEnd = (e, todoId) => {
    if (!isDragging) return
    setIsDragging(false)
    
    const deltaX = dragCurrentX.current - dragStartX.current
    const threshold = -100 // Minimum swipe distance to trigger completion
    
    if (deltaX < threshold) {
      // Trigger completion with particles
      const rect = e.currentTarget.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const fakeEvent = { currentTarget: { getBoundingClientRect: () => ({ left: centerX - 50, width: 100, top: centerY - 25, height: 50 }) } }
      const todo = todos.find(t => t.id === todoId)
      if (todo && !todo.completed) {
        createCompletionParticles(fakeEvent, todo)
        onToggle(todoId)
      }
    }
    
    // Reset swipe state
    setSwipeStates(prev => {
      const newState = { ...prev }
      delete newState[todoId]
      return newState
    })
  }

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
        {todos.map((todo) => {
          const swipeState = swipeStates[todo.id]
          const deltaX = swipeState ? swipeState.currentX - swipeState.startX : 0
          const isSwipeActive = deltaX < -20
          
          return (
            <motion.div
              key={todo.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                scale: 1,
                x: Math.max(deltaX, -150) // Limit swipe distance
              }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className={`card p-4 transition-all duration-300 relative overflow-hidden ${
                todo.completed ? 'opacity-75' : ''
              } ${isOverdue(todo.dueDate, todo.dueTime) && !todo.completed ? 'border-red-300 dark:border-red-600' : ''} ${
                isSwipeActive ? 'bg-teal-50 dark:bg-teal-900/20' : ''
              }`}
              onTouchStart={(e) => handleSwipeStart(e, todo.id)}
              onTouchMove={(e) => handleSwipeMove(e, todo.id)}
              onTouchEnd={(e) => handleSwipeEnd(e, todo.id)}
              onMouseDown={(e) => handleSwipeStart(e, todo.id)}
              onMouseMove={(e) => handleSwipeMove(e, todo.id)}
              onMouseUp={(e) => handleSwipeEnd(e, todo.id)}
              onMouseLeave={(e) => handleSwipeEnd(e, todo.id)}
            >
              {/* Swipe completion indicator */}
              {isSwipeActive && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-transparent flex items-center justify-end pr-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    className="flex items-center gap-2 text-teal-600 dark:text-teal-400"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    <CheckCircle className="w-6 h-6" />
                    <span className="font-medium">Complete</span>
                  </motion.div>
                </motion.div>
              )}
              
              <div className="flex items-start gap-3 relative z-10">
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
          )
        })}
      </AnimatePresence>
    </div>
  )
}

export default TodoList
