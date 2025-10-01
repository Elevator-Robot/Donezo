import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, isToday, isTomorrow, isYesterday } from 'date-fns'
import { CheckCircle, Circle, Trash2, Clock, Bell } from 'lucide-react'

function TodoList({ todos, onToggle, onDelete }) {
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

  const sortedTodos = [...todos].sort((a, b) => {
    // Show incomplete todos first
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1
    }
    
    // Then sort by reminder time (earliest first)
    if (a.reminder && b.reminder) {
      return new Date(a.reminder) - new Date(b.reminder)
    }
    if (a.reminder) return -1
    if (b.reminder) return 1
    
    // Finally sort by creation time (newest first)
    return new Date(b.createdAt) - new Date(a.createdAt)
  })

  if (todos.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400"
      >
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-lg font-medium mb-2 text-gray-600 dark:text-gray-300">No tasks yet</h3>
        <p className="text-sm text-gray-400 dark:text-gray-500">Add your first task to get started!</p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {sortedTodos.map((todo, index) => (
          <motion.div
            key={todo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ delay: index * 0.1 }}
            className={`todo-item group ${todo.completed ? 'opacity-75' : ''}`}
          >
            <div className="flex items-start gap-3">
              <button
                onClick={() => onToggle(todo.id)}
                className={`mt-1 p-1 rounded-full transition-colors duration-200 ${
                  todo.completed 
                    ? 'text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300' 
                    : 'text-gray-400 dark:text-gray-500 hover:text-teal-500 dark:hover:text-teal-400'
                }`}
              >
                {todo.completed ? (
                  <CheckCircle size={20} className="text-teal-600 dark:text-teal-400" />
                ) : (
                  <Circle size={20} />
                )}
              </button>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-medium text-gray-900 dark:text-white ${
                      todo.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''
                    }`}>
                      {todo.title}
                    </h3>
                    
                    {todo.description && (
                      <p className={`text-sm mt-1 ${
                        todo.completed ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-300'
                      }`}>
                        {todo.description}
                      </p>
                    )}
                    
                    {todo.reminder && (
                      <div className="flex items-center gap-1 mt-2">
                        <Clock size={14} className="text-gray-400 dark:text-gray-500" />
                        <span className={`reminder-badge ${getReminderBadgeClass(todo.reminder)}`}>
                          {getReminderText(todo.reminder)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => onDelete(todo.id)}
                    className="opacity-0 group-hover:opacity-100 hover:text-red-500 dark:hover:text-red-400 transition-all duration-200 p-1 text-gray-400 dark:text-gray-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {format(new Date(todo.createdAt), 'MMM d, yyyy')}
                  </span>
                  
                  {todo.priority && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      todo.priority === 'high' 
                        ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                        : todo.priority === 'medium'
                        ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                        : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                    }`}>
                      {todo.priority}
                    </span>
                  )}
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
