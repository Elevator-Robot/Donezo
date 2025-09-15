import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Calendar, Clock, Repeat, ChevronDown, ChevronUp } from 'lucide-react'

function RecurringTaskModal({ onAdd, onClose, lists, activeList }) {
  const [title, setTitle] = useState('')
  const [listId, setListId] = useState(activeList)
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [dueTime, setDueTime] = useState('')
  const [recurrenceType, setRecurrenceType] = useState('daily')
  const [recurrenceInterval, setRecurrenceInterval] = useState(1)
  const [recurrenceDays, setRecurrenceDays] = useState([1, 2, 3, 4, 5]) // Mon-Fri
  const [recurrenceEnd, setRecurrenceEnd] = useState('never') // never, after, until
  const [recurrenceEndValue, setRecurrenceEndValue] = useState('')
  const [showRecurrenceOptions, setShowRecurrenceOptions] = useState(false)

  const recurrenceTypes = [
    { value: 'daily', label: 'Daily', description: 'Every day' },
    { value: 'weekly', label: 'Weekly', description: 'Every week' },
    { value: 'monthly', label: 'Monthly', description: 'Every month' },
    { value: 'yearly', label: 'Yearly', description: 'Every year' },
    { value: 'weekdays', label: 'Weekdays', description: 'Monday to Friday' },
    { value: 'weekends', label: 'Weekends', description: 'Saturday and Sunday' },
    { value: 'custom', label: 'Custom', description: 'Custom schedule' }
  ]


  const weekDays = [
    { value: 0, label: 'Sun', name: 'Sunday' },
    { value: 1, label: 'Mon', name: 'Monday' },
    { value: 2, label: 'Tue', name: 'Tuesday' },
    { value: 3, label: 'Wed', name: 'Wednesday' },
    { value: 4, label: 'Thu', name: 'Thursday' },
    { value: 5, label: 'Fri', name: 'Friday' },
    { value: 6, label: 'Sat', name: 'Saturday' }
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    if (title.trim()) {
      const currentList = lists.find(list => list.id === listId)
      
      const recurringTask = {
        title: title.trim(),
        listId,
        listName: currentList?.name || 'Unknown',
        startDate,
        dueTime,
        recurrence: {
          type: recurrenceType,
          interval: recurrenceInterval,
          days: recurrenceType === 'custom' ? recurrenceDays : null,
          end: recurrenceEnd,
          endValue: recurrenceEndValue
        },
        isRecurring: true,
        nextDueDate: calculateNextDueDate()
      }
      
      onAdd(recurringTask)
      
      // Clear form
      setTitle('')
      setStartDate(new Date().toISOString().split('T')[0])
      setDueTime('')
      setRecurrenceType('daily')
      setRecurrenceInterval(1)
      setRecurrenceDays([1, 2, 3, 4, 5])
      setRecurrenceEnd('never')
      setRecurrenceEndValue('')
    }
  }

  const calculateNextDueDate = () => {
    const start = new Date(startDate)
    const today = new Date()
    
    if (recurrenceType === 'daily') {
      return start.toISOString().split('T')[0]
    } else if (recurrenceType === 'weekdays') {
      let nextDate = new Date(start)
      while (nextDate.getDay() === 0 || nextDate.getDay() === 6) {
        nextDate.setDate(nextDate.getDate() + 1)
      }
      return nextDate.toISOString().split('T')[0]
    } else if (recurrenceType === 'weekends') {
      let nextDate = new Date(start)
      while (nextDate.getDay() !== 0 && nextDate.getDay() !== 6) {
        nextDate.setDate(nextDate.getDate() + 1)
      }
      return nextDate.toISOString().split('T')[0]
    }
    
    return start.toISOString().split('T')[0]
  }

  const toggleDay = (dayValue) => {
    if (recurrenceDays.includes(dayValue)) {
      setRecurrenceDays(recurrenceDays.filter(d => d !== dayValue))
    } else {
      setRecurrenceDays([...recurrenceDays, dayValue].sort())
    }
  }


  const getRecurrenceDescription = () => {
    switch (recurrenceType) {
      case 'daily':
        return `Every ${recurrenceInterval > 1 ? `${recurrenceInterval} days` : 'day'}`
      case 'weekly':
        return `Every ${recurrenceInterval > 1 ? `${recurrenceInterval} weeks` : 'week'}`
      case 'monthly':
        return `Every ${recurrenceInterval > 1 ? `${recurrenceInterval} months` : 'month'}`
      case 'yearly':
        return `Every ${recurrenceInterval > 1 ? `${recurrenceInterval} years` : 'year'}`
      case 'weekdays':
        return 'Every weekday (Monday to Friday)'
      case 'weekends':
        return 'Every weekend (Saturday and Sunday)'
      case 'custom':
        const selectedDays = weekDays.filter(day => recurrenceDays.includes(day.value))
        return `Every ${selectedDays.map(day => day.label).join(', ')}`
      default:
        return 'No recurrence'
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
        className="card w-full max-w-2xl relative z-[10000] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Repeat className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create Recurring Task</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
          >
            <X size={20} className="text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Task Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
          </div>



          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Due Time (Optional)
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          {/* Recurrence Settings */}
          <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <button
              type="button"
              onClick={() => setShowRecurrenceOptions(!showRecurrenceOptions)}
              className="w-full flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-3">
                <Repeat className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Recurrence</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{getRecurrenceDescription()}</p>
                </div>
              </div>
              {showRecurrenceOptions ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>

            {showRecurrenceOptions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Recurrence Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {recurrenceTypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setRecurrenceType(type.value)}
                        className={`p-3 rounded-lg border-2 text-left transition-all duration-200 ${
                          recurrenceType === type.value
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <div className="font-medium text-gray-900 dark:text-white">{type.label}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{type.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {recurrenceType !== 'weekdays' && recurrenceType !== 'weekends' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Interval
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="99"
                      value={recurrenceInterval}
                      onChange={(e) => setRecurrenceInterval(parseInt(e.target.value) || 1)}
                      className="input-field w-24"
                    />
                  </div>
                )}

                {recurrenceType === 'custom' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Days of Week
                    </label>
                    <div className="flex gap-2">
                      {weekDays.map((day) => (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => toggleDay(day.value)}
                          className={`px-3 py-2 rounded-lg border-2 transition-all duration-200 ${
                            recurrenceDays.includes(day.value)
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                          }`}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Date
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'never', label: 'Never' },
                      { value: 'after', label: 'After' },
                      { value: 'until', label: 'Until' }
                    ].map((option) => (
                      <div key={option.value} className="flex items-center gap-3">
                        <input
                          type="radio"
                          id={option.value}
                          name="recurrenceEnd"
                          value={option.value}
                          checked={recurrenceEnd === option.value}
                          onChange={(e) => setRecurrenceEnd(e.target.value)}
                          className="text-blue-600"
                        />
                        <label htmlFor={option.value} className="text-sm text-gray-700 dark:text-gray-300">
                          {option.label}
                        </label>
                        {option.value !== 'never' && recurrenceEnd === option.value && (
                          <input
                            type={option.value === 'after' ? 'number' : 'date'}
                            value={recurrenceEndValue}
                            onChange={(e) => setRecurrenceEndValue(e.target.value)}
                            className="input-field w-32"
                            placeholder={option.value === 'after' ? 'Occurrences' : ''}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>


          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="btn-primary flex-1 relative z-[10001]"
              disabled={!title.trim()}
            >
              Create Recurring Task
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

export default RecurringTaskModal
