import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AccountPageHeader } from "../../components/account/AccountPageHeader";
import favoriteService from "../../services/favorite.service";
import authService from "../../services/auth.service";
import useGlobalReducer from "../../hooks/useGlobalReducer";


export const Favorites = () => {
	const [favorites, setFavorites] = useState([]);
	const { store, dispatch } = useGlobalReducer();
	const navigate = useNavigate();

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (!token) {
			navigate("/login");
			return;
		}

		const loadUserAndFavorites = async () => {
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

			favoriteService
				.getFavoritesByUser(user.id)
				.then((data) => {
					setFavorites(data || []);
				})
				.catch((err) => console.log(err));
		};

		loadUserAndFavorites();
	}, [store.user, dispatch, navigate]);

	const handleRemove = async (favoriteId) => {
		const resp = await favoriteService.deleteFavorite(favoriteId);
		if (resp) {
			setFavorites((prev) => prev.filter((fav) => fav.id !== favoriteId));
		}
	};

	return (
		<div className="favorites-page">
			<AccountPageHeader
				title="Mis favoritos"
				titleAccent="Mis"
				subtitle="Cosas que te guiñaron el ojo."
				mascotComment="Mascota de la página de favoritos"
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
								{item.event?.image_url?.cover ? (
									<img src={item.event.image_url.cover} alt={item.event?.title} />
								) : (
									<div className="account-img-placeholder" aria-hidden="true" />
								)}

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
										<i className="fa-solid fa-location-dot" /> {item.event?.city}
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
