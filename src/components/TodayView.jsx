import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Calendar } from 'lucide-react'
import TodoList from './TodoList'
import AddTodo from './AddTodo'
import { format, isToday, startOfDay } from 'date-fns'

function TodayView({ todos, lists, onToggleTodo, onDeleteTodo, onAddTodo }) {
  const [showAddTodo, setShowAddTodo] = useState(false)

  // Filter todos for today (either created today or have reminder set for today)
  const todayTodos = todos.filter(todo => {
    const todoDate = new Date(todo.createdAt)
    const reminderDate = todo.reminder ? new Date(todo.reminder) : null
    
    return isToday(todoDate) || (reminderDate && isToday(reminderDate))
  })

  const incompleteTodayTodos = todayTodos.filter(t => !t.completed)

  const handleAddTodo = (todo) => {
    onAddTodo(todo)
    setShowAddTodo(false)
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="bg-white shadow-sm border-b border-teal-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-6 h-6 text-teal-600" />
              <h1 className="text-2xl font-bold text-gray-900">Today</h1>
            </div>
            <p className="text-teal-600 mt-1">
              {format(new Date(), 'EEEE, MMMM d')} • {incompleteTodayTodos.length} tasks remaining
            </p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddTodo(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Add Task
          </motion.button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6">
        <AnimatePresence mode="wait">
          {showAddTodo && (
            <AddTodo
              key="add-todo"
              onAdd={handleAddTodo}
              onClose={() => setShowAddTodo(false)}
              lists={lists}
              activeList={lists[0]?.id}
            />
          )}
        </AnimatePresence>

        {todayTodos.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-64 text-gray-500"
          >
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-teal-500" />
            </div>
            <h3 className="text-lg font-medium mb-2 text-gray-700">No tasks for today</h3>
            <p className="text-sm text-gray-500">Add a task to get started with your day!</p>
          </motion.div>
        ) : (
          <TodoList
            todos={todayTodos}
            onToggle={onToggleTodo}
            onDelete={onDeleteTodo}
          />
        )}
      </div>
    </div>
  )
}

export default TodayView