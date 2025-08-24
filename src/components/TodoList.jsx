import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Circle, Trash2, Clock, Bell, ChevronDown, ChevronUp } from 'lucide-react'

// Utility functions for date formatting
const isToday = (date) => {
  const today = new Date()
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear()
}

const isTomorrow = (date) => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return date.getDate() === tomorrow.getDate() &&
         date.getMonth() === tomorrow.getMonth() &&
         date.getFullYear() === tomorrow.getFullYear()
}

const isYesterday = (date) => {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return date.getDate() === yesterday.getDate() &&
         date.getMonth() === yesterday.getMonth() &&
         date.getFullYear() === yesterday.getFullYear()
}

const format = (date, formatStr) => {
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  const displayMinutes = minutes.toString().padStart(2, '0')
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  return formatStr
    .replace('h:mm a', `${displayHours}:${displayMinutes} ${ampm}`)
    .replace('MMM d', `${months[date.getMonth()]} ${date.getDate()}`)
}

function TodoList({ todos, onToggle, onDelete }) {
  const [fillingTodo, setFillingTodo] = useState(null)
  const [completingTodos, setCompletingTodos] = useState(new Set())
  const [showCompleted, setShowCompleted] = useState(false)
  const [swipedTodo, setSwipedTodo] = useState(null)
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)

  // Minimum swipe distance for delete
  const minSwipeDistance = 80

  const onTouchStart = (e, todoId) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
    setSwipedTodo(todoId)
  }

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = (todoId) => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance

    if (isLeftSwipe) {
      // Trigger delete animation
      setCompletingTodos(prev => new Set([...prev, todoId]))
      setTimeout(() => {
        onDelete(todoId)
        setCompletingTodos(prev => {
          const newSet = new Set(prev)
          newSet.delete(todoId)
          return newSet
        })
      }, 300)
    }
    
    setSwipedTodo(null)
  }

  const handleToggle = (todo) => {
    if (fillingTodo === todo.id) return
    
    setFillingTodo(todo.id)
    onToggle(todo.id)
    
    if (!todo.completed) {
      // Add to completing set for exit animation
      setCompletingTodos(prev => new Set([...prev, todo.id]))
      
      // Create completion particles
      createCompletionParticles()
      
      // Haptic feedback for mobile
      if ('vibrate' in navigator) {
        navigator.vibrate(50)
      }
    }
    
    setTimeout(() => {
      setFillingTodo(null)
    }, 1000)
  }

  const createCompletionParticles = () => {
    const particlesContainer = document.querySelector('.completion-particles')
    if (!particlesContainer) return

    // Check if we're in cyberpunk theme
    const isCyberpunkTheme = document.documentElement.getAttribute('data-theme') === 'cyberpunk'

    for (let i = 0; i < 8; i++) {
      const particle = document.createElement('div')
      
      if (isCyberpunkTheme) {
        // Create cyberpunk particles for cyberpunk theme
        if (i < 3) {
          particle.className = 'cyberpunk-particle'
          particle.style.cssText = `
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            --particle-x: ${(Math.random() - 0.5) * 200}px;
            width: ${Math.random() * 8 + 4}px;
            height: ${Math.random() * 8 + 4}px;
            animation-delay: ${Math.random() * 0.5}s;
          `
        } else {
          // Create hologram effects for cyberpunk theme
          particle.className = 'cyberpunk-hologram'
          particle.style.cssText = `
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation-delay: ${Math.random() * 1}s;
          `
        }
        
        // Add Matrix-style binary text particles
        if (i === 7) {
          const textParticle = document.createElement('div')
          textParticle.className = 'matrix-text-particle'
          textParticle.style.cssText = `
            position: absolute;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            color: #00ff00;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            text-shadow: 0 0 5px #00ff00;
            animation: matrixTextFloat 3s ease-out forwards;
            pointer-events: none;
            z-index: 1000;
          `
          textParticle.textContent = Math.random() > 0.5 ? '01' : '10'
          particlesContainer.appendChild(textParticle)
          
          setTimeout(() => {
            if (textParticle.parentNode) {
              textParticle.parentNode.removeChild(textParticle)
            }
          }, 3000)
        }
      } else {
        // Regular particles for other themes
        particle.className = 'particle'
        particle.style.cssText = `
          left: ${Math.random() * 100}%;
          top: ${Math.random() * 100}%;
          --particle-x: ${(Math.random() - 0.5) * 200}px;
          width: ${Math.random() * 8 + 4}px;
          height: ${Math.random() * 8 + 4}px;
        `
      }
      
      particlesContainer.appendChild(particle)
      
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle)
        }
      }, isCyberpunkTheme ? 3000 : 2000)
    }
  }

  const getReminderBadgeClass = (reminder) => {
    if (!reminder) return ''
    
    const now = new Date()
    const reminderDate = new Date(reminder)
    const diffInHours = (reminderDate - now) / (1000 * 60 * 60)
    
    if (diffInHours < 0) return 'reminder-urgent'
    if (diffInHours < 24) return 'reminder-soon'
    return 'reminder-later'
  }

  const getReminderText = (reminder) => {
    if (!reminder) return ''
    
    const reminderDate = new Date(reminder)
    
    if (isToday(reminderDate)) {
      return `Today at ${format(reminderDate, 'h:mm a')}`
    }
    if (isTomorrow(reminderDate)) {
      return `Tomorrow at ${format(reminderDate, 'h:mm a')}`
    }
    if (isYesterday(reminderDate)) {
      return `Yesterday at ${format(reminderDate, 'h:mm a')}`
    }
    
    return format(reminderDate, 'MMM d, h:mm a')
  }

  const sortedIncompleteTodos = todos
    .filter(todo => !todo.completed && !completingTodos.has(todo.id))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const sortedCompletedTodos = todos
    .filter(todo => todo.completed)
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))

  const renderTodoItem = (todo) => {
    const isSwiped = swipedTodo === todo.id
    const swipeDistance = touchStart && touchEnd ? touchStart - touchEnd : 0
    const shouldShowDelete = swipeDistance > minSwipeDistance / 2

    return (
      <motion.div
        key={todo.id}
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -300, scale: 0.8 }}
        transition={{ duration: 0.3 }}
        className="relative"
        onTouchStart={(e) => onTouchStart(e, todo.id)}
        onTouchMove={onTouchMove}
        onTouchEnd={() => onTouchEnd(todo.id)}
      >
        {/* Delete background indicator - very subtle version */}
        <motion.div
          className="absolute right-0 top-0 bottom-0 w-16 bg-gray-50 dark:bg-gray-700 rounded-r-lg flex items-center justify-center opacity-0"
          initial={{ x: '100%' }}
          animate={{ 
            x: shouldShowDelete ? '0%' : '100%',
            opacity: shouldShowDelete ? 0.8 : 0
          }}
          transition={{ duration: 0.2 }}
        >
          <Trash2 className="text-gray-400 dark:text-gray-500" size={18} />
        </motion.div>

        {/* Todo item */}
        <motion.div
          className="todo-item relative z-10"
          animate={{ 
            x: isSwiped ? -Math.min(swipeDistance, minSwipeDistance) : 0 
          }}
          transition={{ duration: 0.1 }}
          whileHover={{ 
            scale: 1.02,
            y: -2,
            transition: { duration: 0.2 }
          }}
          whileTap={{ 
            scale: 0.98,
            transition: { duration: 0.1 }
          }}
        >
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => handleToggle(todo)}
              className="relative flex-shrink-0"
              whileHover={{ 
                scale: 1.2,
                rotate: [0, -10, 10, 0],
                transition: { duration: 0.3 }
              }}
              whileTap={{ 
                scale: 0.8,
                transition: { duration: 0.1 }
              }}
            >
              {todo.completed ? (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 500,
                    damping: 15
                  }}
                >
                  <CheckCircle className="w-6 h-6 text-teal-500" />
                </motion.div>
              ) : (
                <>
                  <Circle className="w-6 h-6 text-gray-400" />
                  {fillingTodo === todo.id && (
                    <motion.div
                      className="absolute inset-0 bg-teal-500 rounded-full"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ 
                        type: "spring",
                        stiffness: 400,
                        damping: 20
                      }}
                    />
                  )}
                </>
              )}
            </motion.button>

            <div className="flex-1 min-w-0">
              <motion.p
                className={`font-medium ${
                  todo.completed 
                    ? 'line-through text-gray-500 dark:text-gray-400' 
                    : 'text-gray-900 dark:text-white'
                }`}
                animate={{
                  textDecoration: todo.completed ? 'line-through' : 'none',
                  color: todo.completed ? '#6b7280' : '#111827'
                }}
                transition={{ duration: 0.3 }}
              >
                {todo.title}
              </motion.p>
              
              {todo.description && (
                <motion.p
                  className="text-sm text-gray-600 dark:text-gray-400 mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {todo.description}
                </motion.p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {todo.reminder && (
                <motion.div
                  className="reminder-badge"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Clock className="w-3 h-3 mr-1" />
                  {new Date(todo.reminder).toLocaleDateString()}
                </motion.div>
              )}
              
              {todo.priority && (
                <motion.span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    todo.priority === 'high' 
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' 
                      : todo.priority === 'medium'
                      ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                      : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {todo.priority}
                </motion.span>
              )}
              
              {/* Delete button */}
              <motion.button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(todo.id)
                }}
                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Delete task"
              >
                <Trash2 className="w-4 h-4 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Active Tasks */}
      <div>
        <motion.h3 
          className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span>Active Tasks</span>
          <motion.span 
            className="bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 px-2 py-1 rounded-full text-sm font-medium"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            {sortedIncompleteTodos.length}
          </motion.span>
        </motion.h3>

        <AnimatePresence mode="popLayout">
          {sortedIncompleteTodos.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
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
          ) : (
            <div className="space-y-3">
              {sortedIncompleteTodos.map(renderTodoItem)}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Completed Tasks */}
      {sortedCompletedTodos.length > 0 && (
        <div>
          <motion.button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {showCompleted ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            <span className="font-medium">Completed Tasks</span>
            <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full text-sm">
              {sortedCompletedTodos.length}
            </span>
          </motion.button>

          <AnimatePresence>
            {showCompleted && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                {sortedCompletedTodos.map(renderTodoItem)}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

export default TodoList
