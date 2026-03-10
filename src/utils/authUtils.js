import { jwtDecode } from 'jwt-decode';

export const decodeToken = (token) => {
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error('Token decoding failed:', error);
    return null;
  }
};

export const getUserData = (() => {
  let cachedData = null;

  const clearCache = () => {
    cachedData = null;
  };

  const getData = () => {
    if (cachedData) return cachedData;

    const token = sessionStorage.getItem('token');

    if (!token) {
      return {
        userId: 0,
        isAdmin: false
      };
    }

    const decodedToken = decodeToken(token);

    if (!decodedToken) {
      return {
        userId: 0,
        isAdmin: false
      };
    }

    cachedData = {
      userId: parseInt(decodedToken?.userId) || 0,
      isAdmin: decodedToken?.role === 'admin',
      fullName: decodedToken?.username || '',
      role: decodedToken?.role || ''
    };

    return cachedData;
  };

  getData.clearCache = clearCache;

  return getData;
})();
