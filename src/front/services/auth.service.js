const authService = {};
const url = import.meta.env.VITE_BACKEND_URL;

authService.auth = async (FormData) => {
  try {
    const resp = await fetch(url + "api/auth", {
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

    if (data.access_token) localStorage.setItem("token", data.access_token);
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

authService.forgotPassword = async (email) => {
  try {
    const resp = await fetch(url + "api/auth/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
    if (!resp.ok) throw new Error("Error al enviar enlace de recuperación");
    return await resp.json();
  } catch (error) {
    console.log(error);
    throw error;
  }
};

authService.resetPassword = async (token, password) => {
  try {
    const resp = await fetch(url + "api/auth/reset-password", {
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
    console.log(error);
    throw error;
  }
};

authService.getMe = async () => {
  try {
    const resp = await fetch(url + "api/profile", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"), //si tiene la ruta de @jwt_required() se envía la autorización con el bearer token. Cuidado es "Bearer " con espacio porque si no lee el token junto con Bearer.
      },
    });
    if (!resp.ok) throw new Error("Error auth");
    const data = await resp.json(); //se cuela solo la info necesaria
    return data;
  } catch (error) {
    console.log(error);
  }
};

authService.logout = () => {
  localStorage.removeItem("token");
};

authService.updateProfile = async (payload) => {
  try {
    const resp = await fetch(url + "api/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify(payload),
    });
    if (!resp.ok) throw new Error("Error updating profile");
    const data = await resp.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

authService.deactivateAccount = async () => {
  try {
    const resp = await fetch(url + "api/profile", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
    if (!resp.ok) throw new Error("Error deactivating account");
    const data = await resp.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

export default authService;
