

const CLOUD_NAME = "dbezoksfw";
const UPLOAD_PRESET = "BinIQstore"; // your existing unsigned preset

/**
 * Uploads a single image to Cloudinary and returns the secure public URL.
 *
 * @param {object} image - { uri, fileName, type } from react-native-image-picker
 * @param {string} folder - optional Cloudinary folder name e.g. "products"
 * @returns {Promise<string>} - the secure_url string stored in MongoDB
 */
export const uploadImageToCloudinary = async (image, folder = "products") => {
  if (!image || !image.uri) throw new Error("No image provided");

  const formData = new FormData();
  formData.append("file", {
    uri: image.uri,
    name: image.fileName || `upload_${Date.now()}.jpg`,
    type: image.type || "image/jpeg",
  });
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
      // Do NOT set Content-Type — fetch sets multipart boundary automatically
    }
  );

  const data = await response.json();

  if (!response.ok || data.error) {
    console.error("Cloudinary upload error:", data.error);
    throw new Error(data.error?.message || "Image upload failed");
  }

  console.log("Cloudinary upload success:", data.secure_url);
  return data.secure_url; // ✅ permanent public URL — safe to store in MongoDB
};

/**
 * Uploads multiple images in parallel.
 *
 * @param {object[]} images - array of { uri, fileName, type }
 * @param {string} folder
 * @returns {Promise<string[]>} - array of secure_url strings
 */
export const uploadMultipleImages = async (images, folder = "products") => {
  const uploads = images.map((img) => uploadImageToCloudinary(img, folder));
  return Promise.all(uploads);
};