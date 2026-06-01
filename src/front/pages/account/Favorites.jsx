import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AccountPageHeader } from "../../components/account/AccountPageHeader";
import "./Favorites.css";
import favoriteService from "../../services/favorite.service";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import mascotafav from "../../assets/img/caja03.png";
import logoBw from "../../assets/img/logo_bw.png";


export const Favorites = () => {
	const [favorites, setFavorites] = useState([]);
	const { store } = useGlobalReducer();
	const navigate = useNavigate();

	useEffect(() => {
		favoriteService
			.getFavoritesByUser(store.user.id)
			.then((data) => {
				setFavorites(data || []);
			})
			.catch(() => {});

	}, [store.user, navigate]);

	const handleRemove = async (favoriteId) => {
		const resp = await favoriteService.deleteFavorite(favoriteId);
		if (resp) {
			setFavorites((prev) => prev.filter((fav) => fav.id !== favoriteId));
		}
	};

	return (
		<div className="favorites-page">
			<img src={mascotafav} alt="" className="account-mascot-float" aria-hidden="true" />
			<AccountPageHeader
				title="Mis favoritos"
				subtitle="Cosas que te guiñaron el ojo."
			/>

			<div className="favorites-grid">
				{favorites.length === 0 ? (
					<div className="favorite-empty-state">
						<p>No tienes favoritos todavía.</p>
					</div>
				) : (
					favorites.map((item) => (
						<article key={item.id} className="favorite-card">
							<div className="favorite-card-image">
								<img src={item.event?.image_url?.cover || logoBw} alt={item.event?.title} className={!item.event?.image_url?.cover ? "img-fallback" : undefined} />

								<button
									type="button"
									className="event-fav-btn active"
									aria-label="Quitar de favoritos"
									onClick={() => handleRemove(item.id)}
								>
									<i className="fa-solid fa-heart" />
								</button>
							</div>

							<div className="favorite-card-body">
								<h2 className="favorite-card-title">{item.event?.title}</h2>

								<div className="favorite-meta">
									<span>
										<i className="fa-solid fa-location-dot" /> {item.event?.exact_address}
									</span>
									<span>
										<i className="fa-regular fa-calendar" />
										{item.event?.start_time ? new Date(item.event.start_time).toLocaleDateString() : ""}
									</span>
								</div>

								<p className="favorite-card-desc">{item.event?.description}</p>

								<Link to={`/detalles/${item.event?.id}`} className="btn-ver-rastro">
									Ver rastro
								</Link>
							</div>
						</article>
					))
				)}
			</div>
		</div>
	);
};
