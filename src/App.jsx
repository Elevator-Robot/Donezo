import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ThemeProvider } from './contexts/ThemeContext'
import Sidebar from './components/Sidebar'
import TodoList from './components/TodoList'
import AddTodo from './components/AddTodo'
import ThemeToggle from './components/ThemeToggle'
import { Bell, CheckCircle, Clock, Plus } from 'lucide-react'

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

  const currentTodos = todos.filter(todo => todo.listId === activeList)
  const currentList = lists.find(list => list.id === activeList)

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
        />
        
        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4 transition-colors duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentList?.name || 'All Tasks'}
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  {currentTodos.filter(t => !t.completed).length} tasks remaining
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <ThemeToggle />
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

            <TodoList
              todos={currentTodos}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
            />
          </div>
        </main>
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App
