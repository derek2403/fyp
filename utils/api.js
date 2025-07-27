// Utility functions for API calls

export const apiCall = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// User API functions
export const userAPI = {
  getByAddress: (address) => apiCall(`/api/users?address=${address}`),
  getById: (id) => apiCall(`/api/users?id=${id}`),
  create: (userData) => apiCall('/api/users', { method: 'POST', body: JSON.stringify(userData) }),
  update: (id, userData) => apiCall(`/api/users?id=${id}`, { method: 'PUT', body: JSON.stringify(userData) }),
  delete: (id) => apiCall(`/api/users?id=${id}`, { method: 'DELETE' }),
};

// Merchant API functions
export const merchantAPI = {
  getByAddress: (address) => apiCall(`/api/merchants?address=${address}`),
  getById: (id) => apiCall(`/api/merchants?id=${id}`),
  getAll: () => apiCall('/api/merchants'),
  create: (merchantData) => apiCall('/api/merchants', { method: 'POST', body: JSON.stringify(merchantData) }),
  update: (id, merchantData) => apiCall(`/api/merchants?id=${id}`, { method: 'PUT', body: JSON.stringify(merchantData) }),
  delete: (id) => apiCall(`/api/merchants?id=${id}`, { method: 'DELETE' }),
};

// Menu API functions
export const menuAPI = {
  getByMerchant: (merchantId) => apiCall(`/api/menu?merchantId=${merchantId}`),
  getById: (id) => apiCall(`/api/menu?id=${id}`),
  getAll: () => apiCall('/api/menu'),
  create: (menuItem) => apiCall('/api/menu', { method: 'POST', body: JSON.stringify(menuItem) }),
  update: (id, menuItem) => apiCall(`/api/menu?id=${id}`, { method: 'PUT', body: JSON.stringify(menuItem) }),
  delete: (id) => apiCall(`/api/menu?id=${id}`, { method: 'DELETE' }),
};

// Review API functions
export const reviewAPI = {
  getByUser: (userId) => apiCall(`/api/reviews?userId=${userId}`),
  getByMerchant: (merchantId) => apiCall(`/api/reviews?merchantId=${merchantId}`),
  getById: (id) => apiCall(`/api/reviews?id=${id}`),
  getAll: () => apiCall('/api/reviews'),
  create: (review) => apiCall('/api/reviews', { method: 'POST', body: JSON.stringify(review) }),
  update: (id, review) => apiCall(`/api/reviews?id=${id}`, { method: 'PUT', body: JSON.stringify(review) }),
  delete: (id) => apiCall(`/api/reviews?id=${id}`, { method: 'DELETE' }),
};

// Restaurant API functions
export const restaurantAPI = {
  getAll: () => apiCall('/api/restaurants'),
  getById: (id) => apiCall(`/api/restaurants?id=${id}`),
  getByCuisine: (cuisine) => apiCall(`/api/restaurants?cuisine=${cuisine}`),
  getByPriceRange: (priceRange) => apiCall(`/api/restaurants?priceRange=${priceRange}`),
  create: (restaurant) => apiCall('/api/restaurants', { method: 'POST', body: JSON.stringify(restaurant) }),
  update: (id, restaurant) => apiCall(`/api/restaurants?id=${id}`, { method: 'PUT', body: JSON.stringify(restaurant) }),
  delete: (id) => apiCall(`/api/restaurants?id=${id}`, { method: 'DELETE' }),
};