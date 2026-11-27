import { getApiUrl } from "../config/index.js";
import { authHeader, tokenStorage } from "../storage/index.js";
const authService = {};

authService.auth = async (FormData) => {
  try {
    const resp = await fetch(getApiUrl() + "auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(FormData),
    });
     if (!resp.ok) {
      const errorData = await resp.json().catch(() => null);
      const error = new Error("Auth Error");
      error.response = {
        status: resp.status,
        data: errorData
      };
      throw error;
    }
    const data = await resp.json(); //se cuela solo la info necesaria

    if (data.access_token) await tokenStorage.set(data.access_token);
    return data;
  } catch (error) {
    throw error;
  }
};

authService.forgotPassword = async (email) => {
  try {
    const resp = await fetch(getApiUrl() + "auth/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
    if (!resp.ok) throw new Error("Error al enviar enlace de recuperación");
    return await resp.json();
  } catch (error) {
    throw error;
  }
};

authService.resetPassword = async (token, password) => {
  try {
    const resp = await fetch(getApiUrl() + "auth/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, password }),
    });
    if (!resp.ok) {
      const data = await resp.json().catch(() => null);
      throw new Error(data?.msg || "Error al actualizar contraseña");
    }
    return await resp.json();
  } catch (error) {
    throw error;
  }
};

authService.getMe = async () => {
  const resp = await fetch(getApiUrl() + "profile", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(await authHeader()),
    },
  });
  if (!resp.ok) {
    const error = new Error("Error auth");
    error.status = resp.status;
    throw error;
  }
  return await resp.json();
};

authService.logout = async () => {
  await tokenStorage.remove();
};

authService.updateProfile = async (payload) => {
  try {
    const resp = await fetch(getApiUrl() + "profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(await authHeader()),
      },
      body: JSON.stringify(payload),
    });
    if (!resp.ok) throw new Error("Error updating profile");
    const data = await resp.json();
    return data;
  } catch (error) {
    // silently fail — callers handle undefined return
  }
};

authService.deactivateAccount = async () => {
  try {
    const resp = await fetch(getApiUrl() + "profile", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(await authHeader()),
      },
    });
    if (!resp.ok) throw new Error("Error deactivating account");
    const data = await resp.json();
    return data;
  } catch (error) {
    // silently fail — callers handle undefined return
  }
};

// Borrado definitivo (página pública /eliminar-cuenta). Funciona sin sesión
// y también con cuentas desactivadas. Lanza un Error con el mensaje de la API.
authService.deleteAccount = async (email, password) => {
  const resp = await fetch(getApiUrl() + "account/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await resp.json().catch(() => null);
  if (!resp.ok) throw new Error(data?.msg || "No se pudo eliminar la cuenta");
  return data;
};

export default authService;
