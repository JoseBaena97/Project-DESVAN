import { getApiUrl } from "../config/index.js";
import { authHeader } from "../storage/index.js";

const getAuthHeaders = async () => ({
  "Content-Type": "application/json",
  ...(await authHeader()),
});

const getPublicProfile = async (userId) => {
  try {
    const resp = await fetch(`${getApiUrl()}user/${userId}/public`, {
      method: "GET",
      headers: await getAuthHeaders(),
    });
    const data = await resp.json();
    if (!resp.ok) {
      throw new Error(data?.message || "Error al cargar el perfil");
    }
    return data?.data ?? null;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export default {
  getPublicProfile,
};
