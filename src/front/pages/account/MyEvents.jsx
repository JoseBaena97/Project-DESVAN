import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AccountPageHeader } from "../../components/account/AccountPageHeader";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import eventService from "../../services/event.service";
import authService from "../../services/auth.service";
import mascotamyev from "../../assets/img/caja02.png";
import logoBw from "../../assets/img/logo_bw.png";

const TABS = ["TODOS", "ACTIVOS", "FINALIZADOS", "CANCELADOS"];

const ACTION_ICONS = {
	edit: "fa-solid fa-pen",
	duplicate: "fa-regular fa-copy",
	delete: "fa-solid fa-trash",
	cancel: "fa-solid fa-ban",
	reactivate: "fa-solid fa-rotate-right",
};

const STATUS_MAP = {
	active: "ACTIVO",
	finished: "FINALIZADO",
	cancelled: "CANCELADO",
};

const STATUS_VARIANT_MAP = {
	active: "activo",
	finished: "finalizado",
	cancelled: "cancelado",
};


export const MyEvents = () => {
	const [activeTab, setActiveTab] = useState("TODOS");
	const [userEvents, setUserEvents] = useState([]);
	const [eventToDelete, setEventToDelete] = useState(null);
	const [eventToCancel, setEventToCancel] = useState(null);
	const [eventToReactivate, setEventToReactivate] = useState(null);
	const { store, dispatch, showErrorAlert } = useGlobalReducer();
	const navigate = useNavigate();

	useEffect(() => {
		const fetchUserEvents = async () => {
			const token = localStorage.getItem("token");
			if (!token) return;

			if (store.userLoading) return;

			let currentUser = store.user;
			if (!currentUser) {
				showErrorAlert("Usuario no autenticado");
				return;
			}

			try {
				dispatch({ type: 'setLoading', payload: true });

				// Obtener eventos de la API
				const response = await eventService.getEvents();

				if (!response || !response.data || !Array.isArray(response.data)) {
					showErrorAlert("No se pudieron cargar los eventos");
					setUserEvents([]);
					return;
				}

				const allEvents = response.data;

				// Filtrar solo los eventos creados por el usuario logueado
				const filtered = allEvents.filter(
					(event) => event.seller && event.seller.id === currentUser.id
				);
				setUserEvents(filtered);
				showErrorAlert(null);
			} catch (err) {
				console.error("Error fetching user events:", err);
				showErrorAlert("Error al cargar tus eventos");
				setUserEvents([]);
			} finally {
				dispatch({ type: 'setLoading', payload: false });
			}
		};

		fetchUserEvents();
	}, [store.user, store.userLoading, dispatch]);

	const getEventStatusKey = (event) => {
		// Priorizar estado explícito desde la API
		if (event.status === "cancelled") return "cancelled";
		if (event.status === "finished") return "finished";

		const now = new Date();
		if (event.end_time) {
			if (new Date(event.end_time) < now) return "finished";
		} else if (event.end_date) {
			const endDate = new Date(event.end_date);
			endDate.setHours(23, 59, 59, 999);
			if (endDate < now) return "finished";
		}

		return "active";
	};

	// Función para filtrar eventos por tab
	const getFilteredEvents = () => {
		if (activeTab === "TODOS") return userEvents;

		return userEvents.filter((event) => {
			const statusKey = getEventStatusKey(event);
			const eventStatus = STATUS_MAP[statusKey];
			if (activeTab === "ACTIVOS") return eventStatus === "ACTIVO";
			if (activeTab === "FINALIZADOS") return eventStatus === "FINALIZADO";
			if (activeTab === "CANCELADOS") return eventStatus === "CANCELADO";
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
			dispatch({ type: 'setLoading', payload: true });
			const resp = await eventService.deleteEvent(eventId);
			if (resp === false) throw new Error("Error al eliminar");
			setUserEvents((prev) => prev.filter((e) => e.id !== eventId));
			setEventToDelete(null);
		} catch (err) {
			console.error(err);
			alert("No se pudo eliminar el evento");
		} finally {
			dispatch({ type: 'setLoading', payload: false });
		}
	};

	// Cancelar: marcar evento como cancelled via update
	const handleCancel = async (eventId) => {
		try {
			dispatch({ type: 'setLoading', payload: true });
			const resp = await eventService.updateEvent(eventId, { status: 'cancelled' });
			if (!resp) throw new Error('Error al cancelar');
			// actualizar estado local
			setUserEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, status: 'cancelled' } : e)));
			setEventToCancel(null);
		} catch (err) {
			console.error(err);
			alert('No se pudo cancelar el evento');
		} finally {
			dispatch({ type: 'setLoading', payload: false });
		}
	};

	// Reactivar: marcar evento como active via servicio
	const handleReactivate = async (eventId) => {
		try {
			dispatch({ type: 'setLoading', payload: true });
			const resp = await eventService.reactivateEvent(eventId);
			if (!resp) throw new Error('Error al reactivar');
			setUserEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, status: 'active' } : e)));
			setEventToReactivate(null);
		} catch (err) {
			console.error(err);
			alert('No se pudo reactivar el evento');
		} finally {
			dispatch({ type: 'setLoading', payload: false });
		}
	};

	return (
		<div className="my-events-page">
			<img src={mascotamyev} alt="" className="account-mascot-float" aria-hidden="true" />
			<AccountPageHeader
				title="Mis eventos creados"
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
				{store.loading && <p>Cargando tus eventos...</p>}
				{store.error && <p className="account-error-text">{store.error}</p>}
				{!store.loading && filteredEvents.length === 0 && (
					<p>No tienes eventos en esta categoría</p>
				)}
				{!store.loading && filteredEvents.length > 0 && (
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
											<img
												src={event.image_url?.cover || event.image_url?.gallery?.[0] || logoBw}
												alt={event.title}
												className={`events-table-thumb${!(event.image_url?.cover || event.image_url?.gallery?.[0]) ? " img-fallback" : ""}`}
											/>
											<strong>{event.title}</strong>
											{(event.image_url?.cover || event.image_url?.gallery?.[0]) ? (
												<img
													src={event.image_url?.cover || event.image_url?.gallery?.[0]}
													alt={event.title}
													className="events-table-thumb"
												/>
											) : (
												<div
													className="events-table-thumb account-img-placeholder"
													aria-hidden="true"
												>
													<i
														className="fa-regular fa-image events-table-thumb-icon"
													/>
												</div>
											)}
											<Link to={`/detalles/${event.id}`} className="events-table-title-link"><strong>{event.title}</strong></Link>
										</div>
									</td>
									<td>
										<span
											className={`event-status-badge event-status-badge--${STATUS_VARIANT_MAP[getEventStatusKey(event)] || "activo"}`}
										>
											{STATUS_MAP[getEventStatusKey(event)] || "ACTIVO"}
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
											{getEventStatusKey(event) !== 'cancelled' && (
												<button
													type="button"
													className="events-table-action-btn"
													aria-label="cancel"
													title="Cancelar evento"
													onClick={() => setEventToCancel(event)}
												>
													<i className={ACTION_ICONS["cancel"]} />
												</button>
											)}
											{getEventStatusKey(event) === 'cancelled' && (
												<button
													type="button"
													className="events-table-action-btn"
													aria-label="reactivate"
													title="Reactivar evento"
													onClick={() => setEventToReactivate(event)}
												>
													<i className={ACTION_ICONS["reactivate"]} />
												</button>
											)}
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
			{eventToReactivate && (
				<div className="delete-event-backdrop" onClick={() => setEventToReactivate(null)}>
					<div className="delete-event-modal" onClick={(e) => e.stopPropagation()}>
						<div className="delete-event-modal-header">
							<h3>Reactivar evento</h3>
							<button
								type="button"
								className="events-table-action-btn"
								onClick={() => setEventToReactivate(null)}
								aria-label="Cerrar modal"
							>
								<i className="fa-solid fa-xmark" />
							</button>
						</div>
						{(() => {
							const now = new Date();
							let isPast = false;
							if (eventToReactivate.end_time) {
								isPast = new Date(eventToReactivate.end_time) < now;
							} else if (eventToReactivate.end_date) {
								const endDate = new Date(eventToReactivate.end_date);
								endDate.setHours(23, 59, 59, 999);
								isPast = endDate < now;
							}
							return (
								<>
									<p className="delete-event-modal-text">
										¿Estás seguro de que quieres reactivar el evento <strong>{eventToReactivate.title}</strong>? Los usuarios volverán a ver el evento como activo.
									</p>
									{isPast && (
										<p className="delete-event-modal-text" style={{ color: '#b45309' }}>
											Advertencia: la fecha del evento ya ha pasado. Aunque lo reactives, no será posible que usuarios hagan reservas para fechas pasadas.
										</p>
									)}
									<div className="delete-event-modal-actions">
										<button
											type="button"
											className="delete-event-modal-btn delete-event-modal-btn--cancel"
											onClick={() => setEventToReactivate(null)}
										>
											Cancelar
										</button>
										<button
											type="button"
											className="delete-event-modal-btn delete-event-modal-btn--delete"
											onClick={() => handleReactivate(eventToReactivate.id)}
										>
											Reactivar evento
										</button>
									</div>
							</>
							);
						})()}
					</div>
				</div>
			)}
			{eventToCancel && (
				<div className="delete-event-backdrop" onClick={() => setEventToCancel(null)}>
					<div className="delete-event-modal" onClick={(e) => e.stopPropagation()}>
						<div className="delete-event-modal-header">
							<h3>Cancelar evento</h3>
							<button
								type="button"
								className="events-table-action-btn"
								onClick={() => setEventToCancel(null)}
								aria-label="Cerrar modal"
							>
								<i className="fa-solid fa-xmark" />
							</button>
						</div>
						<p className="delete-event-modal-text">
							¿Estás seguro de que quieres cancelar el evento <strong>{eventToCancel.title}</strong>? Los usuarios no podrán reservar ni ver el evento como activo.
						</p>
						<div className="delete-event-modal-actions">
							<button
								type="button"
								className="delete-event-modal-btn delete-event-modal-btn--cancel"
								onClick={() => setEventToCancel(null)}
							>
								Cancelar
							</button>
							<button
								type="button"
								className="delete-event-modal-btn delete-event-modal-btn--delete"
								onClick={() => handleCancel(eventToCancel.id)}
							>
								Cancelar evento
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};