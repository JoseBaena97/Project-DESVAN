import { getApiUrl } from "../config/index.js";
import { authHeader } from "../storage/index.js";

// Notificaciones del usuario con sesión iniciada.
// Las funciones lanzan un Error si la API responde con error.

const request = async (path, method = "GET") => {
  const resp = await fetch(getApiUrl() + path, {
    method,
    headers: await authHeader(),
  });
  if (!resp.ok) throw new Error("Error en notificaciones (" + resp.status + ")");
  return resp.json();
};

// Devuelve la lista de notificaciones (más recientes primero)
const getMyNotifications = async () => {
  const data = await request("notification/my");
  return data?.data ?? [];
};

const markAllAsRead = () => request("notification/read-all", "PATCH");

const deleteNotification = (id) => request(`notification/${id}`, "DELETE");

const deleteAllNotifications = () => request("notification/all", "DELETE");

export default {
  getMyNotifications,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
};
