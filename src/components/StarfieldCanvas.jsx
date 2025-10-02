import React, { useEffect, useRef, useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'

class Star {
  constructor(canvas) {
    this.canvas = canvas
    this.reset()
    this.life = Math.random() * 100
  }

  reset() {
    this.x = Math.random() * this.canvas.width
    this.y = Math.random() * this.canvas.height
    this.size = Math.random() * 2 + 1
    this.opacity = Math.random() * 0.5 + 0.1
    this.twinkleSpeed = Math.random() * 0.02 + 0.01
    this.life = 0
  }

  update() {
    this.life += this.twinkleSpeed
    this.opacity = (Math.sin(this.life) + 1) * 0.25 + 0.1
  }

  draw(ctx) {
    ctx.save()
    ctx.globalAlpha = this.opacity
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
}

class Constellation {
  constructor(stars, duration = 2000) {
    this.stars = stars
    this.connections = []
    this.opacity = 0
    this.duration = duration
    this.startTime = Date.now()
    this.isComplete = false
    
    // Create connections between nearby stars
    for (let i = 0; i < stars.length - 1; i++) {
      this.connections.push({
        from: stars[i],
        to: stars[i + 1],
        progress: 0
      })
    }
  }

  update() {
    const elapsed = Date.now() - this.startTime
    const progress = Math.min(elapsed / this.duration, 1)
    
    if (progress < 0.5) {
      this.opacity = progress * 2
    } else {
      this.opacity = 2 - (progress * 2)
    }
    
    this.connections.forEach(connection => {
      connection.progress = Math.min(progress * 2, 1)
    })
    
    if (progress >= 1) {
      this.isComplete = true
    }
  }

  draw(ctx) {
    if (this.opacity <= 0) return
    
    ctx.save()
    ctx.globalAlpha = this.opacity
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 1
    
    this.connections.forEach(connection => {
      if (connection.progress > 0) {
        const { from, to } = connection
        const currentX = from.x + (to.x - from.x) * connection.progress
        const currentY = from.y + (to.y - from.y) * connection.progress
        
        ctx.beginPath()
        ctx.moveTo(from.x, from.y)
        ctx.lineTo(currentX, currentY)
        ctx.stroke()
      }
    })
    
    ctx.restore()
  }
}

const StarfieldCanvas = ({ onTaskComplete, onTaskAdd }) => {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const starsRef = useRef([])
  const constellationsRef = useRef([])
  const { theme } = useTheme()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(theme === 'night')
  }, [theme])

  useEffect(() => {
    if (!isVisible) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      
      // Recreate stars when canvas is resized
      starsRef.current = []
      const starCount = Math.floor((canvas.width * canvas.height) / 10000)
      for (let i = 0; i < starCount; i++) {
        starsRef.current.push(new Star(canvas))
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Update and draw stars
      starsRef.current.forEach(star => {
        star.update()
        star.draw(ctx)
      })
      
      // Update and draw constellations
      constellationsRef.current = constellationsRef.current.filter(constellation => {
        constellation.update()
        constellation.draw(ctx)
        return !constellation.isComplete
      })
      
      animationRef.current = requestAnimationFrame(animate)
    }

    resizeCanvas()
    animate()

    window.addEventListener('resize', resizeCanvas)
    
    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isVisible])

  // Handle task completion animation
  useEffect(() => {
    if (!isVisible || !onTaskComplete) return

    const handleTaskComplete = () => {
      const canvas = canvasRef.current
      if (!canvas || starsRef.current.length < 3) return

      // Find 3-5 nearby stars to connect
      const starCount = Math.min(3 + Math.floor(Math.random() * 3), starsRef.current.length)
      const selectedStars = starsRef.current
        .sort(() => Math.random() - 0.5)
        .slice(0, starCount)
        .sort((a, b) => {
          const centerX = canvas.width / 2
          const centerY = canvas.height / 2
          const distA = Math.sqrt((a.x - centerX) ** 2 + (a.y - centerY) ** 2)
          const distB = Math.sqrt((b.x - centerX) ** 2 + (b.y - centerY) ** 2)
          return distA - distB
        })

      constellationsRef.current.push(new Constellation(selectedStars))
    }

    // Attach to the completion handler
    window.addEventListener('taskCompleted', handleTaskComplete)
    
    return () => {
      window.removeEventListener('taskCompleted', handleTaskComplete)
    }
  }, [isVisible, onTaskComplete])

  // Handle task addition animation (spawn a star)
  useEffect(() => {
    if (!isVisible || !onTaskAdd) return

    const handleTaskAdd = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const newStar = new Star(canvas)
      newStar.size = 3
      newStar.opacity = 1
      starsRef.current.push(newStar)
    }

    window.addEventListener('taskAdded', handleTaskAdd)
    
    return () => {
      window.removeEventListener('taskAdded', handleTaskAdd)
    }
  }, [isVisible, onTaskAdd])

  if (!isVisible) return null

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  )
}

export default StarfieldCanvas