import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './components/Sidebar'
import TodoList from './components/TodoList'
import AddTodo from './components/AddTodo'
import TaskStats from './components/TaskStats'
import { ThemeProvider } from './contexts/ThemeContext'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { Bell, CheckCircle, Clock, Plus, Search, Filter } from 'lucide-react'

function App() {
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem('donezo-todos')
    return saved ? JSON.parse(saved) : []
  })
  
  const [lists, setLists] = useState(() => {
    const saved = localStorage.getItem('donezo-lists')
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Personal', color: 'teal', icon: 'CheckCircle' },
      { id: '2', name: 'Work', color: 'coral', icon: 'Clock' },
      { id: '3', name: 'Shopping', color: 'lavender', icon: 'Bell' }
    ]
  })
  
  const [activeList, setActiveList] = useState('1')
  const [showAddTodo, setShowAddTodo] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all') // 'all', 'active', 'completed'
  const [filterPriority, setFilterPriority] = useState('all') // 'all', 'high', 'medium', 'low'
  const [showFilters, setShowFilters] = useState(false)
  const [showStats, setShowStats] = useState(false)

  // Save to localStorage whenever todos or lists change
  useEffect(() => {
    localStorage.setItem('donezo-todos', JSON.stringify(todos))
  }, [todos])

  useEffect(() => {
    localStorage.setItem('donezo-lists', JSON.stringify(lists))
  }, [lists])

  // Check for reminders
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date()
      todos.forEach(todo => {
        if (todo.reminder && !todo.reminderShown && new Date(todo.reminder) <= now) {
          showNotification(todo.title, todo.listName)
          setTodos(prev => prev.map(t => 
            t.id === todo.id ? { ...t, reminderShown: true } : t
          ))
        }
      })
    }

    const interval = setInterval(checkReminders, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [todos])

  // Keyboard shortcuts
  useKeyboardShortcuts({
    'ctrl+n': () => setShowAddTodo(true), // New task
    'ctrl+f': () => {
      const searchInput = document.querySelector('input[placeholder="Search tasks..."]')
      searchInput?.focus()
    }, // Focus search
    'ctrl+shift+f': () => setShowFilters(!showFilters), // Toggle filters
    'ctrl+1': () => setActiveList(lists[0]?.id), // Switch to first list
    'ctrl+2': () => setActiveList(lists[1]?.id), // Switch to second list
    'ctrl+3': () => setActiveList(lists[2]?.id), // Switch to third list
    'escape': () => {
      if (showAddTodo) setShowAddTodo(false)
      if (showFilters) setShowFilters(false)
      if (searchQuery) setSearchQuery('')
    }
  })

  const showNotification = (title, listName) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`Reminder: ${title}`, {
        body: `From your ${listName} list`,
        icon: '/vite.svg'
      })
    }
  }

  const addTodo = (todo) => {
    const newTodo = {
      ...todo,
      id: Date.now().toString(),
      completed: false,
      createdAt: new Date().toISOString(),
      reminderShown: false
    }
    setTodos(prev => [...prev, newTodo])
    setShowAddTodo(false)
  }

  const toggleTodo = (id) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  const deleteTodo = (id) => {
    setTodos(prev => prev.filter(todo => todo.id !== id))
  }

  const addList = (list) => {
    const newList = {
      ...list,
      id: Date.now().toString()
    }
    setLists(prev => [...prev, newList])
  }

  const deleteList = (id) => {
    if (lists.length > 1) {
      setLists(prev => prev.filter(list => list.id !== id))
      setTodos(prev => prev.filter(todo => todo.listId !== id))
      if (activeList === id) {
        setActiveList(lists[0].id)
      }
    }
  }

  // Filter and search todos
  const currentTodos = todos
    .filter(todo => todo.listId === activeList)
    .filter(todo => {
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        return (
          todo.title.toLowerCase().includes(query) ||
          (todo.description && todo.description.toLowerCase().includes(query))
        )
      }
      return true
    })
    .filter(todo => {
      // Status filter
      if (filterStatus === 'active') return !todo.completed
      if (filterStatus === 'completed') return todo.completed
      return true
    })
    .filter(todo => {
      // Priority filter
      if (filterPriority === 'all') return true
      return todo.priority === filterPriority
    })

  const currentList = lists.find(list => list.id === activeList)
  const allTodosInList = todos.filter(todo => todo.listId === activeList)

  return (
    <ThemeProvider>
      <Router>
        <div className="flex h-screen bg-gradient-to-br from-teal-50 to-teal-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
          <Sidebar 
            lists={lists}
            activeList={activeList}
            setActiveList={setActiveList}
            addList={addList}
            deleteList={deleteList}
            showStats={showStats}
            setShowStats={setShowStats}
          />
          
          <main className="flex-1 flex flex-col overflow-hidden">
            <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4 transition-colors duration-300">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {showStats ? 'Statistics' : (currentList?.name || 'All Tasks')}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">
                      {showStats 
                        ? 'Your productivity insights and task analytics'
                        : `${allTodosInList.filter(t => !t.completed).length} tasks remaining${searchQuery ? ` • ${currentTodos.length} shown` : ''}`
                      }
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

                {/* Search and Filter Bar - only show when not in stats view */}
                {!showStats && (
                <div className="flex items-center gap-3">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                    <input
                      type="text"
                      placeholder="Search tasks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowFilters(!showFilters)}
                    className={`p-2 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors duration-200 ${
                      showFilters || filterStatus !== 'all' || filterPriority !== 'all'
                        ? 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-700 text-teal-600 dark:text-teal-400'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <Filter size={18} />
                  </motion.button>
                </div>
                )}

                {/* Filter Options - only show when not in stats view */}
                <AnimatePresence>
                  {!showStats && showFilters && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className="text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-600 dark:text-white rounded px-2 py-1"
                        >
                          <option value="all">All</option>
                          <option value="active">Active</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Priority:</span>
                        <select
                          value={filterPriority}
                          onChange={(e) => setFilterPriority(e.target.value)}
                          className="text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-600 dark:text-white rounded px-2 py-1"
                        >
                          <option value="all">All</option>
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>
                      
                      {(filterStatus !== 'all' || filterPriority !== 'all' || searchQuery) && (
                        <button
                          onClick={() => {
                            setFilterStatus('all')
                            setFilterPriority('all')
                            setSearchQuery('')
                          }}
                          className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 ml-auto"
                        >
                          Clear all
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </header>

            <div className="flex-1 overflow-auto p-6">
              <AnimatePresence mode="wait">
                {showAddTodo && (
                  <AddTodo
                    key="add-todo"
                    onAdd={addTodo}
                    onClose={() => setShowAddTodo(false)}
                    lists={lists}
                    activeList={activeList}
                  />
                )}
              </AnimatePresence>

              {showStats ? (
                <TaskStats todos={todos} lists={lists} />
              ) : (
                <TodoList
                  todos={currentTodos}
                  onToggle={toggleTodo}
                  onDelete={deleteTodo}
                  searchQuery={searchQuery}
                  hasFilters={filterStatus !== 'all' || filterPriority !== 'all'}
                />
              )}
            </div>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App
