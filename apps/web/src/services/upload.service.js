import { authHeader } from "@desvan/shared/storage";
const url = import.meta.env.VITE_BACKEND_URL;

const uploadImage = async (file, folder) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    if (folder) {
      formData.append("folder", folder);
    }

    const resp = await fetch(url + "api/upload", {
      method: "POST",
      headers: {
        ...(await authHeader()),
      },
      body: formData,
    });

    const data = await resp.json();
    if (!resp.ok || !data?.success) {
      throw new Error(data?.msg || "Error uploading image");
    }

    return data.data;
  } catch (error) {
    throw error;
  }
};

export default {
  uploadImage,
};
