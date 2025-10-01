import { useEffect } from 'react'

export const useKeyboardShortcuts = (shortcuts) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ignore shortcuts when user is typing in an input/textarea
      const isInputFocused = ['INPUT', 'TEXTAREA', 'SELECT'].includes(
        document.activeElement?.tagName
      )
      
      if (isInputFocused) return

      const key = event.key.toLowerCase()
      const ctrl = event.ctrlKey || event.metaKey
      const shift = event.shiftKey
      const alt = event.altKey

      Object.entries(shortcuts).forEach(([shortcut, callback]) => {
        const [modifiers, targetKey] = shortcut.split('+').map(k => k.trim())
        
        // Parse modifiers and key
        const needsCtrl = modifiers.includes('ctrl') || modifiers.includes('cmd')
        const needsShift = modifiers.includes('shift')
        const needsAlt = modifiers.includes('alt')
        const keyToMatch = targetKey || modifiers // If no +, the whole string is the key

        // Check if modifiers match
        const modifiersMatch = 
          needsCtrl === ctrl &&
          needsShift === shift &&
          needsAlt === alt

        // Check if key matches
        const keyMatches = key === keyToMatch.toLowerCase()

        if (modifiersMatch && keyMatches) {
          event.preventDefault()
          callback(event)
        }
      })
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}