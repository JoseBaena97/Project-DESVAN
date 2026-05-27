import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AccountPageHeader } from "../../components/account/AccountPageHeader";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import eventService from "../../services/event.service";
import authService from "../../services/auth.service";
import mascotamyev from "../../assets/img/caja02.png";

const TABS = ["TODOS", "ACTIVOS", "FINALIZADOS"];

const ACTION_ICONS = {
	edit: "fa-solid fa-pen",
	duplicate: "fa-regular fa-copy",
	delete: "fa-solid fa-trash",
};

const STATUS_MAP = {
	active: "ACTIVO",
	finished: "FINALIZADO",
};

const STATUS_VARIANT_MAP = {
	active: "activo",
	finished: "finalizado",
};

export const MyEvents = () => {
	const [activeTab, setActiveTab] = useState("TODOS");
	const [userEvents, setUserEvents] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [eventToDelete, setEventToDelete] = useState(null);
	const { store } = useGlobalReducer();
	const navigate = useNavigate();

	useEffect(() => {
		const fetchUserEvents = async () => {
			try {
				setLoading(true);
				let currentUser = store.user;

				// Si no hay usuario en store pero sí hay token, obtener los datos del usuario
				if (!currentUser && localStorage.getItem("token")) {
					const userData = await authService.getMe();
					currentUser = userData;
				}

				if (!currentUser) {
					setError("Usuario no autenticado");
					return;
				}

				// Obtener eventos de la API
				const response = await eventService.getEvents();

				if (!response || !response.data || !Array.isArray(response.data)) {
					setError("No se pudieron cargar los eventos");
					setUserEvents([]);
					return;
				}

				const allEvents = response.data;

				// Filtrar solo los eventos creados por el usuario logueado
				const filtered = allEvents.filter(
					(event) => event.seller && event.seller.id === currentUser.id
				);
				setUserEvents(filtered);
				setError(null);
			} catch (err) {
				console.error("Error fetching user events:", err);
				setError("Error al cargar tus eventos");
				setUserEvents([]);
			} finally {
				setLoading(false);
			}
		};

		fetchUserEvents();
	}, [store.user]);

	// Función para filtrar eventos por tab
	const getFilteredEvents = () => {
		if (activeTab === "TODOS") return userEvents;

		return userEvents.filter((event) => {
			const eventStatus = STATUS_MAP[event.status];
			if (activeTab === "ACTIVOS") return eventStatus === "ACTIVO";
			if (activeTab === "FINALIZADOS") return eventStatus === "FINALIZADO";
			return false;
		});
	};

	const filteredEvents = getFilteredEvents();

	// Función auxiliar para formatear la fecha
	const formatDate = (dateString) => {
		if (!dateString) return "Por definir";
		const date = new Date(dateString);
		return date.toLocaleDateString("es-ES", {
			day: "2-digit",
			month: "short",
			year: "numeric",
		});
	};

	const getAvailableCapacity = (event) => {
		if (event.max_capacity == null) return null;
		const confirmedReservations = (event.reservations || []).filter(
			(reservation) => reservation.status === "confirmed"
		).length;
		return Math.max(event.max_capacity - confirmedReservations, 0);
	};

	// Editar: navegar a formulario de creación con query param eventId
	const handleEdit = (event) => {
		navigate(`/crear-evento?eventId=${event.id}`);
	};

	// Eliminar: llamar al servicio y actualizar UI
	const handleDelete = async (eventId) => {
		try {
			setLoading(true);
			const resp = await eventService.deleteEvent(eventId);
			if (resp === false) throw new Error("Error al eliminar");
			setUserEvents((prev) => prev.filter((e) => e.id !== eventId));
			setEventToDelete(null);
		} catch (err) {
			console.error(err);
			alert("No se pudo eliminar el evento");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="my-events-page">
			<img src={mascotamyev} alt="" className="account-mascot-float" aria-hidden="true" />
			<AccountPageHeader
				title="Mis eventos creados"
				titleAccent="Mis"
				subtitle="Donde tus ideas cobran vida"
			/>

			<div className="account-tabs">
				{TABS.map((tab) => (
					<button
						key={tab}
						type="button"
						className={`account-tab${activeTab === tab ? " account-tab--active" : ""}`}
						onClick={() => setActiveTab(tab)}
					>
						{tab}
					</button>
				))}
			</div>

			<div className="events-table-card">
				{loading && <p>Cargando tus eventos...</p>}
				{error && <p style={{ color: "red" }}>{error}</p>}
				{!loading && filteredEvents.length === 0 && (
					<p>No tienes eventos en esta categoría</p>
				)}
				{!loading && filteredEvents.length > 0 && (
					<table className="events-table">
						<thead>
							<tr>
								<th>Evento</th>
								<th>Estado</th>
								<th>Fecha</th>
								<th>Capacidad</th>
								<th>Acciones</th>
							</tr>
						</thead>
						<tbody>
							{filteredEvents.map((event) => (
								<tr key={event.id}>
									<td>
										<div className="events-table-event">
											{event.image_url ? (
												<img
													src={event.image_url}
													alt={event.title}
													className="events-table-thumb"
												/>
											) : (
												<div
													className="events-table-thumb account-img-placeholder"
													aria-hidden="true"
												>
													<i
														className="fa-regular fa-image"
														style={{
															display: "flex",
															alignItems: "center",
															justifyContent: "center",
															height: "100%",
															color: "#b0a099",
														}}
													/>
												</div>
											)}
											<strong>{event.title}</strong>
										</div>
									</td>
									<td>
										<span
											className={`event-status-badge event-status-badge--${STATUS_VARIANT_MAP[event.status]}`}
										>
											{STATUS_MAP[event.status]}
										</span>
									</td>
									<td>{formatDate(event.start_date)}</td>
									<td>
										{event.max_capacity != null ? `${getAvailableCapacity(event)}/${event.max_capacity}` : "—"}
									</td>
									<td>
										<div className="events-table-actions">
											<button
												type="button"
												className="events-table-action-btn"
												aria-label="edit"
												title="Editar"
												onClick={() => handleEdit(event)}
											>
												<i className={ACTION_ICONS["edit"]} />
											</button>
											<button
												type="button"
												className="events-table-action-btn"
												aria-label="delete"
												title="Eliminar"
												onClick={() => setEventToDelete(event)}
											>
												<i className={ACTION_ICONS["delete"]} />
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>
			{eventToDelete && (
				<div className="delete-event-backdrop" onClick={() => setEventToDelete(null)}>
					<div className="delete-event-modal" onClick={(e) => e.stopPropagation()}>
						<div className="delete-event-modal-header">
							<h3>Eliminar evento</h3>
							<button
								type="button"
								className="events-table-action-btn"
								onClick={() => setEventToDelete(null)}
								aria-label="Cerrar modal"
							>
								<i className="fa-solid fa-xmark" />
							</button>
						</div>
						<p className="delete-event-modal-text">
							¿Estás seguro de que quieres eliminar el evento <strong>{eventToDelete.title}</strong>? Esta acción no se puede deshacer.
						</p>
						<div className="delete-event-modal-actions">
							<button
								type="button"
								className="delete-event-modal-btn delete-event-modal-btn--cancel"
								onClick={() => setEventToDelete(null)}
							>
								Cancelar
							</button>
							<button
								type="button"
								className="delete-event-modal-btn delete-event-modal-btn--delete"
								onClick={() => handleDelete(eventToDelete.id)}
							>
								Eliminar evento
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};