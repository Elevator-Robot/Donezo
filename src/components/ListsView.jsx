import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, CheckCircle, Clock, Bell, Home, Calendar, Star, Trash2, ArrowLeft } from 'lucide-react'
import TodoList from './TodoList'
import AddTodo from './AddTodo'
import ThemeToggle from './ThemeToggle'

const iconMap = {
  CheckCircle,
  Clock,
  Bell,
  Home,
  Calendar,
  Star
}

const colorMap = {
  teal: 'bg-teal-500',
  coral: 'bg-coral-500',
  lavender: 'bg-lavender-500'
}

const ListsView = ({ lists, todos, activeList, setActiveList, onAddList, onDeleteList, onToggle, onDelete, onAdd }) => {
  const [showAddList, setShowAddList] = useState(false)
  const [showAddTodo, setShowAddTodo] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [newListIcon, setNewListIcon] = useState('CheckCircle')
  const [newListColor, setNewListColor] = useState('teal')
  // Confirmation dialog state for list deletion
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [listToDelete, setListToDelete] = useState(null)

  const handleAddList = (e) => {
    e.preventDefault()
    if (newListName.trim()) {
      onAddList({
        name: newListName.trim(),
        icon: newListIcon,
        color: newListColor
      })
      setNewListName('')
      setShowAddList(false)
    }
  }

  // Handle delete confirmation - shows confirm dialog
  // This is called when user clicks the trash icon next to a list
  const handleDeleteClick = (list) => {
    setListToDelete(list) // Store which list we want to delete
    setShowDeleteConfirm(true) // Show the confirmation dialog
  }

  // Confirm deletion - actually deletes the list and all its tasks
  // This is called when user clicks "Delete List" in the confirmation dialog
  const confirmDelete = () => {
    if (listToDelete) {
      onDeleteList(listToDelete.id) // Call the parent component's delete function
      setShowDeleteConfirm(false) // Hide the confirmation dialog
      setListToDelete(null) // Clear the stored list
    }
  }

  // Cancel deletion - closes the dialog without deleting anything
  // This is called when user clicks "Cancel" or clicks outside the dialog
  const cancelDelete = () => {
    setShowDeleteConfirm(false) // Hide the confirmation dialog
    setListToDelete(null) // Clear the stored list
  }

  const currentList = lists.find(list => list.id === activeList)
  const currentTodos = todos.filter(todo => todo.listId === activeList)

  // If a list is selected, show list details
  if (activeList && currentList) {
    return (
      <div className="lists-view flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-2">
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveList(null)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </motion.button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{currentList.name}</h1>
              <p className="text-gray-600">
                {currentTodos.filter(t => !t.completed).length} tasks remaining
              </p>
            </div>
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
                activeList={activeList}
              />
            )}
          </AnimatePresence>

          <TodoList
            todos={currentTodos}
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

  // Show lists overview
  return (
    <div className="lists-view flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lists</h1>
          <p className="text-gray-600">{lists.length} lists</p>
        </div>
        <ThemeToggle />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-4 pb-20">
        <div className="space-y-3">
          {lists.map((list) => {
            const IconComponent = iconMap[list.icon] || CheckCircle
            const listTodos = todos.filter(todo => todo.listId === list.id)
            const incompleteTasks = listTodos.filter(t => !t.completed).length
            
            return (
              <motion.button
                key={list.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveList(list.id)}
                className="w-full p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${colorMap[list.color]} rounded-lg flex items-center justify-center`}>
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900">{list.name}</h3>
                      <p className="text-sm text-gray-600">
                        {incompleteTasks} tasks remaining
                      </p>
                    </div>
                  </div>
                  
                  {lists.length > 1 && (
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteClick(list)
                      }}
                      className="p-2 hover:text-red-500 transition-all"
                      title="Delete list"
                    >
                      <Trash2 size={16} />
                    </motion.button>
                  )}
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* Add List Form */}
        <AnimatePresence>
          {showAddList && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-4 p-4 bg-white rounded-xl shadow-sm border border-gray-200"
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
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                  >
                    Add List
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddList(false)
                      setNewListName('')
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Add Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowAddList(true)}
        className="fixed bottom-20 right-4 w-14 h-14 bg-teal-500 hover:bg-teal-600 text-white rounded-full shadow-lg flex items-center justify-center z-10"
      >
        <Plus size={24} />
      </motion.button>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {showDeleteConfirm && listToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={cancelDelete}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Delete "{listToDelete.name}" List?
              </h3>
              <p className="text-gray-600 mb-6">
                This will permanently delete the list and all {todos.filter(t => t.listId === listToDelete.id).length} tasks in it. This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  Delete List
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ListsView