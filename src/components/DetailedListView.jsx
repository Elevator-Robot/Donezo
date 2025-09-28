import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Plus } from 'lucide-react'
import TodoList from './TodoList'
import AddTodo from './AddTodo'

const iconMap = {
  CheckCircle: () => <div className="w-6 h-6 border-2 border-current rounded-full flex items-center justify-center"><div className="w-2 h-2 bg-current rounded-full"></div></div>,
  Clock: () => <div className="w-6 h-6 border-2 border-current rounded-full flex items-center justify-center"><div className="w-1 h-3 bg-current"></div><div className="w-3 h-1 bg-current absolute"></div></div>,
  Bell: () => <div className="w-6 h-6 relative"><div className="w-4 h-4 border-2 border-current rounded-t-full mx-auto"></div><div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-current rounded-full"></div></div>,
  Home: () => <div className="w-6 h-6 relative"><div className="w-4 h-3 border-2 border-current border-b-0 mx-auto"></div><div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-b-3 border-transparent border-b-current"></div></div>,
  Calendar: () => <div className="w-6 h-6 border-2 border-current rounded"><div className="w-full h-1 bg-current mt-1"></div><div className="flex justify-around mt-1"><div className="w-1 h-1 bg-current rounded-full"></div><div className="w-1 h-1 bg-current rounded-full"></div></div></div>,
  Star: () => <div className="w-6 h-6 relative"><div className="absolute inset-0 transform"><div className="w-full h-0.5 bg-current absolute top-1/2 left-0"></div><div className="h-full w-0.5 bg-current absolute left-1/2 top-0"></div><div className="w-full h-0.5 bg-current absolute top-1/2 left-0 transform rotate-45"></div><div className="w-full h-0.5 bg-current absolute top-1/2 left-0 transform -rotate-45"></div></div></div>
}

const colorMap = {
  teal: { bg: 'bg-teal-500', light: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-600' },
  coral: { bg: 'bg-coral-500', light: 'bg-coral-50', border: 'border-coral-200', text: 'text-coral-600' },
  lavender: { bg: 'bg-lavender-500', light: 'bg-lavender-50', border: 'border-lavender-200', text: 'text-lavender-600' }
}

function DetailedListView({ list, todos, lists, onBack, onToggleTodo, onDeleteTodo, onAddTodo }) {
  const [showAddTodo, setShowAddTodo] = useState(false)

  const listTodos = todos.filter(todo => todo.listId === list.id)
  const incompleteCount = listTodos.filter(t => !t.completed).length
  const IconComponent = iconMap[list.icon] || iconMap.CheckCircle
  const colors = colorMap[list.color] || colorMap.teal

  const handleAddTodo = (todo) => {
    onAddTodo(todo)
    setShowAddTodo(false)
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className={`bg-white shadow-sm border-b ${colors.border} px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className={`p-2 rounded-lg hover:${colors.light} ${colors.text} transition-colors`}
            >
              <ArrowLeft size={20} />
            </motion.button>
            
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center text-white`}>
                <IconComponent />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{list.name}</h1>
                <p className={`${colors.text} mt-1`}>
                  {incompleteCount} tasks remaining
                </p>
              </div>
            </div>
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
              activeList={list.id}
            />
          )}
        </AnimatePresence>

        {listTodos.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-64 text-gray-500"
          >
            <div className={`w-16 h-16 ${colors.light} rounded-full flex items-center justify-center mb-4`}>
              <div className={`${colors.text}`}>
                <IconComponent />
              </div>
            </div>
            <h3 className="text-lg font-medium mb-2 text-gray-700">No tasks in {list.name}</h3>
            <p className="text-sm text-gray-500">Add your first task to this list!</p>
          </motion.div>
        ) : (
          <TodoList
            todos={listTodos}
            onToggle={onToggleTodo}
            onDelete={onDeleteTodo}
          />
        )}
      </div>
    </div>
  )
}

export default DetailedListView