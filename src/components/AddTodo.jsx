import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Clock, Bell, AlertCircle } from 'lucide-react'

function AddTodo({ onAdd, onClose, lists, activeList }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [listId, setListId] = useState(activeList)
  const [priority, setPriority] = useState('')
  const [reminder, setReminder] = useState('')
  const [showReminderOptions, setShowReminderOptions] = useState(false)

  useEffect(() => {
    setListId(activeList)
  }, [activeList])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (title.trim()) {
      const currentList = lists.find(list => list.id === listId)
      onAdd({
        title: title.trim(),
        description: description.trim(),
        listId,
        listName: currentList?.name || 'Unknown',
        priority: priority || null,
        reminder: reminder || null
      })
    }
  }

  const setQuickReminder = (hours) => {
    const now = new Date()
    const reminderTime = new Date(now.getTime() + hours * 60 * 60 * 1000)
    setReminder(reminderTime.toISOString())
    setShowReminderOptions(false)
  }

  const clearReminder = () => {
    setReminder('')
    setShowReminderOptions(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="card w-full max-w-md"
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reminder
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="datetime-local"
                  value={reminder ? reminder.slice(0, 16) : ''}
                  onChange={(e) => setReminder(e.target.value ? new Date(e.target.value).toISOString() : '')}
                  className="input-field flex-1"
                />
                <button
                  type="button"
                  onClick={() => setShowReminderOptions(!showReminderOptions)}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <Clock size={20} />
                </button>
              </div>

              {showReminderOptions && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="text-sm font-medium text-gray-700 mb-2">Quick Reminders</div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { hours: 1, label: '1 hour' },
                      { hours: 3, label: '3 hours' },
                      { hours: 6, label: '6 hours' },
                      { hours: 24, label: 'Tomorrow' },
                      { hours: 168, label: 'Next week' }
                    ].map((option) => (
                      <button
                        key={option.hours}
                        type="button"
                        onClick={() => setQuickReminder(option.hours)}
                        className="px-3 py-1 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  {reminder && (
                    <button
                      type="button"
                      onClick={clearReminder}
                      className="mt-2 text-sm text-red-600 hover:text-red-700"
                    >
                      Clear reminder
                    </button>
                  )}
                </motion.div>
              )}

              {reminder && (
                <div className="flex items-center gap-2 text-sm text-teal-600">
                  <Bell size={16} />
                  <span>
                    Reminder set for {new Date(reminder).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="btn-primary flex-1"
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
