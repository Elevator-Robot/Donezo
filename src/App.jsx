import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import TodayView from './components/TodayView'
import ListsView from './components/ListsView'
import CalendarView from './components/CalendarView'
import DetailedListView from './components/DetailedListView'
import BottomNavigation from './components/BottomNavigation'

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
  
  const [activeView, setActiveView] = useState('today')
  const [selectedList, setSelectedList] = useState(null)

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
  }

  const addRecurringTodo = (todo) => {
    const newTodo = {
      ...todo,
      id: Date.now().toString(),
      completed: false,
      createdAt: new Date().toISOString(),
      reminderShown: false,
      isRecurring: true
    }
    setTodos(prev => [...prev, newTodo])
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
      if (selectedList?.id === id) {
        setSelectedList(null)
      }
    }
  }

  const navigateToList = (listId) => {
    const list = lists.find(l => l.id === listId)
    if (list) {
      setSelectedList(list)
    }
  }

  const navigateBackToLists = () => {
    setSelectedList(null)
  }

  const renderCurrentView = () => {
    // If we have a selected list, show the detailed view regardless of active tab
    if (selectedList) {
      return (
        <DetailedListView
          list={selectedList}
          todos={todos}
          lists={lists}
          onBack={navigateBackToLists}
          onToggleTodo={toggleTodo}
          onDeleteTodo={deleteTodo}
          onAddTodo={addTodo}
        />
      )
    }

    switch (activeView) {
      case 'today':
        return (
          <TodayView
            todos={todos}
            lists={lists}
            onToggleTodo={toggleTodo}
            onDeleteTodo={deleteTodo}
            onAddTodo={addTodo}
          />
        )
      case 'lists':
        return (
          <ListsView
            lists={lists}
            todos={todos}
            activeList={null}
            setActiveList={() => {}}
            addList={addList}
            deleteList={deleteList}
            onNavigateToList={navigateToList}
          />
        )
      case 'calendar':
        return (
          <CalendarView
            todos={todos}
            lists={lists}
            onAddRecurringTask={addRecurringTodo}
            onDeleteTodo={deleteTodo}
          />
        )
      default:
        return null
    }
  }

  return (
    <Router>
      <div className="flex flex-col h-screen bg-gradient-to-br from-teal-50 to-teal-100">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedList ? 'detail' : activeView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {renderCurrentView()}
          </motion.div>
        </AnimatePresence>
        
        {!selectedList && (
          <BottomNavigation
            activeView={activeView}
            setActiveView={setActiveView}
          />
        )}
      </div>
    </Router>
  )
}

export default App
