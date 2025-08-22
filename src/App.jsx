import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './components/Sidebar'
import TodoList from './components/TodoList'
import AddTodo from './components/AddTodo'
import Settings from './components/Settings'
import { CheckCircle, Clock, Plus, Moon, Sun, Menu } from 'lucide-react'

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
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('donezo-theme')
    return saved || 'light'
  })
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('donezo-settings')
    return saved ? JSON.parse(saved) : {
      font: 'Rock Salt'
    }
  })

  // Save to localStorage whenever todos or lists change
  useEffect(() => {
    localStorage.setItem('donezo-todos', JSON.stringify(todos))
  }, [todos])

  useEffect(() => {
    localStorage.setItem('donezo-lists', JSON.stringify(lists))
  }, [lists])

  useEffect(() => {
    localStorage.setItem('donezo-theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
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

  const toggleTodo = (id) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { 
        ...todo, 
        completed: !todo.completed,
        completedAt: !todo.completed ? new Date().toISOString() : null
      } : todo
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

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleSettingsChange = (newSettings) => {
    setSettings(newSettings)
  }

  const currentTodos = todos.filter(todo => todo.listId === activeList)
  const currentList = lists.find(list => list.id === activeList)

  return (
    <Router>
      <div className="flex h-screen relative">
        {/* Animated Background */}
        <motion.div 
          className="animated-background"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
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
            className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200/50 px-6 py-4"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Menu Button */}
                <motion.button
                  onClick={toggleSidebar}
                  className="md:hidden p-2 rounded-xl hover:bg-gray-50/50 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Menu size={20} className="text-gray-700" />
                </motion.button>
                
                <div>
                  <motion.h1 
                    className="text-2xl font-bold text-gray-900"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {currentList?.name || 'All Tasks'}
                  </motion.h1>
                  {/* Task Counter - moved under the title */}
                  <motion.p 
                    className="text-gray-600 text-sm font-medium mt-1"
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
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  whileTap={{ scale: 0.95, rotate: -5 }}
                  onClick={toggleTheme}
                  className="p-2 rounded-xl border border-gray-200/50 hover:bg-gray-50/50 transition-all duration-300"
                  title="Toggle theme"
                >
                  <motion.div
                    initial={false}
                    animate={{ rotate: theme === 'dark' ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                  </motion.div>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95, y: 0 }}
                  onClick={() => setShowAddTodo(true)}
                  className="btn-primary flex items-center gap-2 px-4 py-2"
                >
                  <motion.div
                    animate={{ rotate: showAddTodo ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Plus size={18} />
                  </motion.div>
                  <span className="hidden sm:inline font-semibold">Add Task</span>
                </motion.button>
              </div>
            </div>
          </motion.header>

          <div className="flex-1 overflow-auto p-6">
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
