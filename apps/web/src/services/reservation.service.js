const url = import.meta.env.VITE_BACKEND_URL;

const getReservationsByUser = async (userId) => {
  if (!userId) throw new Error("userId is required");
  try {
    const resp = await fetch(url + `api/user/${userId}/reservations`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => null);
      throw new Error(err?.message || "Error fetching reservations");
    }

    return await resp.json();
  } catch (error) {
    return null;
  }
};

const createReservation = async (eventId, userId) => {
  if (!userId) throw new Error("userId is required");
  try {
    const resp = await fetch(url + "api/reservation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({ event_id: eventId, user_id: userId }),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => null);
      throw new Error(err?.message || "Error creating reservation");
    }

    return await resp.json();
  } catch (error) {
    return null;
  }
};

const deleteReservation = async (reservationId) => {
  try {
    const resp = await fetch(url + `api/reservation/${reservationId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => null);
      throw new Error(err?.message || "Error deleting reservation");
    }

    return await resp.json();
  } catch (error) {
    return null;
  }
};

const cancelReservation = async (reservationId) => {
  try {
    const resp = await fetch(url + `api/reservation/${reservationId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({ status: "cancelled" }),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => null);
      throw new Error(err?.message || "Error cancelling reservation");
    }

    return await resp.json();
  } catch (error) {
    return null;
  }
};

export default { getReservationsByUser, createReservation, deleteReservation, cancelReservation };
