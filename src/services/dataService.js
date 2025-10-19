import { PutCommand, GetCommand, DeleteCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { dynamoDB, AWS_CONFIG, generateKeys, ENTITY_TYPES, DEMO_MODE } from '../lib/aws'
import { mockDataService } from './mockDataService'
import { v4 as uuidv4 } from 'uuid'

// If in demo mode or AWS is not configured, use mock service
const isAwsAvailable = !DEMO_MODE && dynamoDB

// Function to check if AWS is properly configured
const checkAwsConfiguration = () => {
  if (!isAwsAvailable) {
    console.warn('AWS not configured or in demo mode. Using mock data service.')
    return false
  }
  
  if (!AWS_CONFIG.DYNAMODB_TABLE_NAME) {
    console.error('AWS DynamoDB configuration missing. Please check environment variables.')
    return false
  }
  
  return true
}

export const dataService = {
  // Lists operations
  async getUserLists(userId) {
    // Use mock service if AWS is not available
    if (!checkAwsConfiguration()) {
      return await mockDataService.getUserLists(userId)
    }

    try {
      const command = new QueryCommand({
        TableName: AWS_CONFIG.DYNAMODB_TABLE_NAME,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: {
          ':pk': `USER#${userId}`,
          ':sk': 'LIST#'
        },
        ScanIndexForward: true // Sort by SK (creation time)
      })

      const response = await dynamoDB.send(command)
      const lists = response.Items?.map(item => ({
        id: item.id,
        user_id: item.user_id,
        name: item.name,
        color: item.color,
        icon: item.icon,
        type: item.type,
        created_at: item.created_at
      })) || []

      return { lists, error: null }
    } catch (error) {
      console.error('Get lists error:', error)
      return { lists: [], error: error.message }
    }
  },

  async createList(userId, listData) {
    // Use mock service if AWS is not available
    if (!checkAwsConfiguration()) {
      return await mockDataService.createList(userId, listData)
    }

    try {
      const listId = uuidv4()
      const listKeys = generateKeys.list(userId, listId)
      
      const newList = {
        ...listKeys,
        EntityType: ENTITY_TYPES.LIST,
        id: listId,
        user_id: userId,
        name: listData.name,
        color: listData.color || 'teal',
        icon: listData.icon || 'List',
        type: listData.type || 'task',
        created_at: new Date().toISOString()
      }

      const command = new PutCommand({
        TableName: AWS_CONFIG.DYNAMODB_TABLE_NAME,
        Item: newList
      })

      await dynamoDB.send(command)
      
      // Return the list without DynamoDB keys
      const { PK, SK, EntityType, ...returnList } = newList
      return { list: returnList, error: null }
    } catch (error) {
      console.error('Create list error:', error)
      return { list: null, error: error.message }
    }
  },

  async updateList(listId, updates) {
    // Use mock service if AWS is not available
    if (!checkAwsConfiguration()) {
      return await mockDataService.updateList(listId, updates)
    }

    try {
      // We need the userId to construct the key - this would need to be passed or retrieved
      // For now, we'll implement a workaround by finding the list first
      const userId = updates.user_id || updates.userId
      if (!userId) {
        throw new Error('User ID is required for list updates')
      }

      const listKeys = generateKeys.list(userId, listId)
      
      const command = new UpdateCommand({
        TableName: AWS_CONFIG.DYNAMODB_TABLE_NAME,
        Key: listKeys,
        UpdateExpression: 'SET #name = :name, #color = :color, #icon = :icon',
        ExpressionAttributeNames: {
          '#name': 'name',
          '#color': 'color',
          '#icon': 'icon'
        },
        ExpressionAttributeValues: {
          ':name': updates.name,
          ':color': updates.color,
          ':icon': updates.icon
        },
        ReturnValues: 'ALL_NEW'
      })

      const response = await dynamoDB.send(command)
      const { PK, SK, EntityType, ...list } = response.Attributes
      
      return { list, error: null }
    } catch (error) {
      console.error('Update list error:', error)
      return { list: null, error: error.message }
    }
  },

  async deleteList(listId, userId) {
    // Use mock service if AWS is not available
    if (!checkAwsConfiguration()) {
      return await mockDataService.deleteList(listId, userId)
    }

    try {
      // First delete all todos in this list
      const todosResponse = await this.getUserTodos(userId)
      const todosInList = todosResponse.todos.filter(todo => todo.list_id === listId)
      
      for (const todo of todosInList) {
        await this.deleteTodo(todo.id, userId)
      }

      // Then delete the list
      const listKeys = generateKeys.list(userId, listId)
      
      const command = new DeleteCommand({
        TableName: AWS_CONFIG.DYNAMODB_TABLE_NAME,
        Key: listKeys
      })

      await dynamoDB.send(command)
      return { error: null }
    } catch (error) {
      console.error('Delete list error:', error)
      return { error: error.message }
    }
  },

  // Todos operations
  async getUserTodos(userId) {
    // Use mock service if AWS is not available
    if (!checkAwsConfiguration()) {
      return await mockDataService.getUserTodos(userId)
    }

    try {
      const command = new QueryCommand({
        TableName: AWS_CONFIG.DYNAMODB_TABLE_NAME,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: {
          ':pk': `USER#${userId}`,
          ':sk': 'TODO#'
        },
        ScanIndexForward: false // Reverse order (newest first)
      })

      const response = await dynamoDB.send(command)
      const todos = response.Items?.map(item => ({
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
      })) || []

      return { todos, error: null }
    } catch (error) {
      console.error('Get todos error:', error)
      return { todos: [], error: error.message }
    }
  },

  async createTodo(userId, todoData) {
    // Use mock service if AWS is not available
    if (!checkAwsConfiguration()) {
      return await mockDataService.createTodo(userId, todoData)
    }

    try {
      const todoId = uuidv4()
      const todoKeys = generateKeys.todo(userId, todoId)
      
      const newTodo = {
        ...todoKeys,
        EntityType: ENTITY_TYPES.TODO,
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

      const command = new PutCommand({
        TableName: AWS_CONFIG.DYNAMODB_TABLE_NAME,
        Item: newTodo
      })

      await dynamoDB.send(command)
      
      // Return the todo without DynamoDB keys
      const { PK, SK, EntityType, ...returnTodo } = newTodo
      return { todo: returnTodo, error: null }
    } catch (error) {
      console.error('Create todo error:', error)
      return { todo: null, error: error.message }
    }
  },

  async updateTodo(todoId, updates, userId) {
    // Use mock service if AWS is not available
    if (!checkAwsConfiguration()) {
      return await mockDataService.updateTodo(todoId, updates, userId)
    }

    try {
      const todoKeys = generateKeys.todo(userId, todoId)
      
      // Build update expression dynamically
      let updateExpression = 'SET '
      const expressionAttributeNames = {}
      const expressionAttributeValues = {}
      
      const updateFields = []
      
      Object.keys(updates).forEach(key => {
        if (key !== 'user_id' && key !== 'id') { // Don't update these fields
          updateFields.push(`#${key} = :${key}`)
          expressionAttributeNames[`#${key}`] = key
          expressionAttributeValues[`:${key}`] = updates[key]
        }
      })
      
      updateExpression += updateFields.join(', ')

      const command = new UpdateCommand({
        TableName: AWS_CONFIG.DYNAMODB_TABLE_NAME,
        Key: todoKeys,
        UpdateExpression: updateExpression,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW'
      })

      const response = await dynamoDB.send(command)
      const { PK, SK, EntityType, ...todo } = response.Attributes
      
      return { todo, error: null }
    } catch (error) {
      console.error('Update todo error:', error)
      return { todo: null, error: error.message }
    }
  },

  async deleteTodo(todoId, userId) {
    // Use mock service if AWS is not available
    if (!checkAwsConfiguration()) {
      return await mockDataService.deleteTodo(todoId, userId)
    }

    try {
      const todoKeys = generateKeys.todo(userId, todoId)
      
      const command = new DeleteCommand({
        TableName: AWS_CONFIG.DYNAMODB_TABLE_NAME,
        Key: todoKeys
      })

      await dynamoDB.send(command)
      return { error: null }
    } catch (error) {
      console.error('Delete todo error:', error)
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
      console.error('Toggle todo error:', error)
      return { todo: null, error: error.message }
    }
  },

  // User settings operations
  async getUserSettings(userId) {
    // Use mock service if AWS is not available
    if (!checkAwsConfiguration()) {
      return await mockDataService.getUserSettings(userId)
    }

    try {
      const settingsKeys = generateKeys.userSettings(userId)
      
      const command = new GetCommand({
        TableName: AWS_CONFIG.DYNAMODB_TABLE_NAME,
        Key: settingsKeys
      })

      const response = await dynamoDB.send(command)
      
      // Return default settings if none found
      if (!response.Item) {
        return { 
          settings: { font: 'Rock Salt', theme: 'light' }, 
          error: null 
        }
      }
      
      return { settings: response.Item.settings, error: null }
    } catch (error) {
      console.error('Get settings error:', error)
      return { settings: { font: 'Rock Salt', theme: 'light' }, error: error.message }
    }
  },

  async updateUserSettings(userId, settings) {
    // Use mock service if AWS is not available
    if (!checkAwsConfiguration()) {
      return await mockDataService.updateUserSettings(userId, settings)
    }

    try {
      const settingsKeys = generateKeys.userSettings(userId)
      
      const item = {
        ...settingsKeys,
        EntityType: ENTITY_TYPES.USER_SETTINGS,
        user_id: userId,
        settings,
        updated_at: new Date().toISOString()
      }

      const command = new PutCommand({
        TableName: AWS_CONFIG.DYNAMODB_TABLE_NAME,
        Item: item
      })

      await dynamoDB.send(command)
      return { settings, error: null }
    } catch (error) {
      console.error('Update settings error:', error)
      return { settings: null, error: error.message }
    }
  },

  // Initialize default data for new users
  async initializeUserData(userId) {
    // Use mock service if AWS is not available
    if (!checkAwsConfiguration()) {
      return await mockDataService.initializeUserData(userId)
    }

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