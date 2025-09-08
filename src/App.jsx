import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './components/Sidebar'
import TodoList from './components/TodoList'
import AddTodo from './components/AddTodo'

import RecurringTaskModal from './components/RecurringTaskModal'
import Settings from './components/Settings'
import { CheckCircle, Clock, Plus, Moon, Sun, Menu, Zap, Bot, ShoppingCart, Repeat } from 'lucide-react'
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
      { id: '3', name: 'Grocery', color: 'green', icon: 'ShoppingCart', type: 'grocery' },
      { id: '4', name: 'Shopping', color: 'pink', icon: 'ShoppingBag', type: 'task' },
      { id: '5', name: 'Health', color: 'emerald', icon: 'Activity', type: 'task' },
      { id: '6', name: 'Learning', color: 'purple', icon: 'BookOpen', type: 'task' },
      { id: '7', name: 'Home Projects', color: 'orange', icon: 'Home', type: 'task' },
      { id: '8', name: 'Reading List', color: 'indigo', icon: 'Book', type: 'task' }
    ]
  })
  
  const [activeList, setActiveList] = useState('1')
  const [showAddTodo, setShowAddTodo] = useState(false)
  const [showRecurringTask, setShowRecurringTask] = useState(false)
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('donezo-theme')
    return saved || 'light'
  })
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('donezo-settings')
    return saved ? JSON.parse(saved) : { font: 'Rock Salt' }
  })
  const [showThemeTransition, setShowThemeTransition] = useState(false)


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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleSettingsChange = (newSettings) => {
    setSettings(newSettings)
  }

  const handleAddButtonClick = () => {
    setShowAddTodo(true)
  }

  const currentTodos = todos.filter(todo => todo.listId === activeList)
  const currentList = lists.find(list => list.id === activeList)


  return (
    <Router>
      <div className="flex h-screen relative">
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

        {/* Sidebar Overlay for Mobile */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <motion.div
          className={`fixed md:relative z-50 h-full ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          } transition-transform duration-300 ease-in-out`}
        >
          <Sidebar 
            lists={lists}
            activeList={activeList}
            setActiveList={(id) => {
              setActiveList(id)
              setSidebarOpen(false) // Close sidebar on mobile when list is selected
            }}
            addList={addList}
            deleteList={deleteList}
            onClose={() => setSidebarOpen(false)}
            onOpenSettings={() => setShowSettings(true)}
          />
        </motion.div>
        
        <main className="flex-1 flex flex-col overflow-hidden">
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
                {/* Menu Button */}
                <motion.button
                  onClick={toggleSidebar}
                  className="md:hidden p-2 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Menu size={20} className="text-gray-700 dark:text-gray-300" />
                </motion.button>
                
                <div>
                  <motion.h1 
                    className="text-2xl font-bold text-gray-900 dark:text-white"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {currentList?.name || 'All Tasks'}
                  </motion.h1>
                  {/* Task Counter - moved under the title */}
                  <motion.p 
                    className="text-gray-600 dark:text-gray-400 text-sm font-medium mt-1"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {currentTodos.filter(t => !t.completed).length} tasks remaining
                  </motion.p>
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

                {/* Recurring Task Button - only show for task lists */}
                {currentList?.type === 'task' && (
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95, y: 0 }}
                    onClick={() => setShowRecurringTask(true)}
                    className="btn-secondary flex items-center gap-2 px-4 py-2"
                  >
                    <Repeat size={18} />
                    <span className="hidden sm:inline font-semibold">Recurring</span>
                  </motion.button>
                )}
                
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95, y: 0 }}
                  onClick={handleAddButtonClick}
                  className="btn-primary flex items-center gap-2 px-4 py-2"
                >
                  <Plus size={18} />
                  <span className="hidden sm:inline font-semibold">
                    Add Task
                  </span>
                </motion.button>
              </div>
            </div>
          </motion.header>

          <div className="flex-1 overflow-auto p-6 bg-gray-50/50 dark:bg-gray-900/50">
            <TodoList
              todos={currentTodos}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
            />
          </div>
        </main>

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


      </div>
    </Router>
  )
}

export default App
