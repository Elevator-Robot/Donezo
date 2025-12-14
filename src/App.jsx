import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TodoList from './components/TodoList'
import AddTodo from './components/AddTodo'
import RecurringTaskModal from './components/RecurringTaskModal'
import Settings from './components/Settings'
import Auth from './components/Auth'
import UserProfile from './components/UserProfile'
import { CheckCircle, Clock, Plus, Moon, Sun, Calendar, List, Bot, X, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns'
import { generateRecurringInstances, calculateNextDueDate } from './utils/recurringTaskUtils'
import { authService } from './services/authService'
import { dataService } from './services/dataService'

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
  const [editingTodo, setEditingTodo] = useState(null)
  const [showRecurringTask, setShowRecurringTask] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showThemeTransition, setShowThemeTransition] = useState(false)
  const [listFilter, setListFilter] = useState('all')
  const [showListModal, setShowListModal] = useState(false)
  const [selectedList, setSelectedList] = useState(null)
  const [showCreateListModal, setShowCreateListModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showDeleteListModal, setShowDeleteListModal] = useState(false)
  const [listPendingDelete, setListPendingDelete] = useState(null)

  // Initialize auth state on app start
  useEffect(() => {
    let mounted = true

    async function initializeAuth() {
      try {
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

  const saveTodo = async (todo) => {
    if (!currentUser) return

    const targetListId = todo.listId || activeList || lists[0]?.id
    if (!targetListId) {
      console.warn('Cannot save todo without a list')
      return
    }

    if (todo.id) {
      const updates = {
        title: todo.title,
        list_id: targetListId,
        priority: todo.priority || 'medium'
      }

      const { todo: updatedTodo, error } = await dataService.updateTodo(todo.id, updates)
      if (error) {
        console.error('Error updating todo:', error)
        return
      }

      if (updatedTodo) {
        setTodos(prev => prev.map(t => t.id === todo.id ? updatedTodo : t))
      }
    } else {
      const newTodoData = {
        listId: targetListId,
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
    }

    setShowAddTodo(false)
    setEditingTodo(null)
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

  const handleListSelect = (list) => {
    if (list) {
      setListFilter(list.id)
      setActiveList(list.id)
    }
    setSelectedList(list)
    setShowListModal(true)
  }

  const openNewTaskModal = () => {
    setEditingTodo(null)
    setShowAddTodo(true)
  }

  const handleEditTodo = (todo) => {
    setEditingTodo(todo)
    setShowAddTodo(true)
  }

  const handleListFilterChange = (value) => {
    setListFilter(value)
    if (value !== 'all') {
      setActiveList(value)
    }
  }

  const handleDeleteActiveList = () => {
    if (listFilter === 'all') return
    const targetList = lists.find(list => list.id === listFilter)
    if (!targetList) return
    setListPendingDelete(targetList)
    setShowDeleteListModal(true)
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
    setTodos(prev => prev.filter(todo => {
      const todoListId = todo.list_id || todo.listId
      return todoListId !== id
    }))

    if (listFilter === id) {
      setListFilter('all')
    }
    
    // If the deleted list was the active one, switch to the first remaining list
    if (activeList === id) {
      const remainingLists = lists.filter(list => list.id !== id)
      if (remainingLists.length > 0) {
        setActiveList(remainingLists[0].id)
      }
    }
  }

  const confirmDeleteList = async () => {
    if (!listPendingDelete) return
    await deleteList(listPendingDelete.id)
    setShowDeleteListModal(false)
    setListPendingDelete(null)
  }

  const cancelDeleteList = () => {
    setShowDeleteListModal(false)
    setListPendingDelete(null)
  }


  // Get today's tasks (tasks due today or overdue)
  const getTodaysTasks = (taskSource) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    return taskSource.filter(todo => {
      if (todo.completed) return false
      if (!todo.due_date) return false
      
      // Parse date string in local timezone to avoid timezone issues
      const dueDate = new Date(todo.due_date)
      dueDate.setHours(0, 0, 0, 0)
      
      return dueDate <= today
    })
  }

  const filteredTodos = listFilter === 'all'
    ? todos
    : todos.filter(todo => (todo.list_id || todo.listId) === listFilter)
  const todaysTasks = getTodaysTasks(filteredTodos)
  const focusTasks = listFilter === 'all' ? todos : filteredTodos

  const upcomingTasks = filteredTodos
    .filter(todo => {
      if (todo.completed) return false
      if (!todo.due_date) return false
      const dueDate = new Date(todo.due_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      dueDate.setHours(0, 0, 0, 0)
      return dueDate > today
    })
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 5)

  const calendarMonthStart = startOfMonth(selectedDate)
  const calendarMonthEnd = endOfMonth(selectedDate)
  const calendarStart = startOfWeek(calendarMonthStart)
  const calendarEnd = endOfWeek(calendarMonthEnd)
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const selectedDayTasks = filteredTodos.filter(todo => {
    if (!todo.due_date) return false
    return isSameDay(new Date(todo.due_date), selectedDate)
  })

  const activeFilterList = lists.find(list => list.id === listFilter)
  const focusHeading = listFilter === 'all' ? 'All lists' : activeFilterList?.name || 'Selected list'
  const focusDescription = focusTasks.length > 0
    ? `${focusTasks.length} task${focusTasks.length === 1 ? '' : 's'} ${listFilter === 'all' ? 'across all lists' : 'in this list'}`
    : listFilter === 'all'
      ? 'No tasks yet. Create your first one!'
      : 'No tasks in this list yet.'

  const cardClasses = theme === 'cyberpunk'
    ? 'bg-black/80 border-cyan-500/30 shadow-[0_4px_15px_rgba(6,182,212,0.2)]'
    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm'

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
            <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(280px,1fr)]">
              <section className="space-y-6">
                <div className={`${cardClasses} rounded-lg p-5`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className={`text-sm uppercase tracking-wide ${theme === 'cyberpunk' ? 'text-cyan-300' : 'text-gray-500 dark:text-gray-400'}`}>
                        Lists
                      </p>
                      <h2 className={`text-2xl font-semibold ${theme === 'cyberpunk' ? 'text-cyan-100' : 'text-gray-900 dark:text-white'}`}>
                        {listFilter === 'all' ? 'All tasks' : activeFilterList?.name || 'Filtered tasks'}
                      </h2>
                      {listFilter !== 'all' && activeFilterList && (
                        <p className={`${theme === 'cyberpunk' ? 'text-gray-400' : 'text-gray-500 dark:text-gray-400'} text-sm mt-1`}>
                          Showing tasks from {activeFilterList.name}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowCreateListModal(true)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          theme === 'cyberpunk'
                            ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/50 hover:bg-cyan-500/30'
                            : 'bg-white text-gray-800 border border-gray-200 hover:border-teal-400 dark:bg-gray-900 dark:text-white'
                        }`}
                      >
                        New List
                      </button>
                      {listFilter !== 'all' && activeFilterList && (
                        <button
                          onClick={handleDeleteActiveList}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                            theme === 'cyberpunk'
                              ? 'border border-red-400/60 text-red-300 hover:bg-red-500/10'
                              : 'border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-500 dark:text-red-300 dark:hover:bg-red-500/10'
                          }`}
                        >
                          Delete List
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleListFilterChange('all')}
                      className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-colors flex items-center gap-2 ${
                        listFilter === 'all'
                          ? theme === 'cyberpunk'
                            ? 'bg-cyan-500 text-black border-cyan-400'
                            : 'bg-teal-500 text-white border-teal-400'
                          : theme === 'cyberpunk'
                            ? 'text-cyan-200 border-cyan-500/40 hover:border-cyan-400'
                            : 'text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:border-teal-400'
                      }`}
                    >
                      All lists
                      <span className="text-xs opacity-80">{todos.length}</span>
                    </button>
                    {lists.map((list) => {
                      const incompleteTasksCount = todos.filter(todo => (todo.list_id || todo.listId) === list.id && !todo.completed).length
                      return (
                        <button
                          key={list.id}
                          onClick={() => handleListFilterChange(list.id)}
                          className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-colors flex items-center gap-2 ${
                            listFilter === list.id
                              ? theme === 'cyberpunk'
                                ? 'bg-cyan-500 text-black border-cyan-400'
                                : 'bg-teal-500 text-white border-teal-400'
                              : theme === 'cyberpunk'
                                ? 'text-cyan-200 border-cyan-500/40 hover:border-cyan-400'
                                : 'text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:border-teal-400'
                          }`}
                        >
                          {list.name}
                          <span className="text-xs opacity-80">{incompleteTasksCount}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className={`${cardClasses} rounded-lg p-5`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className={`text-sm uppercase tracking-wide ${theme === 'cyberpunk' ? 'text-cyan-300' : 'text-gray-500 dark:text-gray-400'}`}>
                        Focus
                      </p>
                      <h2 className={`text-2xl font-bold ${theme === 'cyberpunk' ? 'text-cyan-100' : 'text-gray-900 dark:text-white'}`}>
                        {focusHeading}
                      </h2>
                      <p className={`${theme === 'cyberpunk' ? 'text-gray-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        {focusDescription}
                      </p>
                    </div>
                    <button
                      onClick={openNewTaskModal}
                      className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                        theme === 'cyberpunk'
                          ? 'bg-cyan-500 text-black hover:bg-cyan-400'
                          : 'bg-teal-500 text-white hover:bg-teal-600'
                      }`}
                    >
                      <Plus size={16} />
                      Add Task
                    </button>
                  </div>
                  {focusTasks.length > 0 ? (
                    <TodoList
                      todos={focusTasks}
                      onToggle={toggleTodo}
                      onDelete={deleteTodo}
                      onEdit={handleEditTodo}
                    />
                  ) : (
                    <div className="text-center py-10">
                      <CheckCircle className={`w-12 h-12 mx-auto mb-3 ${theme === 'cyberpunk' ? 'text-cyan-500' : 'text-gray-300'}`} />
                      <p className={`${theme === 'cyberpunk' ? 'text-gray-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        {listFilter === 'all' ? 'No tasks yet. Create your first one!' : 'No tasks in this list yet.'}
                      </p>
                    </div>
                  )}
                </div>

                <div className={`${cardClasses} rounded-lg p-5`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className={`text-sm ${theme === 'cyberpunk' ? 'text-cyan-300' : 'text-gray-500 dark:text-gray-400'}`}>
                        Up next
                      </p>
                      <h2 className={`text-2xl font-bold ${theme === 'cyberpunk' ? 'text-cyan-100' : 'text-gray-900 dark:text-white'}`}>
                        Upcoming tasks
                      </h2>
                    </div>
                    <button
                      onClick={() => setShowRecurringTask(true)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                        theme === 'cyberpunk'
                          ? 'border border-cyan-500/50 text-cyan-200 hover:bg-cyan-500/10'
                          : 'border border-teal-500 text-teal-600 hover:bg-teal-50 dark:border-teal-400 dark:text-teal-300 dark:hover:bg-teal-400/10'
                      }`}
                    >
                      <Clock size={16} />
                      Schedule recurring
                    </button>
                  </div>
                  {upcomingTasks.length > 0 ? (
                    <div className="space-y-3">
                      {upcomingTasks.map(todo => {
                        const list = lists.find(l => l.id === (todo.list_id || todo.listId))
                        const dueDateLabel = todo.due_date ? format(new Date(todo.due_date), 'MMM d') : 'No due date'
                        return (
                          <div
                            key={todo.id}
                            className={`flex items-center justify-between p-3 rounded-lg border ${
                              theme === 'cyberpunk'
                                ? 'border-cyan-500/30 bg-black/40'
                                : 'border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            <div>
                              <p className={`font-medium ${todo.completed ? 'line-through text-gray-500' : theme === 'cyberpunk' ? 'text-cyan-100' : 'text-gray-900 dark:text-white'}`}>
                                {todo.title}
                              </p>
                              <p className={`text-sm ${theme === 'cyberpunk' ? 'text-gray-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                {dueDateLabel}{list ? ` • ${list.name}` : ''}
                              </p>
                            </div>
                            <div className={`flex items-center gap-2 text-sm ${theme === 'cyberpunk' ? 'text-cyan-200' : 'text-gray-500 dark:text-gray-400'}`}>
                              <Clock size={14} />
                              <span>{todo.due_time || 'Anytime'}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className={`w-10 h-10 mx-auto mb-3 ${theme === 'cyberpunk' ? 'text-cyan-500' : 'text-gray-300'}`} />
                      <p className={`${theme === 'cyberpunk' ? 'text-gray-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        No upcoming tasks scheduled.
                      </p>
                    </div>
                  )}
                </div>
              </section>

              <aside className="space-y-6">
                <div className={`${cardClasses} rounded-lg p-5`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className={`text-sm uppercase tracking-wide ${theme === 'cyberpunk' ? 'text-cyan-300' : 'text-gray-500 dark:text-gray-400'}`}>
                        {format(selectedDate, 'MMMM yyyy')}
                      </h3>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const newDate = new Date(selectedDate)
                          newDate.setMonth(newDate.getMonth() - 1)
                          setSelectedDate(newDate)
                        }}
                        className={`p-2 rounded-lg ${
                          theme === 'cyberpunk'
                            ? 'hover:bg-cyan-500/20 text-cyan-300'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
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
                        className={`p-2 rounded-lg ${
                          theme === 'cyberpunk'
                            ? 'hover:bg-cyan-500/20 text-cyan-300'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                  <div className={`grid grid-cols-7 gap-1 text-[0.65rem] uppercase tracking-wide ${theme === 'cyberpunk' ? 'text-cyan-300/80' : 'text-gray-500 dark:text-gray-400'}`}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <span key={day} className="text-center">
                        {day}
                      </span>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1 mt-2 text-sm">
                    {calendarDays.map(day => {
                      const isCurrentMonth = isSameMonth(day, selectedDate)
                      const isDayToday = isToday(day)
                      const isSelected = isSameDay(day, selectedDate)
                      const hasTasks = filteredTodos.some(todo => {
                        if (!todo.due_date) return false
                        return isSameDay(new Date(todo.due_date), day)
                      })
                      return (
                        <button
                          key={day.toISOString()}
                          onClick={() => setSelectedDate(day)}
                          className={`relative p-2 rounded-lg aspect-square flex items-center justify-center ${
                            isSelected
                              ? theme === 'cyberpunk'
                                ? 'bg-cyan-500 text-black'
                                : 'bg-teal-500 text-white'
                              : isDayToday
                                ? theme === 'cyberpunk'
                                  ? 'border border-cyan-500/60 text-cyan-200'
                                  : 'border border-teal-400 text-teal-600 dark:text-teal-300'
                                : isCurrentMonth
                                  ? theme === 'cyberpunk'
                                    ? 'text-cyan-200 hover:bg-cyan-500/10'
                                    : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                                  : theme === 'cyberpunk'
                                    ? 'text-cyan-200/40'
                                    : 'text-gray-400 dark:text-gray-600'
                          }`}
                        >
                          {format(day, 'd')}
                          {hasTasks && (
                            <span className={`absolute bottom-1 w-1 h-1 rounded-full ${theme === 'cyberpunk' ? 'bg-black' : 'bg-teal-500'}`} />
                          )}
                        </button>
                      )
                    })}
                  </div>
                  <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className={`text-lg font-semibold ${theme === 'cyberpunk' ? 'text-cyan-100' : 'text-gray-900 dark:text-white'}`}>
                          {format(selectedDate, 'EEEE, MMM d')}
                        </h4>
                      </div>
                      <span className={`text-sm ${theme === 'cyberpunk' ? 'text-cyan-200' : 'text-gray-600 dark:text-gray-300'}`}>
                        {selectedDayTasks.length} tasks
                      </span>
                    </div>
                    {selectedDayTasks.length > 0 ? (
                      <div className="space-y-3">
                        {selectedDayTasks.map(todo => {
                          const list = lists.find(l => l.id === (todo.list_id || todo.listId))
                          return (
                            <div
                              key={todo.id}
                              className={`p-3 rounded-lg border flex items-center justify-between ${
                                theme === 'cyberpunk'
                                  ? 'border-cyan-500/30 bg-black/40'
                                  : 'border-gray-200 dark:border-gray-700'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => toggleTodo(todo.id)}
                                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                    todo.completed
                                      ? 'bg-teal-500 border-teal-500 text-white'
                                      : theme === 'cyberpunk'
                                        ? 'border-cyan-500/50 text-cyan-200'
                                        : 'border-gray-300 dark:border-gray-600'
                                  }`}
                                >
                                  {todo.completed && <CheckCircle size={12} />}
                                </button>
                                <div>
                                  <p className={`font-medium ${todo.completed ? 'line-through text-gray-500' : theme === 'cyberpunk' ? 'text-cyan-100' : 'text-gray-900 dark:text-white'}`}>
                                    {todo.title}
                                  </p>
                                  <p className={`text-xs ${theme === 'cyberpunk' ? 'text-gray-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                    {list ? list.name : 'No list'}{todo.due_time ? ` • ${todo.due_time}` : ''}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Calendar className={`w-10 h-10 mx-auto mb-2 ${theme === 'cyberpunk' ? 'text-cyan-500' : 'text-gray-300'}`} />
                        <p className={`${theme === 'cyberpunk' ? 'text-gray-400' : 'text-gray-500 dark:text-gray-400'}`}>
                          No tasks scheduled for this day.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </main>


        {/* AddTodo Modal - moved outside main content */}
        <AnimatePresence mode="wait">
          {showAddTodo && (
            <AddTodo
              key="add-todo"
              onAdd={saveTodo}
              onClose={() => {
                setShowAddTodo(false)
                setEditingTodo(null)
              }}
              lists={lists}
              activeList={activeList}
              initialTodo={editingTodo}
            />
          )}
        </AnimatePresence>

        {/* Delete List Modal */}
        <AnimatePresence>
          {showDeleteListModal && listPendingDelete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]"
              onClick={cancelDeleteList}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="card w-full max-w-md relative z-[10000]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 flex items-center justify-center">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Delete “{listPendingDelete.name}” list?
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      This will permanently remove the list and every task in it. There’s no undo.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
                  <button
                    onClick={cancelDeleteList}
                    className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteList}
                    className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
                  >
                    Delete List
                  </button>
                </div>
              </motion.div>
            </motion.div>
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
                    {todos.filter(todo => (todo.list_id || todo.listId) === selectedList.id && !todo.completed).length} tasks remaining
                  </p>
                </div>

                <TodoList
                  todos={todos.filter(todo => (todo.list_id || todo.listId) === selectedList.id)}
                  onToggle={toggleTodo}
                  onDelete={deleteTodo}
                  onEdit={handleEditTodo}
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
  )
}

export default App
