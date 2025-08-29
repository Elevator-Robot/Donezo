import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Plus, ShoppingCart } from 'lucide-react'

function AddGroceryItem({ onAdd, onClose, lists, activeList }) {
  const [itemName, setItemName] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [category, setCategory] = useState('general')
  const [listId, setListId] = useState(activeList)

  const currentList = lists.find(list => list.id === listId)
  const isGroceryList = currentList?.type === 'grocery'

  const categories = [
    { value: 'general', label: 'General', icon: '🛒' },
    { value: 'produce', label: 'Produce', icon: '🥬' },
    { value: 'dairy', label: 'Dairy', icon: '🥛' },
    { value: 'meat', label: 'Meat', icon: '🥩' },
    { value: 'pantry', label: 'Pantry', icon: '🥫' },
    { value: 'frozen', label: 'Frozen', icon: '🧊' },
    { value: 'beverages', label: 'Beverages', icon: '🥤' },
    { value: 'snacks', label: 'Snacks', icon: '🍿' },
    { value: 'household', label: 'Household', icon: '🧽' },
    { value: 'personal', label: 'Personal Care', icon: '🧴' }
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    if (itemName.trim()) {
      const currentList = lists.find(list => list.id === listId)
      
      onAdd({
        title: `${quantity} ${itemName.trim()}`,
        description: `Category: ${categories.find(cat => cat.value === category)?.label || 'General'}`,
        listId,
        listName: currentList?.name || 'Unknown',
        priority: null,
        category: category,
        quantity: quantity,
        isGroceryItem: true
      })
      
      // Clear form
      setItemName('')
      setQuantity('1')
      setCategory('general')
    }
  }

  const addQuickItem = (item) => {
    setItemName(item)
    setQuantity('1')
    setCategory('general')
  }

  const quickItems = isGroceryList ? [
    'Milk', 'Bread', 'Eggs', 'Bananas', 'Apples', 'Chicken', 'Rice', 'Pasta',
    'Tomatoes', 'Onions', 'Cheese', 'Yogurt', 'Butter', 'Potatoes', 'Carrots'
  ] : [
    'Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5', 'Item 6', 'Item 7', 'Item 8',
    'Item 9', 'Item 10', 'Item 11', 'Item 12', 'Item 13', 'Item 14', 'Item 15'
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="card w-full max-w-lg relative z-[10000] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {isGroceryList ? 'Add Grocery Item' : 'Add Item'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
          >
            <X size={20} className="text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isGroceryList ? 'Item Name' : 'Item'} *
            </label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder={isGroceryList ? "What do you need to buy?" : "What item do you need?"}
              className="input-field"
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quantity
              </label>
              <select
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="input-field"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-field"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              List
            </label>
            <select
              value={listId}
              onChange={(e) => setListId(e.target.value)}
              className="input-field"
            >
              {lists.filter(list => list.type === 'grocery' || list.type === 'item').map((list) => (
                <option key={list.id} value={list.id}>
                  {list.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Add Items */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quick Add Common {isGroceryList ? 'Items' : 'Items'}
            </label>
            <div className="flex flex-wrap gap-2">
              {quickItems.map((item) => (
                <motion.button
                  key={item}
                  type="button"
                  onClick={() => addQuickItem(item)}
                  className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="btn-primary flex-1 relative z-[10001] flex items-center justify-center gap-2"
              disabled={!itemName.trim()}
            >
              <Plus size={16} />
              Add Item
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default AddGroceryItem
