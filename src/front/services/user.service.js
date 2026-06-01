const url = import.meta.env.VITE_BACKEND_URL;

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: "Bearer " + localStorage.getItem("token"),
});

const getPublicProfile = async (userId) => {
  try {
    const resp = await fetch(`${url}api/user/${userId}/public`, {
      method: "GET",
      headers: getAuthHeaders(),
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
