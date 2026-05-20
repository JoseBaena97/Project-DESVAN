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
    if (!resp.ok) throw new Error("Error auth");
    const data = await resp.json(); //se cuela solo la info necesaria
    
    if (data.access_token) localStorage.setItem("token", data.access_token);
    return data;
  } catch (error) {
    console.log(error);
  }
};


authService.getMe = async () => {
  try {
    const resp = await fetch(url + "api/profile", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization":"Bearer " + localStorage.getItem('token') //si tiene la ruta de @jwt_required() se envía la autorización con el bearer token. Cuidado es "Bearer " con espacio porque si no lee el token junto con Bearer.
      },
      
    });
    if (!resp.ok) throw new Error("Error auth");
    const data = await resp.json(); //se cuela solo la info necesaria
    console.log(data)
    return data;
  } catch (error) {
    console.log(error);
  }
};

authService.logout = () => {
    localStorage.removeItem('token')
}

export default authService;