import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import { isToday } from 'date-fns'
import TodoList from './TodoList'
import AddTodo from './AddTodo'
import ThemeToggle from './ThemeToggle'

const TodayView = ({ todos, lists, onToggle, onDelete, onAdd }) => {
  const [showAddTodo, setShowAddTodo] = useState(false)
  
  // Get tasks due today
  const todayTasks = todos.filter(todo => {
    if (!todo.due) return false
    return isToday(new Date(todo.due))
  })

  const incompleteTasks = todayTasks.filter(t => !t.completed)

  return (
    <div className="today-view flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Today</h1>
          <p className="text-gray-600">
            {incompleteTasks.length} tasks due today
          </p>
        </div>
        <ThemeToggle />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-4 pb-20">
        <AnimatePresence mode="wait">
          {showAddTodo && (
            <AddTodo
              key="add-todo"
              onAdd={(todo) => {
                onAdd(todo)
                setShowAddTodo(false)
              }}
              onClose={() => setShowAddTodo(false)}
              lists={lists}
              defaultDue={new Date().toISOString().split('T')[0]}
            />
          )}
        </AnimatePresence>

        <TodoList
          todos={todayTasks}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      </div>

      {/* Floating Add Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowAddTodo(true)}
        className="fixed bottom-20 right-4 w-14 h-14 bg-teal-500 hover:bg-teal-600 text-white rounded-full shadow-lg flex items-center justify-center z-10"
      >
        <Plus size={24} />
      </motion.button>
    </div>
  )
}

export default TodayView