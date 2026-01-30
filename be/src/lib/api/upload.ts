import { API_CONFIG } from './config';

// Upload service configuration - separate from main API
const UPLOAD_SERVICE_URL = process.env.NEXT_PUBLIC_UPLOAD_URL || 'http://localhost:8089';

export interface UploadFromUrlResponse {
    success: boolean;
    local_path?: string;    // Relative path: uploads/24/01/filename.jpg
    full_url?: string;      // Full URL with domain
    original_url?: string;  // Original URL that was downloaded
    filename?: string;      // Just the filename
    size?: number;          // File size in bytes
    message?: string;
    error?: string;
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
 *   // e.g., "uploads/24/01/image-abc123.jpg"
 * }
 */
export async function uploadImageFromUrl(imageUrl: string): Promise<UploadFromUrlResponse> {
    try {
        const response = await fetch(`${UPLOAD_SERVICE_URL}/api/upload/from-url`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image_url: imageUrl }),
        });

        const data = await response.json();
        return data;
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
 * @param ourDomain - Our domain (e.g., 'jobzestry.com')
 * @returns true if the URL is external
 */
export function isExternalUrl(url: string, ourDomain: string = 'jobzestry.com'): boolean {
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
