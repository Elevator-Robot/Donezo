import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ThemeProvider } from './contexts/ThemeContext'
import TabBar from './components/TabBar'
import TodayView from './components/TodayView'
import ListsView from './components/ListsView'
import CalendarView from './components/CalendarView'
import StarfieldCanvas from './components/StarfieldCanvas'

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
  
  const [activeTab, setActiveTab] = useState('today')
  const [activeList, setActiveList] = useState(null) // For ListsView navigation

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
          showNotification(todo.title, getListName(todo.listId))
          setTodos(prev => prev.map(t => 
            t.id === todo.id ? { ...t, reminderShown: true } : t
          ))
        }
      })
    }

    const interval = setInterval(checkReminders, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [todos])

  // Request notification permission on app load
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const showNotification = (title, listName) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`Reminder: ${title}`, {
        body: `From your ${listName} list`,
        icon: '/vite.svg'
      })
    }
  }

  const getListName = (listId) => {
    const list = lists.find(l => l.id === listId)
    return list?.name || 'Unknown List'
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
    
    // Trigger star animation for night theme
    window.dispatchEvent(new CustomEvent('taskAdded'))
  }

  const toggleTodo = (id) => {
    const todo = todos.find(t => t.id === id)
    const wasCompleted = todo?.completed
    
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
    
    // Trigger constellation animation for night theme when completing a task
    if (!wasCompleted) {
      window.dispatchEvent(new CustomEvent('taskCompleted'))
    }
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
        setActiveList(null)
      }
    }
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'today':
        return (
          <TodayView
            todos={todos}
            lists={lists}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
            onAdd={addTodo}
          />
        )
      case 'lists':
        return (
          <ListsView
            lists={lists}
            todos={todos}
            activeList={activeList}
            setActiveList={setActiveList}
            onAddList={addList}
            onDeleteList={deleteList}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
            onAdd={addTodo}
          />
        )
      case 'calendar':
        return (
          <CalendarView
            todos={todos}
            lists={lists}
            onAdd={addTodo}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
          />
        )
      default:
        return null
    }
  }

  return (
    <ThemeProvider>
      <div className="flex flex-col h-screen overflow-hidden relative">
        {/* Starfield Canvas (only visible in night theme) */}
        <StarfieldCanvas />
        
        {/* Main Content */}
        <div className="flex-1 overflow-hidden relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="h-full"
            >
              {renderActiveView()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Tab Bar */}
        <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </ThemeProvider>
  )
}

export default App
