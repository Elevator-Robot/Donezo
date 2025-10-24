# Doink - Mobile-First Task Manager

A modern, beautiful, and functional task manager built with React, featuring a mobile-first design with bottom tab navigation, dual themes (Sunset/Night Sky), smooth 60fps animations, and **persistent user accounts with cross-device synchronization powered by AWS**.

## ✨ Features

- **Mobile-First Design**: Bottom tab navigation optimized for mobile devices (360px+)
- **Persistent User Accounts**: Sign up/sign in with email, data syncs across all devices
- **Cross-Device Sync**: Access your tasks from any device, anywhere
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
- **Secure Data**: AWS DynamoDB with IAM-based security and Cognito authentication

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
- An AWS account (free tier sufficient)

### Installation

1. Clone or download this project
2. Navigate to the project directory:
   ```bash
   cd Doink
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Set up AWS (required for user accounts):
   - Follow the detailed guide in [AWS_SETUP.md](AWS_SETUP.md)
   - Create your AWS DynamoDB table and Cognito User Pool
   - Copy `.env.example` to `.env.local` and add your AWS credentials

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open your browser and visit `http://localhost:3000`

### Building for Production

To create a production build:

```bash
npm run build
```

**Environment Variables for Production:**
Make sure your production environment has the AWS credentials:
```env
VITE_AWS_REGION=your-aws-region
VITE_AWS_COGNITO_USER_POOL_ID=your-user-pool-id
VITE_AWS_COGNITO_CLIENT_ID=your-client-id
VITE_AWS_DYNAMODB_TABLE_NAME=your-table-name
```

**⚠️ Critical:** The `VITE_AWS_COGNITO_CLIENT_ID` is required for all authentication flows (sign up, sign in, password recovery). If this is missing or incorrect, authentication will fail with configuration errors. See troubleshooting in [AWS_SETUP.md](AWS_SETUP.md).

See [AWS_SETUP.md](AWS_SETUP.md) for detailed setup instructions.

## 📱 How to Use

### Creating Your Account
1. On first visit, you'll see the sign-up/sign-in screen
2. Create a new account with email and password
3. Your account will be created and you'll be automatically signed in
4. Default lists (Personal, Work, Shopping) will be created for you

### Creating Tasks
1. Click the "Add Task" button (+ button)
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
- Switch between lists using the Lists tab
- Delete lists (tasks will be removed with the list)

### Task Management
- Click the circle to mark tasks as complete
- Hover over tasks to see the delete button
- Tasks are automatically sorted by completion status and reminder time

### Multi-Device Access
- Sign in with the same account on any device
- Your tasks, lists, and settings will automatically sync
- Changes made on one device appear on all other devices

## 🛠️ Tech Stack

- **React 18**: Modern React with hooks
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library
- **Lucide React**: Beautiful icons
- **date-fns**: Date manipulation utilities
- **React Router**: Client-side routing
- **AWS DynamoDB**: NoSQL database for scalable data storage
- **AWS Cognito**: User authentication and management
- **IAM Security**: AWS Identity and Access Management for secure data access

## 📁 Project Structure

```
src/
├── components/
│   ├── AddTodo.jsx      # Task creation modal
│   ├── Auth.jsx         # Authentication component
│   └── TodoList.jsx     # Task display component
├── services/
│   ├── authService.js   # AWS Cognito authentication
│   └── dataService.js   # DynamoDB operations
├── lib/
│   └── aws.js           # AWS client configuration
├── App.jsx              # Main application component
├── main.jsx            # React entry point
└── index.css           # Global styles and Tailwind
```

## 🎯 Key Features Explained

### User Authentication & Data Persistence
- Secure email/password authentication via AWS Cognito
- Automatic user profile creation on signup
- Cross-device data synchronization
- IAM policies ensure users only access their own data

### Reminder System
- Browser notifications for task reminders
- Color-coded reminder badges (urgent, soon, later)
- Quick reminder presets for common intervals

### Multiple Lists
- Create unlimited custom lists
- Each list has its own color and icon
- Easy switching between lists

### Data Security
- All user data stored in AWS DynamoDB
- IAM policies and application-level security protect user privacy
- Encrypted connections and secure JWT authentication
- Real-time data sync across devices

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

**Doink** - Get things done beautifully! ✨
