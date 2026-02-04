import { API_CONFIG, UPLOAD_CONFIG } from './config';

// Upload service configuration - separate from main API
const UPLOAD_SERVICE_URL = UPLOAD_CONFIG.UPLOAD_URL;

export interface UploadFromUrlResponse {
    success: boolean;
    local_path?: string;    // Relative path: /uploads/filename.jpg
    full_url?: string;      // Full URL with domain: https://jobzesty.com/uploads/filename.jpg
    original_url?: string;  // Original URL that was downloaded
    filename?: string;      // Just the filename
    size?: number;          // File size in bytes
    message?: string;
    error?: string;
}

/**
 * Upload file directly to Go backend
 * 
 * @param file - File object from input
 * @returns Promise with upload response containing local_path
 */
export async function uploadFile(file: File): Promise<UploadFromUrlResponse> {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${UPLOAD_SERVICE_URL}/api/upload/file`, {
            method: 'POST',
            body: formData,
        });

        if (response.status === 404) {
            throw new Error(`Upload endpoint not found (404). Please ensure the upload-service is running.`);
        }

        if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Map Go response to TypeScript interface
        // Go returns: { url: "https://...", file_path: "/uploads/..." }
        return {
            success: true,
            local_path: data.file_path || data.FilePath,  // Support both formats
            full_url: data.url || data.URL,
            filename: file.name,
            size: file.size,
        };
    } catch (error) {
        console.error('Error uploading file:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
        };
    }
}

/**
 * Read file as Data URL for preview
 * 
 * @param file - File object from input
 * @returns Promise with data URL string
 */
export async function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            resolve(result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * Download an image from an external URL and save it to the server
 * Returns the local path that should be saved to the database
 * 
 * @param imageUrl - The external image URL to download (e.g., https://hoangphucphoto.com/...)
 * @returns Promise with the upload response containing local_path
 * 
 * Usage example:
 * const result = await uploadImageFromUrl('https://hoangphucphoto.com/image.jpg');
 * if (result.success) {
 *   // Save result.local_path to thumbnail_url in database
 *   // e.g., "/uploads/image-abc123.jpg"
 * }
 */
export async function uploadImageFromUrl(imageUrl: string): Promise<UploadFromUrlResponse> {
    try {
        const response = await fetch(`${UPLOAD_SERVICE_URL}/api/upload/from-url`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // FIX: Change from "image_url" to "url" to match Go backend
            body: JSON.stringify({ url: imageUrl }),
        });

        if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Map Go response to TypeScript interface
        // Go returns: { url: "https://...", file_path: "/uploads/..." }
        return {
            success: true,
            local_path: data.file_path || data.FilePath,
            full_url: data.url || data.URL,
            original_url: imageUrl,
        };
    } catch (error) {
        console.error('Error uploading image from URL:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
        };
    }
}

/**
 * Check if a URL is an external URL (not from our domain)
 * 
 * @param url - URL to check
 * @param ourDomain - Our domain (e.g., 'jobzesty.com')
 * @returns true if the URL is external
 */
export function isExternalUrl(url: string, ourDomain: string = 'jobzesty.com'): boolean {
    if (!url) return false;

    // If it starts with http/https and doesn't contain our domain
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return !url.includes(ourDomain);
    }

    // If it's a relative path (like "uploads/..." or "images/..."), it's not external
    return false;
}

/**
 * Process thumbnail URL - if it's external, download and convert to local path
 * 
 * @param thumbnailUrl - The thumbnail URL to process
 * @returns The local path if download was successful, or the original URL if not external
 */
export async function processThumbnailUrl(thumbnailUrl: string): Promise<string> {
    if (!thumbnailUrl) return '';

    // Check if it's an external URL
    if (isExternalUrl(thumbnailUrl)) {
        const result = await uploadImageFromUrl(thumbnailUrl);
        if (result.success && result.local_path) {
            return result.local_path;
        }
        // If download failed, return original URL
        console.warn('Failed to download external image, using original URL:', result.error);
        return thumbnailUrl;
    }

    // If not external, return as-is
    return thumbnailUrl;
}

/**
 * Get the display URL for a thumbnail
 * This handles backward compatibility:
 * - New uploads: /uploads/filename.jpg → https://jobzesty.com/uploads/filename.jpg
 * - Old images: image.jpg → /images/image.jpg (served from public folder)
 * - External URLs: https://example.com/image.jpg → https://example.com/image.jpg
 * 
 * @param thumbnailUrl - The thumbnail_url stored in database
 * @returns The full URL to display the image
 */
export function getThumbnailDisplayUrl(thumbnailUrl: string): string {
    if (!thumbnailUrl) return '';
    
    // Already a full URL (external or our domain)
    if (thumbnailUrl.startsWith('http://') || thumbnailUrl.startsWith('https://')) {
        return thumbnailUrl;
    }
    
    // New server uploads (starts with /uploads/ or uploads/)
    if (thumbnailUrl.startsWith('/uploads/') || thumbnailUrl.startsWith('uploads/')) {
        const cleanPath = thumbnailUrl.startsWith('/') ? thumbnailUrl.substring(1) : thumbnailUrl;
        return `https://upload.jobzesty.com/${cleanPath}`;
    }
    
    // Old images in public/images folder
    // e.g., "image.jpg" → "/images/image.jpg"
    return `/images/${thumbnailUrl}`;
}