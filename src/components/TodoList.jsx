import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Circle, Trash2, Clock, Bell, ChevronDown, ChevronUp } from 'lucide-react'

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

    for (let i = 0; i < 8; i++) {
      const particle = document.createElement('div')
      particle.className = 'particle'
      particle.style.cssText = `
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        --particle-x: ${(Math.random() - 0.5) * 200}px;
        width: ${Math.random() * 8 + 4}px;
        height: ${Math.random() * 8 + 4}px;
      `
      particlesContainer.appendChild(particle)
      
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle)
        }
      }, 2000)
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
        {/* Delete background indicator */}
        <motion.div
          className="absolute inset-0 bg-red-500 rounded-lg flex items-center justify-center"
          initial={{ x: '100%' }}
          animate={{ x: shouldShowDelete ? '0%' : '100%' }}
          transition={{ duration: 0.2 }}
        >
          <Trash2 className="text-white" size={24} />
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
                    ? 'line-through text-gray-500' 
                    : 'text-gray-900'
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
                  className="text-sm text-gray-600 mt-1"
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
                      ? 'bg-red-100 text-red-800' 
                      : todo.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {todo.priority}
                </motion.span>
              )}
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
          className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span>Active Tasks</span>
          <motion.span 
            className="bg-teal-100 text-teal-800 px-2 py-1 rounded-full text-sm font-medium"
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
                className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
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
                <CheckCircle className="w-8 h-8 text-gray-400" />
              </motion.div>
              <motion.p 
                className="text-gray-500 text-lg"
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
                className="text-gray-400 text-sm mt-1"
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
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {showCompleted ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            <span className="font-medium">Completed Tasks</span>
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
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
