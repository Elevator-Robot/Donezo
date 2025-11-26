import { generateClient } from 'aws-amplify/data'
import { ensureAmplifyConfigured } from '../lib/amplifyClient'
import { v4 as uuidv4 } from 'uuid'

let dataClientPromise
const getDataClient = () => {
  if (!dataClientPromise) {
    dataClientPromise = ensureAmplifyConfigured().then(() => generateClient())
  }
  return dataClientPromise
}
const DEFAULT_SETTINGS = { font: 'Rock Salt', theme: 'light' }
const DEFAULT_LISTS = [
  { name: 'Personal', color: 'teal', icon: 'Heart', type: 'task' },
  { name: 'Work', color: 'blue', icon: 'Zap', type: 'task' },
  { name: 'Shopping', color: 'green', icon: 'ShoppingCart', type: 'task' }
]

const extractError = (errors) => errors?.[0]?.message || null

const mapList = (item) => ({
  id: item.id,
  user_id: item.user_id,
  name: item.name,
  color: item.color,
  icon: item.icon,
  type: item.type,
  created_at: item.created_at
})

const mapTodo = (item) => ({
  id: item.id,
  user_id: item.user_id,
  list_id: item.list_id,
  title: item.title,
  description: item.description,
  completed: item.completed,
  priority: item.priority,
  due_date: item.due_date,
  due_time: item.due_time,
  is_recurring_instance: item.is_recurring_instance,
  parent_recurring_task_id: item.parent_recurring_task_id,
  recurrence: item.recurrence,
  created_at: item.created_at,
  completed_at: item.completed_at
})

export const dataService = {
  async getUserLists(userId) {
    try {
      const dataClient = await getDataClient()
      const { data, errors } = await dataClient.models.List.list({
        filter: { user_id: { eq: userId } },
        limit: 1000
      })

      const error = extractError(errors)
      if (error) throw new Error(error)

      const lists = data?.map(mapList) || []
      return { lists, error: null }
    } catch (error) {
      console.error('Get lists error:', error)
      return { lists: [], error: error.message }
    }
  },

  async createList(userId, listData) {
    try {
      const listId = uuidv4()
      const payload = {
        id: listId,
        user_id: userId,
        name: listData.name,
        color: listData.color || 'teal',
        icon: listData.icon || 'List',
        type: listData.type || 'task',
        created_at: new Date().toISOString()
      }

      const dataClient = await getDataClient()
      const { data, errors } = await dataClient.models.List.create(payload)
      const error = extractError(errors)
      if (error) throw new Error(error)

      return { list: mapList(data), error: null }
    } catch (error) {
      console.error('Create list error:', error)
      return { list: null, error: error.message }
    }
  },

  async updateList(listId, updates) {
    try {
      const dataClient = await getDataClient()
      const { data, errors } = await dataClient.models.List.update({
        id: listId,
        name: updates.name,
        color: updates.color,
        icon: updates.icon,
        type: updates.type
      })

      const error = extractError(errors)
      if (error) throw new Error(error)

      return { list: mapList(data), error: null }
    } catch (error) {
      console.error('Update list error:', error)
      return { list: null, error: error.message }
    }
  },

  async deleteList(listId) {
    try {
      const dataClient = await getDataClient()
      const { errors } = await dataClient.models.List.delete({ id: listId })
      const error = extractError(errors)
      if (error) throw new Error(error)
      return { error: null }
    } catch (error) {
      console.error('Delete list error:', error)
      return { error: error.message }
    }
  },

  async getUserTodos(userId) {
    try {
      const dataClient = await getDataClient()
      const { data, errors } = await dataClient.models.Todo.list({
        filter: { user_id: { eq: userId } },
        limit: 1000
      })

      const error = extractError(errors)
      if (error) throw new Error(error)

      const todos = data?.map(mapTodo) || []
      return { todos, error: null }
    } catch (error) {
      console.error('Get todos error:', error)
      return { todos: [], error: error.message }
    }
  },

  async createTodo(userId, todoData) {
    try {
      const todoId = uuidv4()
      const payload = {
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

      const dataClient = await getDataClient()
      const { data, errors } = await dataClient.models.Todo.create(payload)
      const error = extractError(errors)
      if (error) throw new Error(error)

      return { todo: mapTodo(data), error: null }
    } catch (error) {
      console.error('Create todo error:', error)
      return { todo: null, error: error.message }
    }
  },

  async updateTodo(todoId, updates) {
    try {
      const dataClient = await getDataClient()
      const { data, errors } = await dataClient.models.Todo.update({
        id: todoId,
        ...updates
      })

      const error = extractError(errors)
      if (error) throw new Error(error)

      return { todo: mapTodo(data), error: null }
    } catch (error) {
      console.error('Update todo error:', error)
      return { todo: null, error: error.message }
    }
  },

  async deleteTodo(todoId) {
    try {
      const dataClient = await getDataClient()
      const { errors } = await dataClient.models.Todo.delete({ id: todoId })
      const error = extractError(errors)
      if (error) throw new Error(error)
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

      return await this.updateTodo(todoId, updates)
    } catch (error) {
      console.error('Toggle todo error:', error)
      return { todo: null, error: error.message }
    }
  },

  async getUserSettings(userId) {
    try {
      const dataClient = await getDataClient()
      const { data, errors } = await dataClient.models.UserSettings.get({ id: userId })
      const error = extractError(errors)
      if (error) throw new Error(error)

      if (!data) {
        return { settings: DEFAULT_SETTINGS, error: null }
      }

      return {
        settings: {
          font: data.font || DEFAULT_SETTINGS.font,
          theme: data.theme || DEFAULT_SETTINGS.theme
        },
        error: null
      }
    } catch (error) {
      console.error('Get settings error:', error)
      return { settings: DEFAULT_SETTINGS, error: error.message }
    }
  },

  async updateUserSettings(userId, settings) {
    try {
      const dataClient = await getDataClient()
      const existing = await dataClient.models.UserSettings.get({ id: userId })
      const existingError = extractError(existing.errors)
      if (existingError) throw new Error(existingError)

      const payload = {
        id: userId,
        user_id: userId,
        font: settings.font || DEFAULT_SETTINGS.font,
        theme: settings.theme || DEFAULT_SETTINGS.theme,
        updated_at: new Date().toISOString()
      }

      const operation = existing.data
        ? dataClient.models.UserSettings.update(payload)
        : dataClient.models.UserSettings.create(payload)

      const { data, errors } = await operation
      const error = extractError(errors)
      if (error) throw new Error(error)

      return {
        settings: {
          font: data.font,
          theme: data.theme
        },
        error: null
      }
    } catch (error) {
      console.error('Update settings error:', error)
      return { settings: null, error: error.message }
    }
  },

  async initializeUserData(userId) {
    try {
      const createdLists = []
      for (const listData of DEFAULT_LISTS) {
        const { list, error } = await this.createList(userId, listData)
        if (error) throw new Error(error)
        createdLists.push(list)
      }

      const { settings, error: settingsError } = await this.updateUserSettings(userId, DEFAULT_SETTINGS)
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
