const CLOUDINARY_BASE_URL = 'https://api.cloudinary.com/v1_1/dlkky5xuo';
const UPLOAD_PRESET = 'promedid_preset';
const FOLDER = 'promedid';

export const uploadMedia = async (file: File): Promise<string> => {
    const isVideo = file.type.startsWith('video');
    const resourceType = isVideo ? 'video' : 'image';
    const uploadUrl = `${CLOUDINARY_BASE_URL}/${resourceType}/upload`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', FOLDER);

    try {
        const response = await fetch(uploadUrl, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            const errorMessage = errorData.error?.message || errorData.message || 'Error uploading to Cloudinary';
            throw new Error(errorMessage);
        }

        const data = await response.json();
        return data.secure_url;
    } catch (error: any) {
        console.error('Cloudinary upload error:', error);
        throw error;
    }
};

// Maintain compatibility if needed elsewhere
export const uploadImage = uploadMedia;
