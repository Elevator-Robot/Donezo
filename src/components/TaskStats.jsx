import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Clock, AlertCircle, TrendingUp, Calendar } from 'lucide-react'
import { format, isToday, isThisWeek, startOfWeek, endOfWeek } from 'date-fns'

function TaskStats({ todos, lists }) {
  const allTodos = todos

  // Basic stats
  const totalTasks = allTodos.length
  const completedTasks = allTodos.filter(t => t.completed).length
  const activeTasks = totalTasks - completedTasks
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Priority breakdown
  const highPriority = allTodos.filter(t => t.priority === 'high' && !t.completed).length
  const mediumPriority = allTodos.filter(t => t.priority === 'medium' && !t.completed).length
  const lowPriority = allTodos.filter(t => t.priority === 'low' && !t.completed).length

  // Time-based stats
  const todayCompleted = allTodos.filter(t => 
    t.completed && isToday(new Date(t.createdAt))
  ).length

  const thisWeekCompleted = allTodos.filter(t => 
    t.completed && isThisWeek(new Date(t.createdAt))
  ).length

  // Overdue tasks (reminders that have passed)
  const overdueTasks = allTodos.filter(t => 
    !t.completed && 
    t.reminder && 
    new Date(t.reminder) < new Date()
  ).length

  const stats = [
    {
      title: 'Total Tasks',
      value: totalTasks,
      icon: Calendar,
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-100 dark:bg-gray-800'
    },
    {
      title: 'Active Tasks',
      value: activeTasks,
      icon: Clock,
      color: 'text-teal-600 dark:text-teal-400',
      bgColor: 'bg-teal-100 dark:bg-teal-900/30'
    },
    {
      title: 'Completed',
      value: completedTasks,
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30'
    },
    {
      title: 'Completion Rate',
      value: `${completionRate}%`,
      icon: TrendingUp,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Priority Breakdown */}
      {(highPriority > 0 || mediumPriority > 0 || lowPriority > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Priority Breakdown</h3>
          <div className="space-y-3">
            {highPriority > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">High Priority</span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{highPriority}</span>
              </div>
            )}
            {mediumPriority > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Medium Priority</span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{mediumPriority}</span>
              </div>
            )}
            {lowPriority > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Low Priority</span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{lowPriority}</span>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">{todayCompleted}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Completed Today</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{thisWeekCompleted}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">This Week</p>
          </div>
          {overdueTasks > 0 && (
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{overdueTasks}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Overdue</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Lists Breakdown */}
      {lists.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tasks by List</h3>
          <div className="space-y-3">
            {lists.map(list => {
              const listTodos = allTodos.filter(t => t.listId === list.id)
              const listCompleted = listTodos.filter(t => t.completed).length
              const listTotal = listTodos.length
              const listActive = listTotal - listCompleted
              
              if (listTotal === 0) return null
              
              return (
                <div key={list.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      list.color === 'teal' ? 'bg-teal-500' :
                      list.color === 'coral' ? 'bg-orange-500' :
                      'bg-purple-500'
                    }`}></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{list.name}</span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {listActive} active, {listCompleted} done
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default TaskStats