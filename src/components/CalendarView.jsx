import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { format, startOfWeek, addDays, isToday, isSameDay } from 'date-fns'

function CalendarView({ todos, lists, onAddRecurringTask, onDeleteTodo }) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showAddRecurring, setShowAddRecurring] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskList, setNewTaskList] = useState(lists[0]?.id || '')
  const [recurringType, setRecurringType] = useState('daily')

  // Generate week dates starting from Monday
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  // Filter recurring tasks (simulated - in real app this would be stored differently)
  const recurringTasks = todos.filter(todo => todo.isRecurring)

  const getTasksForDate = (date) => {
    return todos.filter(todo => {
      const todoDate = new Date(todo.createdAt)
      const reminderDate = todo.reminder ? new Date(todo.reminder) : null
      
      return isSameDay(todoDate, date) || (reminderDate && isSameDay(reminderDate, date))
    })
  }

  const handleAddRecurring = (e) => {
    e.preventDefault()
    if (newTaskTitle.trim()) {
      const recurringTask = {
        title: newTaskTitle.trim(),
        listId: newTaskList,
        listName: lists.find(l => l.id === newTaskList)?.name || 'Unknown',
        isRecurring: true,
        recurringType,
        createdAt: new Date().toISOString()
      }
      
      onAddRecurringTask(recurringTask)
      setNewTaskTitle('')
      setShowAddRecurring(false)
    }
  }

  const navigateWeek = (direction) => {
    setSelectedDate(prev => addDays(prev, direction * 7))
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="bg-white shadow-sm border-b border-lavender-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-6 h-6 text-lavender-600" />
              <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
            </div>
            <p className="text-lavender-600 mt-1">
              Track recurring tasks and schedule
            </p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddRecurring(true)}
            className="bg-lavender-500 hover:bg-lavender-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <RotateCcw size={20} />
            Add Recurring
          </motion.button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6">
        <AnimatePresence>
          {showAddRecurring && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mb-6 p-4 bg-lavender-50 rounded-lg border border-lavender-200"
            >
              <form onSubmit={handleAddRecurring} className="space-y-3">
                <input
                  type="text"
                  placeholder="Recurring task title"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="input-field"
                  autoFocus
                />
                
                <div className="flex gap-4">
                  <select
                    value={newTaskList}
                    onChange={(e) => setNewTaskList(e.target.value)}
                    className="input-field flex-1"
                  >
                    {lists.map((list) => (
                      <option key={list.id} value={list.id}>
                        {list.name}
                      </option>
                    ))}
                  </select>
                  
                  <select
                    value={recurringType}
                    onChange={(e) => setRecurringType(e.target.value)}
                    className="input-field flex-1"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-lavender-500 hover:bg-lavender-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md flex-1"
                  >
                    Add Recurring Task
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddRecurring(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Week Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateWeek(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h2 className="text-lg font-semibold text-gray-900">
            {format(weekStart, 'MMMM d')} - {format(addDays(weekStart, 6), 'MMMM d, yyyy')}
          </h2>
          
          <button
            onClick={() => navigateWeek(1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Week View */}
        <div className="grid grid-cols-7 gap-2 mb-6">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
            <div key={day} className="text-center">
              <div className="text-sm font-medium text-gray-600 mb-2">{day}</div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className={`p-3 rounded-lg border-2 cursor-pointer min-h-[120px] ${
                  isToday(weekDays[index])
                    ? 'border-lavender-300 bg-lavender-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                onClick={() => setSelectedDate(weekDays[index])}
              >
                <div className={`text-lg font-semibold mb-2 ${
                  isToday(weekDays[index]) ? 'text-lavender-600' : 'text-gray-900'
                }`}>
                  {format(weekDays[index], 'd')}
                </div>
                
                {/* Tasks for this day */}
                <div className="space-y-1">
                  {getTasksForDate(weekDays[index]).slice(0, 2).map((task, taskIndex) => (
                    <div
                      key={taskIndex}
                      className={`text-xs p-1 rounded text-white truncate ${
                        lists.find(l => l.id === task.listId)?.color === 'teal' ? 'bg-teal-500' :
                        lists.find(l => l.id === task.listId)?.color === 'coral' ? 'bg-coral-500' :
                        'bg-lavender-500'
                      }`}
                    >
                      {task.title}
                    </div>
                  ))}
                  {getTasksForDate(weekDays[index]).length > 2 && (
                    <div className="text-xs text-gray-500">
                      +{getTasksForDate(weekDays[index]).length - 2} more
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          ))}
        </div>

        {/* Recurring Tasks Section */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <RotateCcw className="w-5 h-5 text-lavender-600" />
            <h3 className="text-lg font-semibold text-gray-900">Recurring Tasks</h3>
          </div>
          
          {recurringTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <RotateCcw className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No recurring tasks set up yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recurringTasks.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-between p-3 bg-lavender-50 rounded-lg border border-lavender-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-lavender-500 rounded-full"></div>
                    <div>
                      <div className="font-medium text-gray-900">{task.title}</div>
                      <div className="text-sm text-gray-600">
                        {task.listName} • Repeats {task.recurringType}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => onDeleteTodo(task.id)}
                    className="hover:text-red-500 transition-colors p-1 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CalendarView