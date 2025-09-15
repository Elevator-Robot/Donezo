import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import TodoList from './components/TodoList'
import AddTodo from './components/AddTodo'
import RecurringTaskModal from './components/RecurringTaskModal'
import Settings from './components/Settings'
import { CheckCircle, Clock, Plus, Moon, Sun, Calendar, List, Home, Zap, Bot, Repeat, X } from 'lucide-react'
import { generateRecurringInstances, calculateNextDueDate } from './utils/recurringTaskUtils'

function App() {
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem('donezo-todos')
    return saved ? JSON.parse(saved) : []
  })
  
  const [lists, setLists] = useState(() => {
    const saved = localStorage.getItem('donezo-lists')
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Personal', color: 'teal', icon: 'Heart', type: 'task' },
      { id: '2', name: 'Work', color: 'blue', icon: 'Zap', type: 'task' },
      { id: '3', name: 'Shopping', color: 'green', icon: 'ShoppingCart', type: 'task' }
    ]
  })
  
  const [activeList, setActiveList] = useState('1')
  const [showAddTodo, setShowAddTodo] = useState(false)
  const [showRecurringTask, setShowRecurringTask] = useState(false)
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('donezo-theme')
    return saved || 'light'
  })
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('donezo-settings')
    return saved ? JSON.parse(saved) : { font: 'Rock Salt' }
  })
  const [showThemeTransition, setShowThemeTransition] = useState(false)
  const [activeTab, setActiveTab] = useState('today') // 'today', 'lists', 'calendar'
  const [showListModal, setShowListModal] = useState(false)
  const [selectedList, setSelectedList] = useState(null)


  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('donezo-todos', JSON.stringify(todos))
  }, [todos])

  useEffect(() => {
    localStorage.setItem('donezo-lists', JSON.stringify(lists))
  }, [lists])

  useEffect(() => {
    console.log('Theme changed to:', theme)
    localStorage.setItem('donezo-theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
    console.log('Applied data-theme attribute:', document.documentElement.getAttribute('data-theme'))
    // Also set the class for Tailwind dark mode
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('donezo-settings', JSON.stringify(settings))
  }, [settings])

  // Apply font settings
  useEffect(() => {
    // Apply font
    document.documentElement.style.setProperty('--app-font', `'${settings.font}'`)
  }, [settings])


  const addTodo = (todo) => {
    // Debug logging
    console.log('App.jsx addTodo called with:', todo)
    
    const newTodo = {
      ...todo,
      id: Date.now().toString(),
      completed: false,
      createdAt: new Date().toISOString()
    }
    
    console.log('New todo created:', newTodo)
    
    setTodos(prev => {
      const updatedTodos = [...prev, newTodo]
      console.log('Updated todos:', updatedTodos)
      return updatedTodos
    })
    setShowAddTodo(false)
  }

  const addRecurringTask = (recurringTask) => {
    console.log('App.jsx addRecurringTask called with:', recurringTask)
    
    const newRecurringTask = {
      ...recurringTask,
      id: Date.now().toString(),
      completed: false,
      createdAt: new Date().toISOString()
    }
    
    // Generate the first few instances of the recurring task
    const instances = generateRecurringInstances(newRecurringTask, 5)
    
    setTodos(prev => {
      const updatedTodos = [...prev, ...instances]
      console.log('Updated todos with recurring instances:', updatedTodos)
      return updatedTodos
    })
    setShowRecurringTask(false)
  }

  const toggleTodo = (id) => {
    setTodos(prev => {
      const updatedTodos = prev.map(todo => {
        if (todo.id === id) {
          const updatedTodo = {
            ...todo,
            completed: !todo.completed,
            completedAt: !todo.completed ? new Date().toISOString() : null
          }
          
          // If this is a recurring task instance and it's being completed,
          // create the next instance
          if (updatedTodo.completed && todo.isRecurringInstance && todo.parentRecurringTaskId) {
            const parentTask = prev.find(t => t.id === todo.parentRecurringTaskId)
            if (parentTask && parentTask.recurrence) {
              const nextDueDate = calculateNextDueDate(parentTask.recurrence, todo.dueDate)
              const nextInstance = {
                ...parentTask,
                id: `${parentTask.id}-${Date.now()}`,
                dueDate: nextDueDate,
                completed: false,
                createdAt: new Date().toISOString()
              }
              return [updatedTodo, nextInstance]
            }
          }
          
          return updatedTodo
        }
        return todo
      })
      
      // Flatten the array in case we added new instances
      return updatedTodos.flat()
    })
  }

  const deleteTodo = (id) => {
    setTodos(prev => prev.filter(todo => todo.id !== id))
  }

  const addList = (list) => {
    const newList = {
      ...list,
      id: Date.now().toString(),
      type: 'task'
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

  const toggleTheme = () => {
    console.log('=== THEME TOGGLE DEBUG ===')
    console.log('Current theme before toggle:', theme)
    console.log('Current theme type:', typeof theme)
    
    setTheme(prev => {
      let newTheme
      console.log('Previous theme in setter:', prev)
      if (prev === 'light') {
        newTheme = 'dark'
        console.log('Switching from light to dark')
      } else if (prev === 'dark') {
        newTheme = 'cyberpunk'
        console.log('Switching from dark to cyberpunk')
      } else {
        newTheme = 'light'
        console.log('Switching from cyberpunk to light')
      }
      
      console.log('New theme will be:', newTheme)
      return newTheme
    })
  }

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun size={18} className="text-gray-700 dark:text-gray-300" />
      case 'dark':
        return <Moon size={18} className="text-gray-700 dark:text-gray-300" />
      case 'cyberpunk':
        return <Bot size={18} className="text-gray-700 dark:text-gray-300" />
      default:
        return <Sun size={18} className="text-gray-700 dark:text-gray-300" />
    }
  }

  const getThemeTitle = () => {
    switch (theme) {
      case 'light':
        return 'Switch to Dark'
      case 'dark':
        return 'Switch to Cyberpunk'
      case 'cyberpunk':
        return 'Switch to Light'
      default:
        return 'Toggle theme'
    }
  }


  const handleSettingsChange = (newSettings) => {
    setSettings(newSettings)
  }

  const handleAddButtonClick = () => {
    setShowAddTodo(true)
  }

  const handleListSelect = (list) => {
    setSelectedList(list)
    setShowListModal(true)
  }

  // Get today's tasks (tasks due today or overdue)
  const getTodaysTasks = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    return todos.filter(todo => {
      if (todo.completed) return false
      if (!todo.dueDate) return false
      
      const dueDate = new Date(todo.dueDate)
      dueDate.setHours(0, 0, 0, 0)
      
      return dueDate <= today
    })
  }

  const currentTodos = todos.filter(todo => todo.listId === activeList)
  const currentList = lists.find(list => list.id === activeList)
  const todaysTasks = getTodaysTasks()


  return (
    <Router>
      <div className="flex flex-col h-screen relative">
        {/* Animated Background */}
        <motion.div 
          className={`animated-background ${theme === 'cyberpunk' ? 'cyberpunk-bg' : ''}`}
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        {/* Cyberpunk Grid Overlay */}
        <div className={`cyberpunk-grid ${theme === 'cyberpunk' ? 'opacity-100' : 'opacity-0'}`} />
        
        {/* Matrix Rain Animation */}
        <div className={`matrix-rain ${theme === 'cyberpunk' ? 'opacity-100' : 'opacity-0'}`}>
          <div className="matrix-column">01 10 11 00 01 10 11 00 01 10 11 00 01 10 11 00 01 10 11 00</div>
          <div className="matrix-column">10 01 00 11 10 01 00 11 10 01 00 11 10 01 00 11 10 01 00 11</div>
          <div className="matrix-column">11 00 01 10 11 00 01 10 11 00 01 10 11 00 01 10 11 00 01 10</div>
          <div className="matrix-column">00 11 10 01 00 11 10 01 00 11 10 01 00 11 10 01 00 11 10 01</div>
          <div className="matrix-column">01 10 11 00 01 10 11 00 01 10 11 00 01 10 11 00 01 10 11 00</div>
          <div className="matrix-column">10 01 00 11 10 01 00 11 10 01 00 11 10 01 00 11 10 01 00 11</div>
          <div className="matrix-column">11 00 01 10 11 00 01 10 11 00 01 10 11 00 01 10 11 00 01 10</div>
          <div className="matrix-column">00 11 10 01 00 11 10 01 00 11 10 01 00 11 10 01 00 11 10 01</div>
          <div className="matrix-column">01 10 11 00 01 10 11 00 01 10 11 00 01 10 11 00 01 10 11 00</div>
          <div className="matrix-column">10 01 00 11 10 01 00 11 10 01 00 11 10 01 00 11 10 01 00 11</div>
        </div>
        
        {/* Starfield for Dark Mode */}
        <motion.div 
          className={`starfield ${theme === 'dark' ? 'active' : ''}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: theme === 'dark' ? 1 : 0 }}
          transition={{ duration: 0.8 }}
        >
          {theme === 'dark' && Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              className="star"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
                '--twinkle-duration': `${Math.random() * 4 + 2}s`
              }}
              animate={{
                opacity: [0.2, 1, 0.2],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: Math.random() * 4 + 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>
        
        {/* Completion Particles Container */}
        <div className="completion-particles"></div>

        {/* Theme Transition Overlay */}
        <AnimatePresence>
          {showThemeTransition && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="cyberpunk-transition"
            />
          )}
        </AnimatePresence>

        {/* Header */}
        <motion.header 
          className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm border-b border-gray-200/50 dark:border-gray-700/50 px-6 py-4 ${
            theme === 'cyberpunk' ? 'cyberpunk-header' : ''
          }`}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">Donezo</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95, y: 0 }}
                onClick={toggleTheme}
                className="p-2 rounded-xl border border-gray-200/50 dark:border-gray-600/50 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-all duration-300"
                title={getThemeTitle()}
              >
                <motion.div
                  initial={false}
                  animate={{ rotate: theme === 'dark' ? 180 : theme === 'cyberpunk' ? 360 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {getThemeIcon()}
                </motion.div>
              </motion.button>
            </div>
          </div>
        </motion.header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-gray-50/50 dark:bg-gray-900/50 pb-20">
          <div className="p-6">
            {activeTab === 'today' && (
              <motion.div
                key="today"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Today's Tasks
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {todaysTasks.length} tasks due today
                  </p>
                </div>
                <TodoList
                  todos={todaysTasks}
                  onToggle={toggleTodo}
                  onDelete={deleteTodo}
                />
              </motion.div>
            )}

            {activeTab === 'lists' && (
              <motion.div
                key="lists"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Task Lists
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Organize your tasks into different lists
                  </p>
                </div>
                
                {/* Lists Grid */}
                <div className="grid grid-cols-1 gap-4">
                  {lists.map((list) => (
                    <motion.div
                      key={list.id}
                      className="p-6 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-600 cursor-pointer transition-all duration-200 bg-white dark:bg-gray-800"
                      onClick={() => handleListSelect(list)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-4 mb-3">
                        <div className={`w-4 h-4 ${list.color === 'teal' ? 'bg-teal-500' : list.color === 'blue' ? 'bg-blue-500' : list.color === 'green' ? 'bg-green-500' : 'bg-gray-500'} rounded-full`}></div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{list.name}</h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {todos.filter(todo => todo.listId === list.id && !todo.completed).length} tasks remaining
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'calendar' && (
              <motion.div
                key="calendar"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-md"
                  >
                    <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-teal-600 dark:text-teal-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Calendar View
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Schedule and view your recurring tasks on a calendar.
                    </p>
                    <motion.button
                      onClick={() => setShowRecurringTask(true)}
                      className="btn-primary flex items-center gap-2 mx-auto"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Plus size={18} />
                      <span>Add Recurring Task</span>
                    </motion.button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </div>
        </main>

        {/* Bottom Navigation */}
        <motion.nav 
          className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-t border-gray-200/50 dark:border-gray-700/50 z-50"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        >
          <div className="flex items-center justify-around py-2">
            {/* Today Tab */}
            <motion.button
              onClick={() => setActiveTab('today')}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all duration-200 ${
                activeTab === 'today'
                  ? 'text-teal-600 dark:text-teal-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Home size={20} />
              <span className="text-xs font-medium">Today</span>
            </motion.button>

            {/* Lists Tab */}
            <motion.button
              onClick={() => setActiveTab('lists')}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all duration-200 ${
                activeTab === 'lists'
                  ? 'text-teal-600 dark:text-teal-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <List size={20} />
              <span className="text-xs font-medium">Lists</span>
            </motion.button>

            {/* Calendar Tab */}
            <motion.button
              onClick={() => setActiveTab('calendar')}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all duration-200 ${
                activeTab === 'calendar'
                  ? 'text-teal-600 dark:text-teal-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Calendar size={20} />
              <span className="text-xs font-medium">Calendar</span>
            </motion.button>
          </div>
        </motion.nav>

        {/* Floating Action Button */}
        <motion.button
          onClick={handleAddButtonClick}
          className="fixed bottom-20 right-6 w-14 h-14 bg-teal-500 hover:bg-teal-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-40 flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
        >
          <Plus size={24} />
        </motion.button>

        {/* AddTodo Modal - moved outside main content */}
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



        {/* RecurringTaskModal */}
        <AnimatePresence mode="wait">
          {showRecurringTask && (
            <RecurringTaskModal
              key="add-recurring"
              onAdd={addRecurringTask}
              onClose={() => setShowRecurringTask(false)}
              lists={lists}
              activeList={activeList}
            />
          )}
        </AnimatePresence>

        {/* Settings Modal */}
        <Settings
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          settings={settings}
          onSettingsChange={handleSettingsChange}
        />

        {/* List Modal */}
        <AnimatePresence mode="wait">
          {showListModal && selectedList && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]"
              onClick={() => setShowListModal(false)}
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
                    <div className={`w-8 h-8 ${selectedList.color === 'teal' ? 'bg-teal-100 dark:bg-teal-900/30' : selectedList.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' : selectedList.color === 'green' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-900/30'} rounded-lg flex items-center justify-center`}>
                      <List className={`w-5 h-5 ${selectedList.color === 'teal' ? 'text-teal-600 dark:text-teal-400' : selectedList.color === 'blue' ? 'text-blue-600 dark:text-blue-400' : selectedList.color === 'green' ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedList.name}</h2>
                  </div>
                  <button
                    onClick={() => setShowListModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                  >
                    <X size={20} className="text-gray-700 dark:text-gray-300" />
                  </button>
                </div>

                <div className="mb-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    {todos.filter(todo => todo.listId === selectedList.id && !todo.completed).length} tasks remaining
                  </p>
                </div>

                <TodoList
                  todos={todos.filter(todo => todo.listId === selectedList.id)}
                  onToggle={toggleTodo}
                  onDelete={deleteTodo}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </Router>
  )
}

export default App
