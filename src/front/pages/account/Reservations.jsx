import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AccountPageHeader } from "../../components/account/AccountPageHeader";
import reservationService from "../../services/reservation.service";
import authService from "../../services/auth.service";
import useGlobalReducer from "../../hooks/useGlobalReducer";

const TABS = ["Próximas", "Completadas", "Canceladas"];

const STATUS_BY_TAB = {
	Próximas: ["confirmed"],
	Completadas: ["attended"],
	Canceladas: ["cancelled"],
};

export const Reservations = () => {
	const [activeTab, setActiveTab] = useState("Próximas");
	const [reservations, setReservations] = useState([]);
	const [loading, setLoading] = useState(true);
	const { store, dispatch } = useGlobalReducer();
	const navigate = useNavigate();

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (!token) {
			navigate("/login");
			return;
		}

		const loadUserAndReservations = async () => {
			let user = store.user;
			if (!user) {
				try {
					const profile = await authService.getMe();
					user = profile?.data;
					if (user) {
						dispatch({ type: "auth", payload: { user } });
					}
				} catch (error) {
					navigate("/login");
					return;
				}
			}

			if (!user) {
				navigate("/login");
				return;
			}

			try {
				const data = await reservationService.getReservationsByUser(user.id);
				setReservations(data || []);
			} catch (error) {
				console.log(error);
			} finally {
				setLoading(false);
			}
		};

		loadUserAndReservations();
	}, [store.user, dispatch, navigate]);

	const handleDelete = async (reservationId) => {
		const resp = await reservationService.deleteReservation(reservationId);
		if (resp) {
			setReservations((prev) => prev.filter((item) => item.id !== reservationId));
		}
	};

	const reservationsToShow = reservations.filter((reservation) => {
		const selectedStatuses = STATUS_BY_TAB[activeTab] || [];
		return selectedStatuses.length === 0 || selectedStatuses.includes(reservation.status);
	});

	const summary = [
		{ label: "Reservas activas", value: `${reservations.filter((r) => r.status === "confirmed").length}` },
		{ label: "Completadas", value: `${reservations.filter((r) => r.status === "attended").length}` },
		{ label: "Total reservas", value: `${reservations.length}` },
	];

	return (
		<div className="reservations-page">
			<AccountPageHeader
				title="Mis reservas"
				titleAccent="Mis"
				subtitle="Tus próximos planes confirmados."
				mascotComment="Mascota de la página de reservas"
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
						{loading ? (
							<div className="favorite-empty-state">
								<p>Cargando tus reservas…</p>
							</div>
						) : reservationsToShow.length === 0 ? (
							<div className="favorite-empty-state">
								<p>No hay reservas en esta pestaña.</p>
							</div>
						) : (
							reservationsToShow.map((reservation) => (
								<article key={reservation.id} className="reservation-card">
									<div className="reservation-card-image">
										<div className="account-img-placeholder" aria-hidden="true" />
									</div>

									<div className="reservation-card-body">
										<div className="reservation-tags">
											<span className={`reservation-tag reservation-tag--${reservation.status === "confirmed" ? "confirmada" : "vintage"}`}>
												{reservation.status === "confirmed" ? "Confirmada" : reservation.status}
											</span>
										</div>

										<h2 className="reservation-card-title">{reservation.event?.title || "Evento sin nombre"}</h2>

										<div className="reservation-info-row">
											<span>
												<i className="fa-solid fa-calendar" /> {reservation.created_at ? new Date(reservation.created_at).toLocaleDateString() : "Fecha no disponible"}
											</span>
											<span>
												<i className="fa-solid fa-clock" /> {reservation.status}
											</span>
										</div>

										<p className="reservation-card-desc">Reserva para {reservation.event?.title || "este evento"}.</p>

										<div className="reservation-tickets">
											<i className="fa-solid fa-ticket" />
											ID reserva: {reservation.id}
										</div>
									</div>

									<div className="reservation-card-actions">
										<div className="reservation-qr">
											<div
												className="account-img-placeholder"
												style={{ width: 48, height: 48, background: "#555" }}
												aria-hidden="true"
											/>
										</div>
										<button
											type="button"
											className="reservation-btn-primary"
											onClick={() => reservation.event?.id && navigate(`/detalles/${reservation.event.id}`)}
										>
											Ver detalles
										</button>
										<button
											type="button"
											className="reservation-btn-secondary"
											onClick={() => handleDelete(reservation.id)}
										>
											Cancelar reserva
										</button>
									</div>
								</article>
							))
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
