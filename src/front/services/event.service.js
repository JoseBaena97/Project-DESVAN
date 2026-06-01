const url = import.meta.env.VITE_BACKEND_URL;

const createEvent = async (eventData) => {
  try {
    const resp = await fetch(url + "api/event", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify(eventData),
    });

    if (!resp.ok) throw new Error("Error creating event");

    const data = await resp.json();

    return data;
  } catch (error) {
    // silently fail — callers handle undefined return
  }
};

// obtener todos los eventos
const getEventsPublic = async () => {
  try {
    const resp = await fetch(url + "api/event/public", {
      method: "GET",
    });

    if (!resp.ok) throw new Error("Error getting events");

    const data = await resp.json();

    return data;
  } catch (error) {
    // silently fail — callers handle undefined return
  }
};
const getEvents = async () => {
  try {
    const resp = await fetch(url + "api/event/private", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });

    if (!resp.ok) throw new Error("Error getting events");

    const data = await resp.json();

    return data;
  } catch (error) {
    // silently fail — callers handle undefined return
  }
};

//obtener un evento
const getEvent = async (eventId) => {
  try {
    const resp = await fetch(url + "api/event/" + eventId, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });

    if (resp.status === 401 || resp.status === 422) {
      throw new Error("UNAUTHORIZED");
    }

    if (!resp.ok) throw new Error("Error getting event");

    const data = await resp.json();

    return data;
  } catch (error) {
    // silently fail — callers handle undefined return
  }
};

//actualizar un evento
const updateEvent = async (eventId, eventData) => {
  try {
    const resp = await fetch(url + "api/event/" + eventId, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify(eventData),
    });

    const data = await resp.json();

    if (!resp.ok) {
      throw new Error(data?.data || data?.msg || "Error updating event");
    }

    return data;
  } catch (error) {
    // silently fail — callers handle undefined return
  }
};

// reactivar un evento (wrapper sobre updateEvent)
const reactivateEvent = async (eventId) => {
  return updateEvent(eventId, { status: 'active' });
};

//eliminar un evento
const deleteEvent = async (eventId) => {
  try {
    const resp = await fetch(url + "api/event/" + eventId, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });

    if (!resp.ok) throw new Error("Error deleting event");

    const data = await resp.json();

    return data;
  } catch (error) {
    return false;
  }
};

// obtener eventos cercanos a una ubicación
const getNearbyEvents = async (latitude, longitude, distance = 10) => {
  try {
    const params = new URLSearchParams({
      latitude,
      longitude,
      distance,
    });

    const resp = await fetch(url + "api/event/nearby?" + params.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });

    if (!resp.ok) throw new Error("Error getting nearby events");

    const data = await resp.json();

    return data;
  } catch (error) {
    // silently fail — callers handle undefined return
  }
};

const getCategories = async () => {
  try {
    const resp = await fetch(url + "api/category");
    if (!resp.ok) throw new Error("Error getting categories");
    const data = await resp.json();
    return data;
  } catch (error) {
    // silently fail — callers handle undefined return
  }
};

const getTags = async () => {
  try {
    const resp = await fetch(url + "api/tag");
    if (!resp.ok) throw new Error("Error getting tags");
    const data = await resp.json();
    return data;
  } catch (error) {
    // silently fail — callers handle undefined return
  }
};

export default {
  createEvent,
  getEvents,
  getEventsPublic,
  getEvent,
  updateEvent,
  reactivateEvent,
  deleteEvent,
  getNearbyEvents,
  getCategories,
  getTags,
};