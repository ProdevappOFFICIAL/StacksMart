// Run this in your browser console to clear corrupted Stacks session data
// Or just refresh the page after the code update

if (typeof window !== 'undefined') {
  console.log('Clearing Stacks session data...');
  
  // Clear all possible Stacks-related localStorage keys
  const keysToRemove = [
    'stacks-session',
    'blockstack-session',
    'blockstack-gaia-hub-config',
    'stacks-wallet-config'
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`Removed: ${key}`);
  });

  // Also clear any keys that start with 'stacks' or 'blockstack'
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('stacks') || key.startsWith('blockstack')) {
      localStorage.removeItem(key);
      console.log(`Removed: ${key}`);
    }
  });
  
  console.log('Session data cleared! Please refresh the page.');
}