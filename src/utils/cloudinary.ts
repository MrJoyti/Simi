const CLOUDINARY_CLOUD_NAME = 'rkk2ooyi';
const CLOUDINARY_UPLOAD_PRESET = 'Simisikder';
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

export interface CloudinaryUploadOptions {
  folder?: string;
  onProgress?: (progress: number) => void;
}

/**
 * Uploads an image file to Cloudinary using an unsigned upload preset
 * and XMLHttpRequest to support progress tracking.
 */
export async function uploadImageToCloudinary(
  file: File,
  folder?: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();

    formData.append('file', file);
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
        } catch (parseErr) {
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
      reject(new Error('Network error occurred while uploading image to Cloudinary'));
    };

    xhr.ontimeout = () => {
      reject(new Error('Cloudinary upload timed out'));
    };

    xhr.onabort = () => {
      reject(new Error('Cloudinary upload was aborted'));
    };

    xhr.open('POST', CLOUDINARY_UPLOAD_URL, true);
    xhr.send(formData);
  });
}
