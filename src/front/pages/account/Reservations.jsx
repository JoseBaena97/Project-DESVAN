import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AccountPageHeader } from "../../components/account/AccountPageHeader";
import reservationService from "../../services/reservation.service";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import mascotareservas from "../../assets/img/caja01.png";

const TABS = ["Próximas", "Completadas", "Canceladas"];

const STATUS_LABELS = {
	confirmed: { label: "Confirmada", cls: "confirmada" },
	attended: { label: "Completada", cls: "completada" },
	cancelled: { label: "Cancelada", cls: "cancelada" },
};

const isEventEnded = (reservation) => {
	const endAt = reservation.event?.end_date || reservation.event?.end_time;
	if (!endAt) return false;
	return new Date(endAt) < new Date();
};

const isEventCancelled = (reservation) => reservation.event?.status === "cancelled";

const matchesTab = (reservation, tab) => {
	const { status } = reservation;
	const eventCancelled = isEventCancelled(reservation);
	if (tab === "Próximas") return status === "confirmed" && !isEventEnded(reservation) && !eventCancelled;
	if (tab === "Completadas") return status === "attended" || (status === "confirmed" && isEventEnded(reservation) && !eventCancelled);
	if (tab === "Canceladas") return status === "cancelled" || (status === "confirmed" && eventCancelled);
	return false;
};

export const Reservations = () => {
	const [activeTab, setActiveTab] = useState("Próximas");
	const [reservations, setReservations] = useState([]);
	const { store, dispatch } = useGlobalReducer();
	const navigate = useNavigate();

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (!token) {
			navigate("/login");
			return;
		}

		if (store.userLoading) return;

		if (!store.user) {
			navigate("/login");
			return;
		}

		const fetchReservations = async () => {
			try {
				const data = await reservationService.getReservationsByUser(store.user.id);
				setReservations(data || []);
			} catch (error) {
				console.log(error);
			} finally {
				dispatch({ type: 'setLoading', payload: false });
			}
		};

		fetchReservations();
	}, [store.user, store.userLoading, dispatch, navigate]);

	const handleCancel = async (reservationId) => {
		const resp = await reservationService.cancelReservation(reservationId);
		if (resp) {
			setReservations((prev) =>
				prev.map((item) =>
					item.id === reservationId ? { ...item, status: "cancelled" } : item
				)
			);
		}
	};

	const reservationsToShow = reservations.filter((r) => matchesTab(r, activeTab));

	const activeCount = reservations.filter((r) => r.status === "confirmed" && !isEventEnded(r) && !isEventCancelled(r)).length;
	const completedCount = reservations.filter((r) => r.status === "attended" || (r.status === "confirmed" && isEventEnded(r) && !isEventCancelled(r))).length;

	const summary = [
		{ label: "Reservas activas", value: `${activeCount}` },
		{ label: "Completadas", value: `${completedCount}` },
		{ label: "Total reservas", value: `${reservations.length}` },
	];

	return (
		<div className="reservations-page">
			<img src={mascotareservas} alt="" className="account-mascot-float" aria-hidden="true" />
			<AccountPageHeader
				title="Mis reservas"
				subtitle="Tus próximos planes confirmados."
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

			<div className="reservations-layout">
				<div className="reservations-main">
					<div className="reservations-list">
						{store.loading ? (
						<div className="favorite-empty-state">
							<p>Cargando tus reservas…</p>
						</div>
						) : reservationsToShow.length === 0 ? (
							<div className="favorite-empty-state">
								<p>No hay reservas en esta pestaña.</p>
							</div>
						) : (
							reservationsToShow.map((reservation) => {
								const eventCancelled = isEventCancelled(reservation);
								const statusInfo = eventCancelled
									? { label: "Evento cancelado", cls: "cancelada" }
									: STATUS_LABELS[reservation.status] || { label: reservation.status, cls: "vintage" };
								const coverImage = reservation.event?.image_url?.cover;
								const isActive = reservation.status === "confirmed" && !isEventEnded(reservation) && !eventCancelled;

								return (
									<article key={reservation.id} className="reservation-card">
										<div className="reservation-card-image">
											{coverImage ? (
												<img src={coverImage} alt={reservation.event?.title} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit" }} />
											) : (
												<div className="account-img-placeholder" aria-hidden="true" />
											)}
										</div>

										<div className="reservation-card-body">
											<div className="reservation-tags">
												<span className={`reservation-tag reservation-tag--${statusInfo.cls}`}>
													{statusInfo.label}
												</span>
											</div>

											<h2 className="reservation-card-title">{reservation.event?.title || "Evento sin nombre"}</h2>

											<div className="reservation-info-row">
												<span>
													<i className="fa-solid fa-calendar" />
													{(() => {
														const date = reservation.event?.start_date || reservation.created_at;
														const dateStr = date ? new Date(date).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }) : "Fecha no disponible";
														const timeStr = reservation.event?.start_time ? new Date(reservation.event.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : null;
														return timeStr ? `${dateStr}  ·  ${timeStr}` : dateStr;
													})()}
												</span>
												{reservation.event?.exact_address && (
													<span>
														<i className="fa-solid fa-location-dot" /> {reservation.event.exact_address}
													</span>
												)}
											</div>

											<div className="reservation-tickets">
												<i className="fa-solid fa-ticket" />
												ID reserva: {reservation.id}
											</div>
										</div>

										<div className="reservation-card-actions">
											<div className="reservation-qr">
												<div
													className="account-img-placeholder account-image-skeleton"
													aria-hidden="true"
												/>
											</div>
											{!eventCancelled && (
												<button
													type="button"
													className="reservation-btn-primary"
													onClick={() => reservation.event?.id && navigate(`/detalles/${reservation.event.id}`)}
												>
													Ver detalles
												</button>
											)}
											{isActive && (
												<button
													type="button"
													className="reservation-btn-secondary"
													onClick={() => handleCancel(reservation.id)}
												>
													Cancelar reserva
												</button>
											)}
										</div>
									</article>
								);
							})
						)}
					</div>
				</div>

				<aside className="reservations-summary">
					<h3>Resumen</h3>
					{summary.map((row) => (
						<div key={row.label} className="reservations-summary-row">
							<span>{row.label}</span>
							<span>{row.value}</span>
						</div>
					))}
				</aside>
			</div>
		</div>
	);
};
