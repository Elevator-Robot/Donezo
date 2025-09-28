# Donezo - Minimal Task Manager

A clean, relaxing, and modern todo list application built with React. Designed for simplicity and focus, perfect for organizing your tasks without distractions.

## ✨ Features

- **Multiple Todo Lists**: Organize tasks into different categories (Personal, Work, Shopping, etc.)
- **Smart Reminders**: Set reminders with notifications for your tasks
- **Priority Levels**: Mark tasks as High, Medium, or Low priority
- **Minimal Design**: Clean, relaxing interface with subtle colors and smooth animations
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Local Storage**: Your data is saved locally in your browser
- **Quick Actions**: Easy task management with intuitive controls

## 🎨 Design

- **Minimal Color Palette**: Calming gray tones with subtle blue accents
- **Clean Interface**: Reduced visual complexity for better focus
- **Smooth Animations**: Powered by Framer Motion for delightful interactions
- **Modern Typography**: Clean Poppins font for excellent readability
- **Card-based Layout**: Organized interface with subtle shadows

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
- Minimal primary colors (calming grays)
- Subtle accent colors (soft blue)
- Custom animations and transitions
- Responsive design utilities

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

---

**Donezo** - Get things done beautifully! ✨
