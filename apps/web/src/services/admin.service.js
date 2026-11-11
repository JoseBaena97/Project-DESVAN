const adminService = {};
const url = import.meta.env.VITE_BACKEND_URL;

const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: "Bearer " + localStorage.getItem("token"),
});

adminService.getStats = async () => {
    const resp = await fetch(url + "api/admin/stats", { headers: authHeaders() });
    if (!resp.ok) throw new Error("Error fetching stats");
    return await resp.json();
};

adminService.getUsers = async () => {
    const resp = await fetch(url + "api/admin/users", { headers: authHeaders() });
    if (!resp.ok) throw new Error("Error fetching users");
    return await resp.json();
};

adminService.suspendUser = async (userId) => {
    const resp = await fetch(url + `api/admin/users/${userId}/suspend`, {
        method: "PUT",
        headers: authHeaders(),
    });
    if (!resp.ok) throw new Error("Error suspending user");
    return await resp.json();
};

adminService.restoreUser = async (userId) => {
    const resp = await fetch(url + `api/admin/users/${userId}/restore`, {
        method: "PUT",
        headers: authHeaders(),
    });
    if (!resp.ok) throw new Error("Error restoring user");
    return await resp.json();
};

adminService.getEvents = async () => {
    const resp = await fetch(url + "api/admin/events", { headers: authHeaders() });
    if (!resp.ok) throw new Error("Error fetching events");
    return await resp.json();
};

adminService.cancelEvent = async (eventId) => {
    const resp = await fetch(url + `api/admin/events/${eventId}/cancel`, {
        method: "PUT",
        headers: authHeaders(),
    });
    if (!resp.ok) throw new Error("Error cancelling event");
    return await resp.json();
};

adminService.deleteEvent = async (eventId) => {
    const resp = await fetch(url + `api/admin/events/${eventId}`, {
        method: "DELETE",
        headers: authHeaders(),
    });
    if (!resp.ok) throw new Error("Error deleting event");
    return await resp.json();
};

adminService.getReviews = async () => {
    const resp = await fetch(url + "api/admin/reviews", { headers: authHeaders() });
    if (!resp.ok) throw new Error("Error fetching reviews");
    return await resp.json();
};

adminService.deleteReview = async (reviewId) => {
    const resp = await fetch(url + `api/admin/reviews/${reviewId}`, {
        method: "DELETE",
        headers: authHeaders(),
    });
    if (!resp.ok) throw new Error("Error deleting review");
    return await resp.json();
};

adminService.getReports = async () => {
    const resp = await fetch(url + "api/admin/reports", { headers: authHeaders() });
    if (!resp.ok) throw new Error("Error fetching reports");
    return await resp.json();
};

adminService.resolveReport = async (reportId) => {
    const resp = await fetch(url + `api/admin/reports/${reportId}/resolve`, {
        method: "PUT",
        headers: authHeaders(),
    });
    if (!resp.ok) throw new Error("Error resolving report");
    return await resp.json();
};

adminService.deleteReport = async (reportId) => {
    const resp = await fetch(url + `api/admin/reports/${reportId}`, {
        method: "DELETE",
        headers: authHeaders(),
    });
    if (!resp.ok) throw new Error("Error deleting report");
    return await resp.json();
};

adminService.reportUser = async (reportedId, reason, message) => {
    const resp = await fetch(url + "api/report", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ reported_id: reportedId, reason, message }),
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data?.msg || "Error al enviar el reporte");
    return data;
};

export default adminService;
