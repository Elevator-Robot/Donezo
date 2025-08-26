// Utility functions for recurring tasks and calendar integration

export const calculateNextDueDate = (recurrence, lastDueDate = null) => {
  const startDate = lastDueDate ? new Date(lastDueDate) : new Date()
  
  switch (recurrence.type) {
    case 'daily':
      const nextDay = new Date(startDate)
      nextDay.setDate(nextDay.getDate() + recurrence.interval)
      return nextDay.toISOString().split('T')[0]
      
    case 'weekly':
      const nextWeek = new Date(startDate)
      nextWeek.setDate(nextWeek.getDate() + (7 * recurrence.interval))
      return nextWeek.toISOString().split('T')[0]
      
    case 'monthly':
      const nextMonth = new Date(startDate)
      nextMonth.setMonth(nextMonth.getMonth() + recurrence.interval)
      return nextMonth.toISOString().split('T')[0]
      
    case 'yearly':
      const nextYear = new Date(startDate)
      nextYear.setFullYear(nextYear.getFullYear() + recurrence.interval)
      return nextYear.toISOString().split('T')[0]
      
    case 'weekdays':
      let nextWeekday = new Date(startDate)
      do {
        nextWeekday.setDate(nextWeekday.getDate() + 1)
      } while (nextWeekday.getDay() === 0 || nextWeekday.getDay() === 6)
      return nextWeekday.toISOString().split('T')[0]
      
    case 'weekends':
      let nextWeekend = new Date(startDate)
      do {
        nextWeekend.setDate(nextWeekend.getDate() + 1)
      } while (nextWeekend.getDay() !== 0 && nextWeekend.getDay() !== 6)
      return nextWeekend.toISOString().split('T')[0]
      
    case 'custom':
      if (!recurrence.days || recurrence.days.length === 0) {
        return startDate.toISOString().split('T')[0]
      }
      
      let nextCustom = new Date(startDate)
      let attempts = 0
      const maxAttempts = 14 // Prevent infinite loops
      
      while (attempts < maxAttempts) {
        nextCustom.setDate(nextCustom.getDate() + 1)
        if (recurrence.days.includes(nextCustom.getDay())) {
          return nextCustom.toISOString().split('T')[0]
        }
        attempts++
      }
      return startDate.toISOString().split('T')[0]
      
    default:
      return startDate.toISOString().split('T')[0]
  }
}

export const shouldCreateNextInstance = (recurrence, lastDueDate, endValue) => {
  if (recurrence.end === 'never') {
    return true
  }
  
  if (recurrence.end === 'after') {
    // Count how many instances have been created
    // This would need to be tracked in the task data
    return true // Simplified for now
  }
  
  if (recurrence.end === 'until') {
    const endDate = new Date(endValue)
    const nextDate = new Date(calculateNextDueDate(recurrence, lastDueDate))
    return nextDate <= endDate
  }
  
  return true
}

export const generateRecurringInstances = (recurringTask, count = 10) => {
  const instances = []
  let currentDate = recurringTask.startDate
  
  for (let i = 0; i < count; i++) {
    if (!shouldCreateNextInstance(recurringTask.recurrence, currentDate, recurringTask.recurrence.endValue)) {
      break
    }
    
    const instance = {
      ...recurringTask,
      id: `${recurringTask.id}-${i}`,
      dueDate: currentDate,
      isRecurringInstance: true,
      parentRecurringTaskId: recurringTask.id,
      completed: false,
      createdAt: new Date().toISOString()
    }
    
    instances.push(instance)
    currentDate = calculateNextDueDate(recurringTask.recurrence, currentDate)
  }
  
  return instances
}

export const getRecurrenceDescription = (recurrence) => {
  switch (recurrence.type) {
    case 'daily':
      return `Every ${recurrence.interval > 1 ? `${recurrence.interval} days` : 'day'}`
    case 'weekly':
      return `Every ${recurrence.interval > 1 ? `${recurrence.interval} weeks` : 'week'}`
    case 'monthly':
      return `Every ${recurrence.interval > 1 ? `${recurrence.interval} months` : 'month'}`
    case 'yearly':
      return `Every ${recurrence.interval > 1 ? `${recurrence.interval} years` : 'year'}`
    case 'weekdays':
      return 'Every weekday (Monday to Friday)'
    case 'weekends':
      return 'Every weekend (Saturday and Sunday)'
    case 'custom':
      const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const selectedDays = recurrence.days?.map(day => weekDays[day]).join(', ') || ''
      return `Every ${selectedDays}`
    default:
      return 'No recurrence'
  }
}

// Calendar integration utilities
export const createCalendarEvent = (task) => {
  if (!task.dueDate && !task.dueTime) {
    return null
  }
  
  const event = {
    summary: task.title,
    description: task.description || '',
    start: {
      dateTime: task.dueTime 
        ? `${task.dueDate}T${task.dueTime}:00`
        : `${task.dueDate}T09:00:00`,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    end: {
      dateTime: task.dueTime 
        ? `${task.dueDate}T${task.dueTime}:00`
        : `${task.dueDate}T10:00:00`,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    reminders: {
      useDefault: false,
      overrides: task.reminders?.map(reminder => {
        const minutes = getReminderMinutes(reminder)
        return {
          method: 'popup',
          minutes: minutes
        }
      }) || []
    }
  }
  
  return event
}

export const getReminderMinutes = (reminder) => {
  switch (reminder) {
    case '5min': return 5
    case '15min': return 15
    case '30min': return 30
    case '1hour': return 60
    case '1day': return 1440 // 24 * 60
    case '1week': return 10080 // 7 * 24 * 60
    default: return 15
  }
}

export const formatDueDate = (dueDate, dueTime) => {
  if (!dueDate) return null
  
  const date = new Date(dueDate)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const isToday = date.toDateString() === today.toDateString()
  const isTomorrow = date.toDateString() === tomorrow.toDateString()
  
  if (isToday) {
    return dueTime ? `Today at ${dueTime}` : 'Today'
  } else if (isTomorrow) {
    return dueTime ? `Tomorrow at ${dueTime}` : 'Tomorrow'
  } else {
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
    return dueTime ? `${formattedDate} at ${dueTime}` : formattedDate
  }
}

export const isOverdue = (dueDate, dueTime) => {
  if (!dueDate) return false
  
  const now = new Date()
  const due = dueTime 
    ? new Date(`${dueDate}T${dueTime}:00`)
    : new Date(`${dueDate}T23:59:59`)
  
  return now > due
}

export const getPriorityColor = (priority) => {
  switch (priority) {
    case 'high':
      return 'text-red-600 dark:text-red-400'
    case 'medium':
      return 'text-yellow-600 dark:text-yellow-400'
    case 'low':
      return 'text-green-600 dark:text-green-400'
    default:
      return 'text-gray-600 dark:text-gray-400'
  }
}

export const getPriorityBackground = (priority) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
    case 'medium':
      return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
    case 'low':
      return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
    default:
      return 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300'
  }
}
