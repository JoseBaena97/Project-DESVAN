import { useState } from "react";
import { AccountPageHeader } from "../../components/account/AccountPageHeader";

const TABS = ["TODOS", "ACTIVOS", "BORRADORES", "FINALIZADOS"];

const MY_EVENTS = [
	{
		id: 1,
		title: "Exhibición de Manuscritos del S.XIX",
		status: "ACTIVO",
		statusVariant: "activo",
		date: "12 Oct 2024",
		tickets: "45 / 100",
		hasImage: true,
		actions: ["edit", "duplicate"],
	},
	{
		id: 2,
		title: "Subasta de Relojes de Bolsillo",
		status: "INACTIVO",
		statusVariant: "inactivo",
		date: "Por definir",
		tickets: "—",
		hasImage: false,
		actions: ["edit", "delete"],
	},
];

const ACTION_ICONS = {
	edit: "fa-solid fa-pen",
	duplicate: "fa-regular fa-copy",
	delete: "fa-solid fa-trash",
};

export const MyEvents = () => {
	const [activeTab, setActiveTab] = useState("TODOS");

	return (
		<div className="my-events-page">
			<AccountPageHeader
				title="Mis eventos creados"
				titleAccent="Mis"
				subtitle="Donde tus ideas cobran vida"
				mascotComment="Mascota de la página de mis eventos"
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
				<table className="events-table">
					<thead>
						<tr>
							<th>Evento</th>
							<th>Estado</th>
							<th>Fecha</th>
							<th>Entradas</th>
							<th>Acciones</th>
						</tr>
					</thead>
					<tbody>
						{MY_EVENTS.map((event) => (
							<tr key={event.id}>
								<td>
									<div className="events-table-event">
										{event.hasImage ? (
											/* TODO: Miniatura del evento
											   <img src={rutaMiniatura} alt="" className="events-table-thumb" />
											*/
											<div
												className="events-table-thumb account-img-placeholder"
												aria-hidden="true"
											/>
										) : (
											<div className="events-table-thumb account-img-placeholder" aria-hidden="true">
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
										className={`event-status-badge event-status-badge--${event.statusVariant}`}
									>
										{event.status}
									</span>
								</td>
								<td>{event.date}</td>
								<td>{event.tickets}</td>
								<td>
									<div className="events-table-actions">
										{event.actions.map((action) => (
											<button
												key={action}
												type="button"
												className="events-table-action-btn"
												aria-label={action}
											>
												<i className={ACTION_ICONS[action]} />
											</button>
										))}
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};
