import sparePartsImg from '../assets/images/spare_parts.png'
import perfumesImg from '../assets/images/perfumes.jpg'
import oilsImg from '../assets/images/oils.jpg'
import api from '../services/api'

export const CATEGORY_IMAGES = {
  'Fashion': { uri: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=200&q=80' },
  'Mobiles': { uri: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&q=80' },
  'Furniture': { uri: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&q=80' },
  'Cosmetics': { uri: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200&q=80' },
  'Grocery': { uri: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80' },
  'Electronics': { uri: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200&q=80' },
  'Medicines': { uri: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&q=80' },
  'Home & Kitchen': { uri: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&q=80' },
  'Home Decor': { uri: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80' },
  'Spare Parts': sparePartsImg,
  'Perfumes': perfumesImg,
  'Service Portal': { uri: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=200&q=80' },
  'Real Estate': { uri: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200&q=80' },
  'Building Materials': { uri: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=200&q=80' },
  'Machinery': { uri: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&q=80' },
  'Oils': oilsImg,
  'Job Portal': { uri: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=200&q=80' },
  'Industrial': { uri: 'https://images.unsplash.com/photo-1581092160562-40aa08e49be4?w=400&q=80' },
  'Logistics': { uri: 'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=700&q=80' },
  'Raw Materials': { uri: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=200&q=80' },
  'Textiles': { uri: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=200&q=80' }
}

const DEFAULT_FALLBACK = { uri: 'https://via.placeholder.com/150' }

export function getCategoryImage(categoryName, apiImage) {
  if (apiImage && typeof apiImage === 'string' && apiImage.startsWith('http')) {
    let formattedUrl = apiImage;
    try {
      const apiBaseURL = api.defaults.baseURL;
      if (apiBaseURL) {
        const matches = apiBaseURL.match(/^(https?):\/\/([^/]+)/);
        if (matches && matches[1] && matches[2]) {
          const activeProtocol = matches[1];
          const activeHost = matches[2];
          const localIpRegex = /^(https?):\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?/;
          if (localIpRegex.test(apiImage)) {
            formattedUrl = apiImage.replace(localIpRegex, `${activeProtocol}://${activeHost}`);
          }
        }
      }
    } catch (e) {
      console.log('Error parsing host for category local fallback:', e);
    }
    return { uri: formattedUrl }
  }
  
  if (!categoryName) return DEFAULT_FALLBACK

  const normalized = categoryName.trim()
  
  // Try exact match first
  if (CATEGORY_IMAGES[normalized]) {
    return CATEGORY_IMAGES[normalized]
  }

  // Try matching without newlines or extra spaces (e.g. Home & Kitchen vs Home &\nKitchen)
  const singleLineName = normalized.replace(/\s+/g, ' ')
  if (CATEGORY_IMAGES[singleLineName]) {
    return CATEGORY_IMAGES[singleLineName]
  }

  // Fuzzy case-insensitive match
  const lowerName = singleLineName.toLowerCase()
  for (const key of Object.keys(CATEGORY_IMAGES)) {
    if (key.toLowerCase() === lowerName) {
      return CATEGORY_IMAGES[key]
    }
  }

  // Handle local image file path string if sent from API
  if (typeof apiImage === 'string') {
    if (apiImage.includes('spare_parts')) return sparePartsImg
    if (apiImage.includes('perfumes')) return perfumesImg
    if (apiImage.includes('oils')) return oilsImg
  }

  return DEFAULT_FALLBACK
}
