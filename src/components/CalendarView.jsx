import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns'
import AddTodo from './AddTodo'
import ThemeToggle from './ThemeToggle'

const CalendarView = ({ todos, lists, onAdd, onToggle, onDelete }) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [showAddTodo, setShowAddTodo] = useState(false)
  
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }
  
  const getTasksForDate = (date) => {
    return todos.filter(todo => {
      if (!todo.due) return false
      return isSameDay(new Date(todo.due), date)
    })
  }
  
  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : []

  return (
    <div className="calendar-view flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600">{format(currentDate, 'MMMM yyyy')}</p>
        </div>
        <ThemeToggle />
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between px-4 pb-4">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={goToPreviousMonth}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <ChevronLeft size={20} className="text-gray-600" />
        </motion.button>
        
        <h2 className="text-lg font-semibold text-gray-900">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={goToNextMonth}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <ChevronRight size={20} className="text-gray-600" />
        </motion.button>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto px-4 pb-20">
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {days.map(day => {
            const tasksForDay = getTasksForDate(day)
            const isCurrentMonth = isSameMonth(day, currentDate)
            const isDayToday = isToday(day)
            const isSelected = selectedDate && isSameDay(day, selectedDate)
            
            return (
              <motion.button
                key={day.toISOString()}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedDate(isSelected ? null : day)}
                className={`
                  aspect-square p-1 rounded-lg text-sm relative
                  ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                  ${isDayToday ? 'bg-teal-500 text-white font-bold' : 'hover:bg-gray-100'}
                  ${isSelected ? 'bg-teal-100 border-2 border-teal-500' : ''}
                `}
              >
                <div className="font-medium">{format(day, 'd')}</div>
                {tasksForDay.length > 0 && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      isDayToday ? 'bg-white' : 'bg-teal-500'
                    }`} />
                  </div>
                )}
              </motion.button>
            )
          })}
        </div>

        {/* Selected Date Tasks */}
        {selectedDate && selectedDateTasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 space-y-3"
          >
            <h3 className="text-lg font-semibold text-gray-900">
              Tasks for {format(selectedDate, 'MMM d, yyyy')}
            </h3>
            {selectedDateTasks.map(todo => {
              const list = lists.find(l => l.id === todo.listId)
              return (
                <motion.div
                  key={todo.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-3 bg-white rounded-lg shadow-sm border border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onToggle(todo.id)}
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        todo.completed 
                          ? 'bg-teal-500 border-teal-500' 
                          : 'border-gray-300 hover:border-teal-400'
                      }`}
                    >
                      {todo.completed && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2 h-2 bg-white rounded-full"
                        />
                      )}
                    </motion.button>
                    <div className="flex-1">
                      <div className={`font-medium ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {todo.title}
                      </div>
                      {list && (
                        <div className="text-sm text-gray-500">{list.name}</div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}

        {/* Add Todo Form */}
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
              defaultDue={selectedDate?.toISOString().split('T')[0]}
            />
          )}
        </AnimatePresence>
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

export default CalendarView