// Mock data service for demo mode
import { v4 as uuidv4 } from 'uuid'

// In-memory storage for demo mode
let mockData = {
  lists: {},
  todos: {},
  settings: {}
}

export const mockDataService = {
  // Lists operations
  async getUserLists(userId) {
    try {
      const userLists = Object.values(mockData.lists).filter(list => list.user_id === userId)
      return { lists: userLists, error: null }
    } catch (error) {
      console.error('Mock get lists error:', error)
      return { lists: [], error: error.message }
    }
  },

  async createList(userId, listData) {
    try {
      const listId = uuidv4()
      const newList = {
        id: listId,
        user_id: userId,
        name: listData.name,
        color: listData.color || 'teal',
        icon: listData.icon || 'List',
        type: listData.type || 'task',
        created_at: new Date().toISOString()
      }

      mockData.lists[listId] = newList
      
      return { list: newList, error: null }
    } catch (error) {
      console.error('Mock create list error:', error)
      return { list: null, error: error.message }
    }
  },

  async updateList(listId, updates) {
    try {
      const existingList = mockData.lists[listId]
      if (!existingList) {
        throw new Error('List not found')
      }

      const updatedList = {
        ...existingList,
        ...updates,
        id: listId, // Ensure ID doesn't change
        user_id: existingList.user_id // Ensure user_id doesn't change
      }

      mockData.lists[listId] = updatedList
      
      return { list: updatedList, error: null }
    } catch (error) {
      console.error('Mock update list error:', error)
      return { list: null, error: error.message }
    }
  },

  async deleteList(listId, userId) {
    try {
      // Delete all todos in this list first
      const todosInList = Object.values(mockData.todos).filter(todo => 
        todo.list_id === listId && todo.user_id === userId
      )
      
      for (const todo of todosInList) {
        delete mockData.todos[todo.id]
      }

      // Then delete the list
      delete mockData.lists[listId]
      
      return { error: null }
    } catch (error) {
      console.error('Mock delete list error:', error)
      return { error: error.message }
    }
  },

  // Todos operations
  async getUserTodos(userId) {
    try {
      const userTodos = Object.values(mockData.todos)
        .filter(todo => todo.user_id === userId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      
      return { todos: userTodos, error: null }
    } catch (error) {
      console.error('Mock get todos error:', error)
      return { todos: [], error: error.message }
    }
  },

  async createTodo(userId, todoData) {
    try {
      const todoId = uuidv4()
      const newTodo = {
        id: todoId,
        user_id: userId,
        list_id: todoData.listId,
        title: todoData.title,
        description: todoData.description || '',
        completed: false,
        priority: todoData.priority || 'medium',
        due_date: todoData.dueDate || null,
        due_time: todoData.dueTime || null,
        is_recurring_instance: todoData.isRecurringInstance || false,
        parent_recurring_task_id: todoData.parentRecurringTaskId || null,
        recurrence: todoData.recurrence || null,
        created_at: new Date().toISOString(),
        completed_at: null
      }

      mockData.todos[todoId] = newTodo
      
      return { todo: newTodo, error: null }
    } catch (error) {
      console.error('Mock create todo error:', error)
      return { todo: null, error: error.message }
    }
  },

  async updateTodo(todoId, updates, userId) {
    try {
      const existingTodo = mockData.todos[todoId]
      if (!existingTodo || existingTodo.user_id !== userId) {
        throw new Error('Todo not found')
      }

      const updatedTodo = {
        ...existingTodo,
        ...updates,
        id: todoId, // Ensure ID doesn't change
        user_id: userId // Ensure user_id doesn't change
      }

      mockData.todos[todoId] = updatedTodo
      
      return { todo: updatedTodo, error: null }
    } catch (error) {
      console.error('Mock update todo error:', error)
      return { todo: null, error: error.message }
    }
  },

  async deleteTodo(todoId, userId) {
    try {
      const todo = mockData.todos[todoId]
      if (!todo || todo.user_id !== userId) {
        throw new Error('Todo not found')
      }

      delete mockData.todos[todoId]
      return { error: null }
    } catch (error) {
      console.error('Mock delete todo error:', error)
      return { error: error.message }
    }
  },

  async toggleTodo(todoId, completed, userId) {
    try {
      const updates = {
        completed,
        completed_at: completed ? new Date().toISOString() : null
      }

      return await this.updateTodo(todoId, updates, userId)
    } catch (error) {
      console.error('Mock toggle todo error:', error)
      return { todo: null, error: error.message }
    }
  },

  // User settings operations
  async getUserSettings(userId) {
    try {
      const settings = mockData.settings[userId] || { font: 'Rock Salt', theme: 'light' }
      return { settings, error: null }
    } catch (error) {
      console.error('Mock get settings error:', error)
      return { settings: { font: 'Rock Salt', theme: 'light' }, error: error.message }
    }
  },

  async updateUserSettings(userId, settings) {
    try {
      mockData.settings[userId] = settings
      return { settings, error: null }
    } catch (error) {
      console.error('Mock update settings error:', error)
      return { settings: null, error: error.message }
    }
  },

  // Initialize default data for new users
  async initializeUserData(userId) {
    try {
      // Create default lists
      const defaultLists = [
        { name: 'Personal', color: 'teal', icon: 'Heart', type: 'task' },
        { name: 'Work', color: 'blue', icon: 'Zap', type: 'task' },
        { name: 'Shopping', color: 'green', icon: 'ShoppingCart', type: 'task' }
      ]

      const createdLists = []
      for (const listData of defaultLists) {
        const { list, error } = await this.createList(userId, listData)
        if (error) throw new Error(error)
        createdLists.push(list)
      }

      // Create default settings
      const { settings, error: settingsError } = await this.updateUserSettings(userId, {
        font: 'Rock Salt',
        theme: 'light'
      })

      if (settingsError) throw new Error(settingsError)

      return { 
        lists: createdLists, 
        settings, 
        error: null 
      }
    } catch (error) {
      console.error('Mock initialize user data error:', error)
      return { lists: [], settings: null, error: error.message }
    }
  }
}