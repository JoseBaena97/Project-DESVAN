const url = import.meta.env.VITE_BACKEND_URL;

const getFavoritesByUser = async (userId) => {
  try {
    const resp = await fetch(url + `api/user/${userId}/favorites`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
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
    const resp = await fetch(url + "api/favorite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
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
    const resp = await fetch(url + `api/favorite/${favoriteId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
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
