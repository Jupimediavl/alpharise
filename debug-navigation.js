// Temporary debug script to check user context
console.log('🔍 Testing navigation debug in browser console');

// Check if we can access user data
if (typeof window !== 'undefined') {
  // Check localStorage for user data
  const storedUser = localStorage.getItem('alpharise_user');
  console.log('📦 Stored user data:', storedUser);
  
  if (storedUser) {
    const userData = JSON.parse(storedUser);
    console.log('👤 Parsed user:', userData);
  }
  
  // Check current URL params
  const urlParams = new URLSearchParams(window.location.search);
  const username = urlParams.get('username');
  console.log('🌐 Current URL username param:', username);
  
  // Test navigation URL building
  const testUser = { username: 'jupi' };
  const testUrl = `/dashboard?username=${testUser.username}`;
  console.log('🎯 Test navigation URL:', testUrl);
}