import { getApiUrl } from "../config/index.js";
import { authHeader } from "../storage/index.js";

const getFavoritesByUser = async (userId) => {
  try {
    const resp = await fetch(getApiUrl() + `user/${userId}/favorites`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(await authHeader()),
      },
    });

    if (!resp.ok) throw new Error("Error getting favorites");

    const data = await resp.json();
    return data;
  } catch (error) {
    return [];
  }
};

const createFavorite = async (eventId) => {
  try {
    const resp = await fetch(getApiUrl() + "favorite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(await authHeader()),
      },
      body: JSON.stringify({ event_id: eventId }),
    });

    if (!resp.ok) {
      const errorBody = await resp.json().catch(() => null);
      throw new Error(errorBody?.message || "Error creating favorite");
    }

    return await resp.json();
  } catch (error) {
    return null;
  }
};

const deleteFavorite = async (favoriteId) => {
  try {
    const resp = await fetch(getApiUrl() + `favorite/${favoriteId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(await authHeader()),
      },
    });

    if (!resp.ok) {
      const errorBody = await resp.json().catch(() => null);
      throw new Error(errorBody?.message || "Error deleting favorite");
    }

    return await resp.json();
  } catch (error) {
    return null;
  }
};

export default { getFavoritesByUser, createFavorite, deleteFavorite };
