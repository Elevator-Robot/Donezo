import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'

function AddTodo({ onAdd, onClose, lists, activeList }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [listId, setListId] = useState(activeList)
  const [priority, setPriority] = useState('')

  useEffect(() => {
    setListId(activeList)
  }, [activeList])

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('AddTodo handleSubmit called!')
    if (title.trim()) {
      const currentList = lists.find(list => list.id === listId)
      
      // Debug logging
      console.log('Adding task:', {
        title: title.trim(),
        description: description.trim(),
        listId,
        listName: currentList?.name || 'Unknown',
        priority: priority || null
      })
      
      onAdd({
        title: title.trim(),
        description: description.trim(),
        listId,
        listName: currentList?.name || 'Unknown',
        priority: priority || null
      })
      
      // Clear form
      setTitle('')
      setDescription('')
      setPriority('')
    }
  }



  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="card w-full max-w-md relative z-[10000]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Add New Task</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="input-field"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details..."
              rows={3}
              className="input-field resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              List
            </label>
            <select
              value={listId}
              onChange={(e) => setListId(e.target.value)}
              className="input-field"
            >
              {lists.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <div className="flex gap-2">
              {[
                { value: 'low', label: 'Low', color: 'bg-green-100 text-green-700' },
                { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
                { value: 'high', label: 'High', color: 'bg-red-100 text-red-700' }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPriority(priority === option.value ? '' : option.value)}
                  className={`px-3 py-2 rounded-lg border-2 transition-all duration-200 ${
                    priority === option.value
                      ? `${option.color} border-transparent`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>



          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="btn-primary flex-1 relative z-[10001]"
              disabled={!title.trim()}
            >
              Add Task
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default AddTodo
