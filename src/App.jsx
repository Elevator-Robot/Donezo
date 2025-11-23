import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import TodoList from './components/TodoList'
import AddTodo from './components/AddTodo'
import RecurringTaskModal from './components/RecurringTaskModal'
import Settings from './components/Settings'
import Auth from './components/Auth'
import UserProfile from './components/UserProfile'
import { CheckCircle, Clock, Plus, Moon, Sun, Calendar, List, Home, Zap, Bot, Repeat, X, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns'
import { generateRecurringInstances, calculateNextDueDate } from './utils/recurringTaskUtils'
import { authService } from './services/authService'
import { dataService } from './services/dataService'
import { validateAWSConfig } from './lib/aws'

function App() {
  // Authentication state
  const [currentUser, setCurrentUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  
  // User-specific data states
  const [todos, setTodos] = useState([])
  const [lists, setLists] = useState([])
  const [settings, setSettings] = useState({ font: 'Rock Salt' })
  const [theme, setTheme] = useState('light')
  
  const [activeList, setActiveList] = useState('1')
  const [showAddTodo, setShowAddTodo] = useState(false)
  const [showRecurringTask, setShowRecurringTask] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showThemeTransition, setShowThemeTransition] = useState(false)
  const [activeTab, setActiveTab] = useState('today') // 'today', 'lists', 'calendar'
  const [showListModal, setShowListModal] = useState(false)
  const [selectedList, setSelectedList] = useState(null)
  const [showCreateListModal, setShowCreateListModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [calendarView, setCalendarView] = useState('month') // 'month' or 'week'
  const [swipeStartX, setSwipeStartX] = useState(null)
  const [swipeStartY, setSwipeStartY] = useState(null)

  // Initialize auth state on app start
  useEffect(() => {
    let mounted = true

    async function initializeAuth() {
      try {
        // Validate AWS configuration at startup
        const configValidation = validateAWSConfig()
        if (!configValidation.isValid) {
          console.warn('⚠️  AWS configuration incomplete:', configValidation.missing)
        }
        const { session, error } = await authService.getSession()
        
        if (error) {
          console.error('Session error:', error)
          setAuthLoading(false)
          return
        }

        if (session?.user && mounted) {
          // Get user profile
          const { profile } = await authService.getUserProfile(session.user.id)
          
          if (profile && mounted) {
            const userObj = {
              id: session.user.id,
              username: profile.username,
              email: session.user.email,
              createdAt: profile.created_at
            }
            setCurrentUser(userObj)
            setIsAuthenticated(true)
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        if (mounted) setAuthLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth state changes
    const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      if (event === 'SIGNED_IN' && session?.user) {
        const { profile } = await authService.getUserProfile(session.user.id)
        if (profile && mounted) {
          const userObj = {
            id: session.user.id,
            username: profile.username,
            email: session.user.email,
            createdAt: profile.created_at
          }
          setCurrentUser(userObj)
          setIsAuthenticated(true)
        }
      } else if (event === 'SIGNED_OUT') {
        if (mounted) {
          setCurrentUser(null)
          setIsAuthenticated(false)
          setTodos([])
          setLists([])
          setSettings({ font: 'Rock Salt' })
          setTheme('light')
        }
      }
    })

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [])

  // Load user data when authenticated user changes
  useEffect(() => {
    if (currentUser && isAuthenticated) {
      console.log('Loading data for user:', currentUser.id)
      loadUserData(currentUser.id)
    }
  }, [currentUser, isAuthenticated])

  async function loadUserData(userId) {
    try {
      const [
        { lists, error: listsError },
        { todos, error: todosError },
        { settings, error: settingsError }
      ] = await Promise.all([
        dataService.getUserLists(userId),
        dataService.getUserTodos(userId),
        dataService.getUserSettings(userId)
      ])

      if (listsError) {
        console.error('Error loading lists:', listsError)
      } else {
        // If no lists found, initialize with defaults
        if (lists.length === 0) {
          const { lists: newLists } = await dataService.initializeUserData(userId)
          setLists(newLists || [])
        } else {
          setLists(lists)
        }
      }

      if (todosError) {
        console.error('Error loading todos:', todosError)
      } else {
        setTodos(todos || [])
      }

      if (settingsError) {
        console.error('Error loading settings:', settingsError)
      } else {
        setSettings(settings || { font: 'Rock Salt' })
        setTheme(settings?.theme || 'light')
      }

      // Set active list to first available list
      if (lists && lists.length > 0) {
        setActiveList(lists[0].id)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  // Authentication handlers
  const handleAuthSuccess = (user) => {
    console.log('Authentication successful:', user)
    setCurrentUser(user)
    setIsAuthenticated(true)
    
    // Data will be loaded by the useEffect hook
  }

  const handleLogout = async () => {
    console.log('Logging out user:', currentUser?.username)
    
    const { error } = await authService.signOut()
    if (error) {
      console.error('Logout error:', error)
    }
    
    // State will be updated by the auth state change listener
  }

  // Sync data to database when changed
  useEffect(() => {
    // Apply theme
    console.log('Theme changed to:', theme)
    document.documentElement.setAttribute('data-theme', theme)
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    // Save theme to database
    if (currentUser && isAuthenticated) {
      dataService.updateUserSettings(currentUser.id, { ...settings, theme })
    }
  }, [theme, currentUser, isAuthenticated, settings])

  // Apply font settings
  useEffect(() => {
    document.documentElement.style.setProperty('--app-font', `'${settings.font}'`)
    
    // Save settings to database
    if (currentUser && isAuthenticated) {
      dataService.updateUserSettings(currentUser.id, { ...settings, theme })
    }
  }, [settings, currentUser, isAuthenticated, theme])

  const addTodo = async (todo) => {
    if (!currentUser) return

    console.log('App.jsx addTodo called with:', todo)
    
    const newTodoData = {
      listId: todo.listId,
      title: todo.title,
      description: todo.description || '',
      priority: todo.priority || 'medium',
      dueDate: todo.dueDate || null,
      dueTime: todo.dueTime || null,
      isRecurringInstance: todo.isRecurringInstance || false,
      parentRecurringTaskId: todo.parentRecurringTaskId || null,
      recurrence: todo.recurrence || null
    }
    
    const { todo: newTodo, error } = await dataService.createTodo(currentUser.id, newTodoData)
    
    if (error) {
      console.error('Error creating todo:', error)
      return
    }
    
    if (newTodo) {
      setTodos(prev => [newTodo, ...prev])
    }
    
    setShowAddTodo(false)
  }

  const addRecurringTask = async (recurringTask) => {
    if (!currentUser) return

    console.log('App.jsx addRecurringTask called with:', recurringTask)
    
    const newRecurringTaskData = {
      listId: recurringTask.listId,
      title: recurringTask.title,
      description: recurringTask.description || '',
      priority: recurringTask.priority || 'medium',
      dueDate: recurringTask.dueDate || null,
      dueTime: recurringTask.dueTime || null,
      recurrence: recurringTask.recurrence
    }
    
    // Create the recurring task template
    const { todo: newRecurringTask, error } = await dataService.createTodo(currentUser.id, newRecurringTaskData)
    
    if (error) {
      console.error('Error creating recurring task:', error)
      return
    }
    
    if (newRecurringTask) {
      // Generate the first few instances
      const instances = generateRecurringInstances(newRecurringTask, 5)
      
      // Create instances in database
      const createdInstances = []
      for (const instance of instances) {
        const instanceData = {
          ...instance,
          isRecurringInstance: true,
          parentRecurringTaskId: newRecurringTask.id
        }
        delete instanceData.id // Let database generate new IDs
        
        const { todo: createdInstance, error: instanceError } = await dataService.createTodo(currentUser.id, instanceData)
        if (!instanceError && createdInstance) {
          createdInstances.push(createdInstance)
        }
      }
      
      setTodos(prev => [newRecurringTask, ...createdInstances, ...prev])
    }
    
    setShowRecurringTask(false)
  }

  const toggleTodo = async (id) => {
    if (!currentUser) return

    const todo = todos.find(t => t.id === id)
    if (!todo) return

    const { todo: updatedTodo, error } = await dataService.toggleTodo(id, !todo.completed, currentUser.id)
    
    if (error) {
      console.error('Error toggling todo:', error)
      return
    }

    if (updatedTodo) {
      setTodos(prev => prev.map(t => t.id === id ? updatedTodo : t))
      
      // If this is a recurring task instance and it's being completed,
      // create the next instance
      if (updatedTodo.completed && todo.is_recurring_instance && todo.parent_recurring_task_id) {
        const parentTask = todos.find(t => t.id === todo.parent_recurring_task_id)
        if (parentTask && parentTask.recurrence) {
          const nextDueDate = calculateNextDueDate(parentTask.recurrence, todo.due_date)
          const nextInstanceData = {
            listId: parentTask.list_id,
            title: parentTask.title,
            description: parentTask.description,
            priority: parentTask.priority,
            dueDate: nextDueDate,
            dueTime: parentTask.due_time,
            isRecurringInstance: true,
            parentRecurringTaskId: parentTask.id,
            recurrence: parentTask.recurrence
          }
          
          const { todo: nextInstance } = await dataService.createTodo(currentUser.id, nextInstanceData)
          if (nextInstance) {
            setTodos(prev => [nextInstance, ...prev])
          }
        }
      }
    }
  }

  const deleteTodo = async (id) => {
    if (!currentUser) return

    const { error } = await dataService.deleteTodo(id, currentUser.id)
    
    if (error) {
      console.error('Error deleting todo:', error)
      return
    }
    
    setTodos(prev => prev.filter(todo => todo.id !== id))
  }

  const addList = async (newList) => {
    if (!currentUser) return

    const { list, error } = await dataService.createList(currentUser.id, newList)
    
    if (error) {
      console.error('Error creating list:', error)
      return
    }
    
    if (list) {
      setLists(prev => [...prev, list])
    }
  }

  const toggleTheme = () => {
    console.log('=== THEME TOGGLE DEBUG ===')
    console.log('Current theme before toggle:', theme)
    
    setTheme(prev => {
      let newTheme
      if (prev === 'light') {
        newTheme = 'dark'
      } else if (prev === 'dark') {
        newTheme = 'cyberpunk'
      } else {
        newTheme = 'light'
      }
      
      console.log('New theme will be:', newTheme)
      return newTheme
    })
  }

  const handleSettingsChange = (newSettings) => {
    setSettings(newSettings)
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

  const handleAddButtonClick = () => {
    setShowAddTodo(true)
  }

  const handleListSelect = (list) => {
    setSelectedList(list)
    setShowListModal(true)
  }

  const deleteList = async (id) => {
    if (!currentUser || lists.length <= 1) return // Don't delete if it's the last list

    const { error } = await dataService.deleteList(id, currentUser.id)
    
    if (error) {
      console.error('Error deleting list:', error)
      return
    }
    
    // Remove the list from local state
    setLists(prev => prev.filter(list => list.id !== id))
    
    // Remove all todos that belong to this list from local state
    setTodos(prev => prev.filter(todo => todo.list_id !== id))
    
    // If the deleted list was the active one, switch to the first remaining list
    if (activeList === id) {
      const remainingLists = lists.filter(list => list.id !== id)
      if (remainingLists.length > 0) {
        setActiveList(remainingLists[0].id)
      }
    }
  }

  // Calendar swipe handlers
  const handleCalendarSwipeStart = (e) => {
    const touch = e.touches[0]
    setSwipeStartX(touch.clientX)
    setSwipeStartY(touch.clientY)
  }

  const handleCalendarSwipeMove = (e) => {
    e.preventDefault() // Prevent scrolling during swipe
  }

  const handleCalendarSwipeEnd = (e) => {
    if (!swipeStartX || !swipeStartY) return

    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - swipeStartX
    const deltaY = touch.clientY - swipeStartY
    const minSwipeDistance = 50

    // Only handle horizontal swipes (month navigation)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        // Swipe right - go to previous month
        const newDate = new Date(selectedDate)
        newDate.setMonth(newDate.getMonth() - 1)
        setSelectedDate(newDate)
      } else {
        // Swipe left - go to next month
        const newDate = new Date(selectedDate)
        newDate.setMonth(newDate.getMonth() + 1)
        setSelectedDate(newDate)
      }
    }

    setSwipeStartX(null)
    setSwipeStartY(null)
  }

  // Get today's tasks (tasks due today or overdue)
  const getTodaysTasks = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    return todos.filter(todo => {
      if (todo.completed) return false
      if (!todo.due_date) return false
      
      // Parse date string in local timezone to avoid timezone issues
      const dueDate = new Date(todo.due_date)
      dueDate.setHours(0, 0, 0, 0)
      
      return dueDate <= today
    })
  }

  const currentTodos = todos.filter(todo => todo.list_id === activeList)
  const currentList = lists.find(list => list.id === activeList)
  const todaysTasks = getTodaysTasks()

  // Show loading screen during auth initialization
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Doink</h1>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }


  // Show authentication screen if not authenticated
  if (!isAuthenticated) {
    return <Auth onAuthSuccess={handleAuthSuccess} />
  }

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
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">Doink</h1>
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
                
                <UserProfile 
                  currentUser={currentUser}
                  onLogout={handleLogout}
                  onOpenSettings={() => setShowSettings(true)}
                />
            </div>
          </div>
        </motion.header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-gray-50/50 dark:bg-gray-900/50 pb-24">
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
                    Today&apos;s Tasks
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
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Task Lists
                    </h2>
                    <motion.button
                      onClick={() => setShowCreateListModal(true)}
                      className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Plus size={16} />
                      <span>New List</span>
                    </motion.button>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Organize your tasks into different lists
                  </p>
                </div>
                
                {/* Lists Grid */}
                <div className="grid grid-cols-1 gap-4">
                  {lists.map((list) => (
                    <motion.div
                      key={list.id}
                      className={`p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        theme === 'cyberpunk'
                          ? 'bg-black/80 border-cyan-500/30 hover:border-cyan-400 hover:bg-black/90 shadow-[0_4px_15px_rgba(6,182,212,0.2)]'
                          : 'border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-600 bg-white dark:bg-gray-800'
                      }`}
                      onClick={() => handleListSelect(list)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-4 mb-3">
                        <div className={`w-4 h-4 ${list.color === 'teal' ? 'bg-teal-500' : list.color === 'blue' ? 'bg-blue-500' : list.color === 'green' ? 'bg-green-500' : 'bg-gray-500'} rounded-full`}></div>
                        <h3 className={`text-lg font-semibold ${
                          theme === 'cyberpunk' ? 'text-cyan-300' : 'text-gray-900 dark:text-white'
                        }`}>{list.name}</h3>
                      </div>
                      <p className={`text-sm ${
                        theme === 'cyberpunk' ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {todos.filter(todo => todo.list_id === list.id && !todo.completed).length} tasks remaining
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
                className="space-y-4"
              >
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Calendar
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Swipe left/right to navigate months
                    </p>
                  </div>
                  <motion.button
                    onClick={() => setShowRecurringTask(true)}
                    className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus size={16} />
                    <span>Add Recurring</span>
                  </motion.button>
                </div>

                {/* Month Grid */}
                <motion.div
                  key={selectedDate.getMonth() + selectedDate.getFullYear()} // Force re-render on month change
                  className={`rounded-lg p-4 shadow-sm border ${
                    theme === 'cyberpunk'
                      ? 'bg-black/80 border-cyan-500/30 shadow-[0_4px_15px_rgba(6,182,212,0.2)]'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  } ${
                    calendarView === 'week' ? 'h-20 overflow-hidden' : 'h-auto'
                  }`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ 
                    height: calendarView === 'week' ? '80px' : 'auto',
                    opacity: 1, 
                    x: 0 
                  }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  onTouchStart={handleCalendarSwipeStart}
                  onTouchMove={handleCalendarSwipeMove}
                  onTouchEnd={handleCalendarSwipeEnd}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h3 className={`text-lg font-semibold ${
                        theme === 'cyberpunk' ? 'text-cyan-300' : 'text-gray-900 dark:text-white'
                      }`}>
                        {format(selectedDate, 'MMMM')}
                      </h3>
                      <div className="relative">
                        <select
                          value={selectedDate.getFullYear()}
                          onChange={(e) => {
                            const newDate = new Date(selectedDate)
                            newDate.setFullYear(parseInt(e.target.value))
                            setSelectedDate(newDate)
                          }}
                          className={`appearance-none bg-transparent border rounded-md px-2 py-1 text-sm font-medium cursor-pointer ${
                            theme === 'cyberpunk'
                              ? 'border-cyan-500/30 text-cyan-300 hover:border-cyan-400'
                              : 'border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:border-gray-400'
                          }`}
                        >
                          {[2025, 2026, 2027, 2028].map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                        <ChevronDown className={`absolute right-1 top-1/2 transform -translate-y-1/2 w-3 h-3 pointer-events-none ${
                          theme === 'cyberpunk' ? 'text-cyan-300' : 'text-gray-500'
                        }`} />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const newDate = new Date(selectedDate)
                          newDate.setMonth(newDate.getMonth() - 1)
                          setSelectedDate(newDate)
                        }}
                        className={`p-2 rounded-lg transition-colors ${
                          theme === 'cyberpunk'
                            ? 'hover:bg-cyan-500/20 text-cyan-300 hover:text-cyan-200'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        onClick={() => {
                          const newDate = new Date(selectedDate)
                          newDate.setMonth(newDate.getMonth() + 1)
                          setSelectedDate(newDate)
                        }}
                        className={`p-2 rounded-lg transition-colors ${
                          theme === 'cyberpunk'
                            ? 'hover:bg-cyan-500/20 text-cyan-300 hover:text-cyan-200'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className={`text-center text-sm font-medium py-2 ${
                        theme === 'cyberpunk' ? 'text-cyan-400' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {day}
                      </div>
                    ))}
                    {(() => {
                      // Generate full calendar grid with padding days
                      const monthStart = startOfMonth(selectedDate)
                      const monthEnd = endOfMonth(selectedDate)
                      const calendarStart = startOfWeek(monthStart)
                      const calendarEnd = endOfWeek(monthEnd)
                      const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

                      return days.map(date => {
                        const isCurrentMonth = isSameMonth(date, selectedDate)
                        const isDayToday = isToday(date)
                        const isSelected = isSameDay(date, selectedDate)
                        const hasTasks = todos.some(todo => {
                          if (!todo.due_date) return false
                          const todoDate = new Date(todo.due_date)
                          return todoDate.toDateString() === date.toDateString()
                        })

                        return (
                          <motion.button
                            key={format(date, 'yyyy-MM-dd')}
                            onClick={() => setSelectedDate(date)}
                            className={`relative p-2 rounded-lg text-sm transition-colors aspect-square flex items-center justify-center ${
                              isSelected
                                ? theme === 'cyberpunk'
                                  ? 'bg-cyan-500 text-black'
                                  : 'bg-teal-500 text-white'
                                : isDayToday
                                ? theme === 'cyberpunk'
                                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                                  : 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400'
                                : isCurrentMonth
                                ? theme === 'cyberpunk'
                                  ? 'hover:bg-cyan-500/10 text-cyan-200 hover:text-cyan-100'
                                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                                : theme === 'cyberpunk'
                                  ? 'text-cyan-200/50 hover:bg-cyan-500/5'
                                  : 'text-gray-400 dark:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {format(date, 'd')}
                            {hasTasks && (
                              <div className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full ${
                                theme === 'cyberpunk' ? 'bg-cyan-400' : 'bg-teal-500'
                              }`}></div>
                            )}
                          </motion.button>
                        )
                      })
                    })()}
                  </div>
                </motion.div>

                {/* Selected Date Agenda */}
                <div className={`rounded-lg p-4 shadow-sm border ${
                  theme === 'cyberpunk'
                    ? 'bg-black/80 border-cyan-500/30 shadow-[0_4px_15px_rgba(6,182,212,0.2)]'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                }`}>
                  <h3 className={`text-lg font-semibold mb-4 ${
                    theme === 'cyberpunk' ? 'text-cyan-300' : 'text-gray-900 dark:text-white'
                  }`}>
                    {selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h3>
                  
                  {(() => {
                    const dayTasks = todos.filter(todo => {
                      if (!todo.due_date) return false
                      const todoDate = new Date(todo.due_date)
                      return todoDate.toDateString() === selectedDate.toDateString()
                    })
                    
                    if (dayTasks.length === 0) {
                      return (
                        <div className="text-center py-8">
                          <Calendar className={`w-12 h-12 mx-auto mb-3 ${
                            theme === 'cyberpunk' ? 'text-cyan-500' : 'text-gray-400'
                          }`} />
                          <p className={`${
                            theme === 'cyberpunk' ? 'text-gray-300' : 'text-gray-500 dark:text-gray-400'
                          }`}>No tasks scheduled for this day</p>
                        </div>
                      )
                    }

                    return (
                      <div className="space-y-3">
                        {dayTasks.map(todo => (
                          <motion.div
                            key={todo.id}
                            className={`p-3 rounded-lg border-l-4 ${
                              todo.completed
                                ? theme === 'cyberpunk'
                                  ? 'bg-gray-800/50 border-gray-600'
                                  : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                                : theme === 'cyberpunk'
                                  ? 'bg-black/50 border-cyan-500'
                                  : 'bg-white dark:bg-gray-800 border-teal-500'
                            }`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => toggleTodo(todo.id)}
                                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                    todo.completed
                                      ? 'bg-teal-500 border-teal-500 text-white'
                                      : 'border-gray-300 dark:border-gray-600 hover:border-teal-500'
                                  }`}
                                >
                                  {todo.completed && <CheckCircle size={12} />}
                                </button>
                                <span className={`${
                                  todo.completed 
                                    ? 'line-through text-gray-500' 
                                    : theme === 'cyberpunk' 
                                      ? 'text-cyan-200' 
                                      : 'text-gray-900 dark:text-white'
                                }`}>
                                  {todo.title}
                                </span>
                              </div>
                              {todo.due_time && (
                                <span className={`text-sm ${
                                  theme === 'cyberpunk' ? 'text-gray-300' : 'text-gray-500 dark:text-gray-400'
                                }`}>
                                  {todo.due_time}
                                </span>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )
                  })()}
                </div>
              </motion.div>
            )}
          </div>
        </main>

        {/* Bottom Navigation */}
        <motion.nav 
          className={`fixed bottom-0 left-0 right-0 backdrop-blur-sm border-t z-50 ${
            theme === 'cyberpunk' 
              ? 'bg-black/95 border-cyan-500/50 shadow-[0_-4px_20px_rgba(6,182,212,0.3)]' 
              : 'bg-white/90 dark:bg-gray-800/90 border-gray-200/50 dark:border-gray-700/50'
          }`}
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        >
          <div className="flex items-center justify-around py-2.5">
            {/* Today Tab */}
            <motion.button
              onClick={() => setActiveTab('today')}
              className={`flex flex-col items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 ${
                activeTab === 'today'
                  ? theme === 'cyberpunk' 
                    ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/30' 
                    : 'text-teal-600 dark:text-teal-400'
                  : theme === 'cyberpunk'
                    ? 'text-gray-300 hover:text-cyan-400 hover:bg-cyan-500/5'
                    : 'text-gray-600 dark:text-gray-400'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Home size={24} />
              <span className="text-sm font-medium">Today</span>
            </motion.button>

            {/* Lists Tab */}
            <motion.button
              onClick={() => setActiveTab('lists')}
              className={`flex flex-col items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 ${
                activeTab === 'lists'
                  ? theme === 'cyberpunk' 
                    ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/30' 
                    : 'text-teal-600 dark:text-teal-400'
                  : theme === 'cyberpunk'
                    ? 'text-gray-300 hover:text-cyan-400 hover:bg-cyan-500/5'
                    : 'text-gray-600 dark:text-gray-400'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <List size={24} />
              <span className="text-sm font-medium">Lists</span>
            </motion.button>

            {/* Calendar Tab */}
            <motion.button
              onClick={() => setActiveTab('calendar')}
              className={`flex flex-col items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 ${
                activeTab === 'calendar'
                  ? theme === 'cyberpunk' 
                    ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/30' 
                    : 'text-teal-600 dark:text-teal-400'
                  : theme === 'cyberpunk'
                    ? 'text-gray-300 hover:text-cyan-400 hover:bg-cyan-500/5'
                    : 'text-gray-600 dark:text-gray-400'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Calendar size={24} />
              <span className="text-sm font-medium">Calendar</span>
            </motion.button>
          </div>
        </motion.nav>

        {/* Floating Action Button */}
        <motion.button
          onClick={handleAddButtonClick}
          className={`fixed bottom-24 right-6 w-14 h-14 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-[60] flex items-center justify-center ${
            theme === 'cyberpunk'
              ? 'bg-cyan-500 hover:bg-cyan-400 shadow-[0_4px_20px_rgba(6,182,212,0.4)] hover:shadow-[0_6px_25px_rgba(6,182,212,0.6)]'
              : 'bg-teal-500 hover:bg-teal-600'
          }`}
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
                    {todos.filter(todo => todo.list_id === selectedList.id && !todo.completed).length} tasks remaining
                  </p>
                </div>

                <TodoList
                  todos={todos.filter(todo => todo.list_id === selectedList.id)}
                  onToggle={toggleTodo}
                  onDelete={deleteTodo}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create List Modal */}
        <AnimatePresence mode="wait">
          {showCreateListModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]"
              onClick={() => setShowCreateListModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="card w-full max-w-md relative z-[10000]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New List</h2>
                  <button
                    onClick={() => setShowCreateListModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                  >
                    <X size={20} className="text-gray-700 dark:text-gray-300" />
                  </button>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.target)
                  const name = formData.get('name')
                  const color = formData.get('color')
                  if (name) {
                    addList({ name, color })
                    setShowCreateListModal(false)
                  }
                }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      List Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Enter list name"
                      className="input-field"
                      required
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Color
                    </label>
                    <div className="flex gap-2">
                      {[
                        { value: 'teal', color: 'bg-teal-500' },
                        { value: 'blue', color: 'bg-blue-500' },
                        { value: 'green', color: 'bg-green-500' },
                        { value: 'purple', color: 'bg-purple-500' },
                        { value: 'pink', color: 'bg-pink-500' },
                        { value: 'orange', color: 'bg-orange-500' }
                      ].map((option) => (
                        <label key={option.value} className="cursor-pointer">
                          <input
                            type="radio"
                            name="color"
                            value={option.value}
                            defaultChecked={option.value === 'teal'}
                            className="sr-only"
                          />
                          <div className={`w-8 h-8 ${option.color} rounded-full border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600 transition-colors`}></div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="btn-primary flex-1"
                    >
                      Create List
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateListModal(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </Router>
  )
}

export default App
