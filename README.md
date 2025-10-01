# Donezo - Mobile-First Task Manager

A modern, beautiful, and functional task manager built with React, featuring a mobile-first design with bottom tab navigation, dual themes (Sunset/Night Sky), and smooth 60fps animations. Perfect for organizing tasks with reminders, recurrence, and calendar views.

## ✨ Features

- **Mobile-First Design**: Bottom tab navigation optimized for mobile devices (360px+)
- **Three Main Screens**: 
  - **Today**: View all tasks due today
  - **Lists**: Create/edit task lists, tap to view tasks in each list
  - **Calendar**: Monthly calendar view with task visualization
- **Dual Theme System**: 
  - **Sunset Theme**: Warm gradient backgrounds with subtle parallax animation
  - **Night Sky Theme**: Deep gradients with animated starfield and constellation effects
- **Task Recurrence**: Create repeating tasks (daily/weekly/monthly)
- **Smart Reminders**: Set reminders with browser notifications
- **Priority Levels**: Mark tasks as High, Medium, or Low priority
- **Smooth Animations**: 60fps transitions with reduced motion accessibility support
- **Touch-Friendly**: 44px+ touch targets for optimal mobile experience
- **Safe Area Support**: Proper handling of device safe areas (notches, etc.)
- **Local Storage**: All data persisted locally in your browser

## 🎨 Design & Themes

### Sunset Theme (Light)
- **Warm Gradients**: Subtle parallax animation on warm orange/yellow gradients
- **Soft Shadows**: Card-based layout with gentle shadows and rounded corners
- **Accessible Colors**: High contrast text on light backgrounds

### Night Sky Theme (Dark)
- **Deep Space Gradients**: Rich purple/blue gradients with subtle depth
- **Starfield Animation**: Animated twinkling stars across the background
- **Constellation Effects**: On task completion, nearby stars connect to form constellations
- **Low CPU Impact**: Optimized animations that respect device performance

### Mobile-First UX
- **Bottom Tab Bar**: Fixed navigation with icons and labels
- **Floating Action Buttons**: Easy-to-reach add buttons on each screen
- **Swipe-Friendly**: Smooth transitions between screens
- **Theme Toggle**: Instant theme switching available on all screens

## 🚀 Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone or download this project
2. Navigate to the project directory:
   ```bash
   cd Donezo
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and visit `http://localhost:3000`

### Building for Production

To create a production build:

```bash
npm run build
```

## 📱 How to Use

### Creating Tasks
1. Click the "Add Task" button
2. Fill in the task title (required)
3. Add an optional description
4. Select which list to add it to
5. Set priority level if needed
6. Add a reminder (optional)
7. Click "Add Task"

### Setting Reminders
- Use the datetime picker for custom times
- Use quick reminder buttons for common intervals (1 hour, 3 hours, tomorrow, etc.)
- Reminders will show browser notifications (requires permission)

### Managing Lists
- Create new lists with custom colors and icons
- Switch between lists using the sidebar
- Delete lists (tasks will be removed with the list)

### Task Management
- Click the circle to mark tasks as complete
- Hover over tasks to see the delete button
- Tasks are automatically sorted by completion status and reminder time

## 🛠️ Tech Stack

- **React 18**: Modern React with hooks
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library
- **Lucide React**: Beautiful icons
- **date-fns**: Date manipulation utilities
- **React Router**: Client-side routing

## 📁 Project Structure

```
src/
├── components/
│   ├── AddTodo.jsx      # Task creation modal
│   ├── Sidebar.jsx      # Navigation sidebar
│   └── TodoList.jsx     # Task display component
├── App.jsx              # Main application component
├── main.jsx            # React entry point
└── index.css           # Global styles and Tailwind
```

## 🎯 Key Features Explained

### Reminder System
- Browser notifications for task reminders
- Color-coded reminder badges (urgent, soon, later)
- Quick reminder presets for common intervals

### Multiple Lists
- Create unlimited custom lists
- Each list has its own color and icon
- Easy switching between lists

### Data Persistence
- All data is saved to localStorage
- No account required - your data stays on your device
- Automatic saving on every change

## 🎨 Customization

The app uses a custom Tailwind configuration with:
- Teal primary colors
- Coral and lavender accent colors
- Custom animations and transitions
- Responsive design utilities

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

---

**Donezo** - Get things done beautifully! ✨
