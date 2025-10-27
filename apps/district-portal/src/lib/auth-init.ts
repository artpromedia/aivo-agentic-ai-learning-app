/**
 * Custom auth initialization for District Portal
 * Handles date conversion from localStorage properly
 */

export function initializeDistrictAuth() {
  try {
    const tokensStr = localStorage.getItem('aivo_auth_tokens');
    const userStr = localStorage.getItem('aivo_auth_user');
    
    if (!tokensStr || !userStr) {
      console.log('🔐 No stored auth data found');
      return null;
    }
    
    const tokens = JSON.parse(tokensStr);
    const userData = JSON.parse(userStr);
    
    // Convert date strings back to Date objects
    if (userData.createdAt && typeof userData.createdAt === 'string') {
      userData.createdAt = new Date(userData.createdAt);
    }
    if (userData.lastLogin && typeof userData.lastLogin === 'string') {
      userData.lastLogin = new Date(userData.lastLogin);
    }
    
    console.log('✅ Auth initialized:', {
      email: userData.email,
      role: userData.role,
      hasToken: !!tokens.accessToken
    });
    
    return { tokens, user: userData };
  } catch (error) {
    console.error('❌ Failed to initialize auth:', error);
    return null;
  }
}
