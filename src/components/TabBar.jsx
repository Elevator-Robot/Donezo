import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, List, CheckCircle } from 'lucide-react'

const TabBar = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'today', label: 'Today', icon: CheckCircle },
    { id: 'lists', label: 'Lists', icon: List },
    { id: 'calendar', label: 'Calendar', icon: Calendar }
  ]

  return (
    <div className="tab-bar fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-1 safe-area-bottom">
      <div className="flex justify-around">
        {tabs.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          
          return (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg min-w-0 flex-1 mx-1 transition-colors duration-200 ${
                isActive 
                  ? 'text-teal-600 bg-teal-50' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon 
                size={24} 
                className={`mb-1 ${isActive ? 'text-teal-600' : 'text-gray-600'}`} 
              />
              <span className={`text-xs font-medium ${isActive ? 'text-teal-600' : 'text-gray-600'}`}>
                {tab.label}
              </span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

export default TabBar