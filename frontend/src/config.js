export const API_BASE = import.meta.env.VITE_API_URL || ''
export const assetUrl = (path) => (path ? `${API_BASE}${path}` : null)
