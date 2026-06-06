import api from '../services/api';

export function getProductImageUrl(url) {
  if (!url) return 'https://via.placeholder.com/150';
  
  let formattedUrl = url;
  
  // If it's a relative path, prepend the active API protocol and host
  if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
    try {
      const apiBaseURL = api.defaults.baseURL;
      if (apiBaseURL) {
        const matches = apiBaseURL.match(/^(https?):\/\/([^/]+)/);
        if (matches && matches[0]) {
          const rootUrl = matches[0];
          const cleanPath = formattedUrl.startsWith('/') ? formattedUrl : `/${formattedUrl}`;
          formattedUrl = `${rootUrl}${cleanPath}`;
        }
      }
    } catch (e) {
      console.log('Error prepending base URL for product image:', e);
    }
  }
  
  // Replace localhost/127.0.0.1 or any local network IP (192.168.x.x, 10.x.x.x, 172.16-31.x.x) with the active API server host and protocol
  try {
    const apiBaseURL = api.defaults.baseURL;
    if (apiBaseURL) {
      const matches = apiBaseURL.match(/^(https?):\/\/([^/]+)/);
      if (matches && matches[1] && matches[2]) {
        const activeProtocol = matches[1];
        const activeHost = matches[2];
        
        // Match localhost, 127.0.0.1, or local IP ranges with optional port
        const localIpRegex = /^(https?):\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?/;
        if (localIpRegex.test(formattedUrl)) {
          formattedUrl = formattedUrl.replace(localIpRegex, `${activeProtocol}://${activeHost}`);
        }
      }
    }
  } catch (e) {
    console.log('Error parsing host for product IP redirection:', e);
  }

  // If it's a local mock unsplash url, return it directly
  if (formattedUrl.startsWith('https://images.unsplash.com')) {
    return formattedUrl;
  }
  
  // If the url was stored with the local path missing 'products/', fix it:
  if (formattedUrl.includes('/uploads/product_') && !formattedUrl.includes('/uploads/products/')) {
    return formattedUrl.replace('/uploads/product_', '/uploads/products/product_');
  }
  
  return formattedUrl;
}

export function getSellerImageUrl(url) {
  if (!url) return 'https://via.placeholder.com/150';
  
  let formattedUrl = url;
  
  // If it's a relative path, prepend the active API protocol and host
  if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
    try {
      const apiBaseURL = api.defaults.baseURL;
      if (apiBaseURL) {
        const matches = apiBaseURL.match(/^(https?):\/\/([^/]+)/);
        if (matches && matches[0]) {
          const rootUrl = matches[0];
          const cleanPath = formattedUrl.startsWith('/') ? formattedUrl : `/${formattedUrl}`;
          formattedUrl = `${rootUrl}${cleanPath}`;
        }
      }
    } catch (e) {
      console.log('Error prepending base URL for seller image:', e);
    }
  }
  
  // Replace localhost/127.0.0.1 or any local network IP (192.168.x.x, 10.x.x.x, 172.16-31.x.x) with the active API server host and protocol
  try {
    const apiBaseURL = api.defaults.baseURL;
    if (apiBaseURL) {
      const matches = apiBaseURL.match(/^(https?):\/\/([^/]+)/);
      if (matches && matches[1] && matches[2]) {
        const activeProtocol = matches[1];
        const activeHost = matches[2];
        
        // Match localhost, 127.0.0.1, or local IP ranges with optional port
        const localIpRegex = /^(https?):\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?/;
        if (localIpRegex.test(formattedUrl)) {
          formattedUrl = formattedUrl.replace(localIpRegex, `${activeProtocol}://${activeHost}`);
        }
      }
    }
  } catch (e) {
    console.log('Error parsing host for seller IP redirection:', e);
  }

  if (formattedUrl.startsWith('https://images.unsplash.com')) return formattedUrl;
  
  // If the url was stored with the local path missing 'sellers/', fix it:
  if (formattedUrl.includes('/uploads/seller_') && !formattedUrl.includes('/uploads/sellers/')) {
    return formattedUrl.replace('/uploads/seller_', '/uploads/sellers/seller_');
  }
  
  return formattedUrl;
}

export function getUserAvatarUrl(url) {
  if (!url) return null;
  
  let formattedUrl = url;
  
  // If it's a relative path, prepend the active API protocol and host
  if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
    try {
      const apiBaseURL = api.defaults.baseURL;
      if (apiBaseURL) {
        const matches = apiBaseURL.match(/^(https?):\/\/([^/]+)/);
        if (matches && matches[0]) {
          const rootUrl = matches[0];
          const cleanPath = formattedUrl.startsWith('/') ? formattedUrl : `/${formattedUrl}`;
          formattedUrl = `${rootUrl}${cleanPath}`;
        }
      }
    } catch (e) {
      console.log('Error prepending base URL for user avatar:', e);
    }
  }
  
  // Replace localhost/127.0.0.1 or any local network IP with active API server host and protocol
  try {
    const apiBaseURL = api.defaults.baseURL;
    if (apiBaseURL) {
      const matches = apiBaseURL.match(/^(https?):\/\/([^/]+)/);
      if (matches && matches[1] && matches[2]) {
        const activeProtocol = matches[1];
        const activeHost = matches[2];
        
        const localIpRegex = /^(https?):\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?/;
        if (localIpRegex.test(formattedUrl)) {
          formattedUrl = formattedUrl.replace(localIpRegex, `${activeProtocol}://${activeHost}`);
        }
      }
    }
  } catch (e) {
    console.log('Error parsing host for avatar IP redirection:', e);
  }

  if (formattedUrl.startsWith('https://images.unsplash.com')) return formattedUrl;
  
  return formattedUrl;
}

