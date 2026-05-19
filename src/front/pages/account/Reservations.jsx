import { useState } from "react";
import { AccountPageHeader } from "../../components/account/AccountPageHeader";

const TABS = ["Próximas", "Completadas", "Canceladas"];

const RESERVATIONS = [
	{
		id: 1,
		tags: [
			{ text: "Confirmada", variant: "confirmada" },
			{ text: "Vintage", variant: "vintage" },
		],
		title: "Mercado de Motores",
		location: "Museo del Ferrocarril, Madrid",
		date: "15 Octubre, 2023",
		time: "10:00 — 18:00",
		description:
			"Una cuidadosa selección de mobiliario vintage, ropa retro y curiosidades en un entorno industrial recuperado del siglo XIX.",
		tickets: "2 entradas reservadas",
	},
	{
		id: 2,
		tags: [
			{ text: "Confirmada", variant: "confirmada" },
			{ text: "Vintage", variant: "vintage" },
		],
		title: "Mercado de Motores",
		location: "Museo del Ferrocarril, Madrid",
		date: "15 Octubre, 2023",
		time: "10:00 — 18:00",
		description:
			"Una cuidadosa selección de mobiliario vintage, ropa retro y curiosidades en un entorno industrial recuperado del siglo XIX.",
		tickets: "2 entradas reservadas",
	},
];

const SUMMARY = [
	{ label: "Reservas activas", value: "2" },
	{ label: "Próximo evento", value: "En 5 días" },
	{ label: "Total visitas", value: "14 rastros" },
];

export const Reservations = () => {
	const [activeTab, setActiveTab] = useState("Próximas");

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
						{RESERVATIONS.map((reservation) => (
							<article key={reservation.id} className="reservation-card">
								<div className="reservation-card-image">
									{/* TODO: Imagen del evento reservado
									    <img src={rutaImagenEvento} alt={reservation.title} />
									*/}
									<div className="account-img-placeholder" aria-hidden="true" />
								</div>

								<div className="reservation-card-body">
									<div className="reservation-tags">
										{reservation.tags.map((tag) => (
											<span
												key={tag.text}
												className={`reservation-tag reservation-tag--${tag.variant}`}
											>
												{tag.text}
											</span>
										))}
									</div>

									<h2 className="reservation-card-title">{reservation.title}</h2>

									<div className="reservation-info-row">
										<span>
											<i className="fa-solid fa-location-dot" /> {reservation.location}
										</span>
										<span>
											<i className="fa-regular fa-calendar" /> {reservation.date}
										</span>
										<span>
											<i className="fa-regular fa-clock" /> {reservation.time}
										</span>
									</div>

									<p className="reservation-card-desc">{reservation.description}</p>

									<div className="reservation-tickets">
										<i className="fa-solid fa-ticket" />
										{reservation.tickets}
									</div>
								</div>

								<div className="reservation-card-actions">
									<div className="reservation-qr">
										{/* TODO: Código QR de la entrada
										    <img src={rutaQR} alt="QR entrada" />
										*/}
										<div
											className="account-img-placeholder"
											style={{ width: 48, height: 48, background: "#555" }}
											aria-hidden="true"
										/>
									</div>
									<button type="button" className="reservation-btn-primary">
										Ver detalles
									</button>
									<button type="button" className="reservation-btn-secondary">
										Añadir al calendario
									</button>
								</div>
							</article>
						))}
					</div>
				</div>

				<aside className="reservations-summary">
					<h3>Resumen</h3>
					{SUMMARY.map((row) => (
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
