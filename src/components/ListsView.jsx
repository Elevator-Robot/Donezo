import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, List, CheckCircle, Trash2 } from 'lucide-react'

const iconMap = {
  CheckCircle,
  Clock: () => <div className="w-4 h-4 border-2 border-current rounded-full flex items-center justify-center"><div className="w-1 h-1 bg-current rounded-full"></div></div>,
  Bell: () => <div className="w-4 h-4 relative"><div className="w-3 h-3 border-2 border-current rounded-t-full"></div><div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-current rounded-full"></div></div>,
  Home: () => <div className="w-4 h-4 relative"><div className="w-3 h-2 border-2 border-current border-b-0"></div><div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-b-2 border-transparent border-b-current"></div></div>,
  Calendar,
  Star: () => <div className="w-4 h-4 relative"><div className="absolute inset-0 transform rotate-0"><div className="w-full h-0.5 bg-current absolute top-1/2 left-0"></div><div className="h-full w-0.5 bg-current absolute left-1/2 top-0"></div></div></div>
}

const colorMap = {
  teal: 'bg-teal-500',
  coral: 'bg-coral-500', 
  lavender: 'bg-lavender-500'
}

function ListsView({ lists, todos, activeList, setActiveList, addList, deleteList, onNavigateToList }) {
  const [showAddList, setShowAddList] = useState(false)
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

  const getListTaskCount = (listId) => {
    const listTodos = todos.filter(todo => todo.listId === listId)
    const incomplete = listTodos.filter(todo => !todo.completed).length
    return { total: listTodos.length, incomplete }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="bg-white shadow-sm border-b border-teal-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <List className="w-6 h-6 text-teal-600" />
              <h1 className="text-2xl font-bold text-gray-900">Lists</h1>
            </div>
            <p className="text-teal-600 mt-1">
              Manage your task lists
            </p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddList(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            New List
          </motion.button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6">
        <AnimatePresence>
          {showAddList && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mb-6 p-4 bg-teal-50 rounded-lg border border-teal-200"
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lists.map((list) => {
            const IconComponent = iconMap[list.icon] || CheckCircle
            const taskCount = getListTaskCount(list.id)
            
            return (
              <motion.div
                key={list.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                className="card group cursor-pointer"
                onClick={() => onNavigateToList(list.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 ${colorMap[list.color]} rounded-xl flex items-center justify-center`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  
                  {lists.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteList(list.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity p-1 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{list.name}</h3>
                
                <div className="text-sm text-gray-600">
                  {taskCount.incomplete > 0 ? (
                    <span className="text-coral-600 font-medium">
                      {taskCount.incomplete} pending
                    </span>
                  ) : (
                    <span className="text-teal-600 font-medium">
                      All done!
                    </span>
                  )}
                  <span className="text-gray-500 ml-1">
                    • {taskCount.total} total
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ListsView