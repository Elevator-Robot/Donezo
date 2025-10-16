import { supabase } from '../lib/supabase'

export const dataService = {
  // Lists operations
  async getUserLists(userId) {
    try {
      const { data, error } = await supabase
        .from('lists')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return { lists: data || [], error: null }
    } catch (error) {
      console.error('Get lists error:', error)
      return { lists: [], error: error.message }
    }
  },

  async createList(userId, listData) {
    try {
      const newList = {
        id: crypto.randomUUID(),
        user_id: userId,
        name: listData.name,
        color: listData.color || 'teal',
        icon: listData.icon || 'List',
        type: listData.type || 'task',
        created_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('lists')
        .insert([newList])
        .select()
        .single()

      if (error) throw error
      return { list: data, error: null }
    } catch (error) {
      console.error('Create list error:', error)
      return { list: null, error: error.message }
    }
  },

  async updateList(listId, updates) {
    try {
      const { data, error } = await supabase
        .from('lists')
        .update(updates)
        .eq('id', listId)
        .select()
        .single()

      if (error) throw error
      return { list: data, error: null }
    } catch (error) {
      console.error('Update list error:', error)
      return { list: null, error: error.message }
    }
  },

  async deleteList(listId) {
    try {
      // First delete all todos in this list
      await supabase
        .from('todos')
        .delete()
        .eq('list_id', listId)

      // Then delete the list
      const { error } = await supabase
        .from('lists')
        .delete()
        .eq('id', listId)

      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Delete list error:', error)
      return { error: error.message }
    }
  },

  // Todos operations
  async getUserTodos(userId) {
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { todos: data || [], error: null }
    } catch (error) {
      console.error('Get todos error:', error)
      return { todos: [], error: error.message }
    }
  },

  async createTodo(userId, todoData) {
    try {
      const newTodo = {
        id: crypto.randomUUID(),
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

      const { data, error } = await supabase
        .from('todos')
        .insert([newTodo])
        .select()
        .single()

      if (error) throw error
      return { todo: data, error: null }
    } catch (error) {
      console.error('Create todo error:', error)
      return { todo: null, error: error.message }
    }
  },

  async updateTodo(todoId, updates) {
    try {
      const { data, error } = await supabase
        .from('todos')
        .update(updates)
        .eq('id', todoId)
        .select()
        .single()

      if (error) throw error
      return { todo: data, error: null }
    } catch (error) {
      console.error('Update todo error:', error)
      return { todo: null, error: error.message }
    }
  },

  async deleteTodo(todoId) {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', todoId)

      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Delete todo error:', error)
      return { error: error.message }
    }
  },

  async toggleTodo(todoId, completed) {
    try {
      const updates = {
        completed,
        completed_at: completed ? new Date().toISOString() : null
      }

      const { data, error } = await supabase
        .from('todos')
        .update(updates)
        .eq('id', todoId)
        .select()
        .single()

      if (error) throw error
      return { todo: data, error: null }
    } catch (error) {
      console.error('Toggle todo error:', error)
      return { todo: null, error: error.message }
    }
  },

  // User settings operations
  async getUserSettings(userId) {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      
      // Return default settings if none found
      if (!data) {
        return { 
          settings: { font: 'Rock Salt', theme: 'light' }, 
          error: null 
        }
      }
      
      return { settings: data.settings, error: null }
    } catch (error) {
      console.error('Get settings error:', error)
      return { settings: { font: 'Rock Salt', theme: 'light' }, error: error.message }
    }
  },

  async updateUserSettings(userId, settings) {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .upsert([
          {
            user_id: userId,
            settings,
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single()

      if (error) throw error
      return { settings: data.settings, error: null }
    } catch (error) {
      console.error('Update settings error:', error)
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
      console.error('Initialize user data error:', error)
      return { lists: [], settings: null, error: error.message }
    }
  }
}