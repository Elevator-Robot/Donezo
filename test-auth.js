// Test authentication flow
console.log('Testing authentication system...');

// Simulate user data
const testUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123'
};

console.log('Test user:', testUser);

// Test localStorage structure
const users = JSON.parse(localStorage.getItem('donezo-users') || '[]');
console.log('Existing users:', users);

// Test the multi-user data isolation
if (users.length > 0) {
  const user = users[0];
  console.log('Testing data for user:', user.id);
  
  const userData = {
    todos: JSON.parse(localStorage.getItem(`donezo-user-${user.id}-todos`) || '[]'),
    lists: JSON.parse(localStorage.getItem(`donezo-user-${user.id}-lists`) || '[]'),
    settings: JSON.parse(localStorage.getItem(`donezo-user-${user.id}-settings`) || '{}'),
    theme: localStorage.getItem(`donezo-user-${user.id}-theme`) || 'light'
  };
  
  console.log('User data structure:', userData);
}

console.log('Authentication test completed.');