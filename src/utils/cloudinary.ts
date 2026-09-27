const CLOUDINARY_CLOUD_NAME = 'rkk2ooyi';
const CLOUDINARY_UPLOAD_PRESET = 'Simisikder';

export interface CloudinaryUploadOptions {
  folder?: string;
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
  onProgress?: (progress: number) => void;
}

/**
 * Uploads an image, video, or audio blob to Cloudinary using an unsigned upload preset.
 * Supports progress tracking and never stores Base64 blobs in Firestore!
 */
export async function uploadMediaToCloudinary(
  fileOrBlob: File | Blob,
  options: CloudinaryUploadOptions = {}
): Promise<string> {
  const { folder, resourceType = 'auto', onProgress } = options;
  const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();

    // If it's a raw blob (e.g. voice note audio/webm), supply a filename
    if (fileOrBlob instanceof File) {
      formData.append('file', fileOrBlob);
    } else {
      const mime = fileOrBlob.type || 'audio/webm';
      const ext = mime.includes('webm') ? 'webm' : mime.includes('ogg') ? 'ogg' : 'mp3';
      formData.append('file', fileOrBlob, `recording_${Date.now()}.${ext}`);
    }

    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    if (folder) {
      formData.append('folder', folder);
    }

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (e: ProgressEvent) => {
        if (e.lengthComputable && e.total > 0) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          if (response && response.secure_url) {
            resolve(response.secure_url);
          } else {
            reject(new Error(response?.error?.message || 'Malformed Cloudinary response: missing secure_url'));
          }
        } catch {
          reject(new Error('Failed to parse response from Cloudinary'));
        }
      } else {
        try {
          const errorResp = JSON.parse(xhr.responseText);
          reject(new Error(errorResp?.error?.message || `Cloudinary upload failed with status ${xhr.status}`));
        } catch {
          reject(new Error(`Cloudinary upload failed with status ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error occurred while uploading media to Cloudinary'));
    };

    xhr.ontimeout = () => {
      reject(new Error('Cloudinary upload timed out'));
    };

    xhr.onabort = () => {
      reject(new Error('Cloudinary upload was aborted'));
    };

    xhr.open('POST', uploadUrl, true);
    xhr.send(formData);
  });
}

/**
 * Backward-compatible helper for image uploads
 */
export async function uploadImageToCloudinary(
  file: File,
  folder?: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  return uploadMediaToCloudinary(file, { folder, resourceType: 'image', onProgress });
}
