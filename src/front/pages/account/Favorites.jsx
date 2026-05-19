import { AccountPageHeader } from "../../components/account/AccountPageHeader";

const FAVORITES = [
	{
		id: 1,
		badge: { text: "Destacado", variant: "destacado" },
		tags: ["Vintage", "Cámaras"],
		title: "Mercado de Coleccionismo Vintage",
		location: "Madrid Centro",
		date: "15 Octubre, 2023",
		description:
			"Una cuidadosa selección de cámaras analógicas, lentes raras y accesorios fotográficos de época en un entorno industrial recuperado.",
		/* TODO: Imagen de la tarjeta 1
		   imageSrc: import ... o ruta en /assets/img/...
		*/
	},
	{
		id: 2,
		badge: { text: "Popular", variant: "popular" },
		tags: ["Antigüedades", "Muebles"],
		title: "Feria de Antigüedades del Sur",
		location: "Sevilla",
		date: "22 Octubre, 2023",
		description:
			"Antigüedades clásicas, muebles de mediados de siglo y piezas únicas de coleccionista en un mercado al aire libre.",
	},
	{
		id: 3,
		badge: null,
		tags: ["Joyas", "Relojes"],
		title: "Exhibición de Relojería Clásica",
		location: "Barcelona",
		date: "03 Noviembre, 2023",
		description:
			"Exposición dedicada a relojes de bolsillo, cronómetros militares y joyería vintage de los siglos XVIII al XX.",
	},
];

export const Favorites = () => {
	return (
		<div className="favorites-page">
			<AccountPageHeader
				title="Mis favoritos"
				titleAccent="Mis"
				subtitle="Cosas que te guiñaron el ojo."
				mascotComment="Mascota de la página de favoritos"
			/>

			<div className="favorites-grid">
				{FAVORITES.map((item) => (
					<article key={item.id} className="favorite-card">
						<div className="favorite-card-image">
							{/* TODO: Imagen del evento favorito — sustituye el div por:
							    <img src={item.imageSrc} alt={item.title} />
							*/}
							<div className="account-img-placeholder" aria-hidden="true" />

							{item.badge && (
								<span className={`favorite-badge favorite-badge--${item.badge.variant}`}>
									{item.badge.text}
								</span>
							)}

							<button type="button" className="favorite-heart" aria-label="Quitar de favoritos">
								<i className="fa-solid fa-heart" />
							</button>
						</div>

						<div className="favorite-card-body">
							<div className="favorite-tags">
								{item.tags.map((tag) => (
									<span key={tag} className="favorite-tag">
										{tag}
									</span>
								))}
							</div>

							<h2 className="favorite-card-title">{item.title}</h2>

							<div className="favorite-meta">
								<span>
									<i className="fa-solid fa-location-dot" /> {item.location}
								</span>
								<span>
									<i className="fa-regular fa-calendar" /> {item.date}
								</span>
							</div>

							<p className="favorite-card-desc">{item.description}</p>

							<button type="button" className="favorite-btn-rastro">
								Ver rastro
							</button>
						</div>
					</article>
				))}
			</div>
		</div>
	);
};
