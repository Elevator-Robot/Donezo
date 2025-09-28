import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, List, CheckSquare } from 'lucide-react'

function BottomNavigation({ activeView, setActiveView }) {
  const navItems = [
    {
      id: 'today',
      label: 'Today',
      icon: CheckSquare,
      color: 'teal'
    },
    {
      id: 'lists',
      label: 'Lists',
      icon: List,
      color: 'coral'
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: Calendar,
      color: 'lavender'
    }
  ]

  const getColorClasses = (color, isActive) => {
    const colors = {
      teal: {
        active: 'text-teal-600 bg-teal-50',
        inactive: 'text-gray-500 hover:text-teal-600'
      },
      coral: {
        active: 'text-coral-600 bg-coral-50',
        inactive: 'text-gray-500 hover:text-coral-600'
      },
      lavender: {
        active: 'text-lavender-600 bg-lavender-50',
        inactive: 'text-gray-500 hover:text-lavender-600'
      }
    }
    return colors[color][isActive ? 'active' : 'inactive']
  }

  return (
    <div className="bg-white border-t border-gray-200 px-6 py-3">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = activeView === item.id
          const Icon = item.icon
          
          return (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveView(item.id)}
              className={`flex flex-col items-center py-2 px-4 rounded-lg transition-all duration-200 ${
                getColorClasses(item.color, isActive)
              }`}
            >
              <Icon size={24} className="mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
              
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full ${
                    item.color === 'teal' ? 'bg-teal-500' :
                    item.color === 'coral' ? 'bg-coral-500' :
                    'bg-lavender-500'
                  }`}
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

export default BottomNavigation