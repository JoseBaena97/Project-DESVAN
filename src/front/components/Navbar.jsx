import { Link, useLocation, useNavigate } from "react-router-dom";
import desvanLogo from "../assets/img/desvanlogonav.png";
import create_ico from "../assets/img/create_ico.png";
import favorites_ico from "../assets/img/favorites_ico1.png";
import user_ico from "../assets/img/profile_ico+.png";
import authService from "../services/auth.service";
import { useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";


export const Navbar = () => {
	const location = useLocation();
	const navigate = useNavigate();

    const { store, dispatch } = useGlobalReducer();

    useEffect(() => {
        if (localStorage.getItem('token') && !store.user) {
            authService.getMe().then(data => dispatch({
                type: 'auth',
                payload: {
                    user: data.data
                }
            }))
        }
    }, [store.auth])

	console.log(store.user)

	return (
		<>
			<nav className="custom-navbar">
				<div className="container-fluid">
					<div className="nav-brand">
						<Link to="/explorar">
							<img src={desvanLogo} alt="Desván Logo" className="nav-brand-img" />
						</Link>
					</div>
					<div className="nav-search">
						<i className="fa-solid fa-magnifying-glass"></i>
						<input type="text" placeholder="Buscar rastros, ferias, antigüedades..." />
					</div>
					<div className="nav-actions d-none d-md-flex">
						<Link to={store.user ? "/perfil" : "/login"}>
							<button className="btn-primary-custom">
								<img src={user_ico} alt="user" className="user_ico"/> Mi Perfil
							</button>
						</Link>
						<Link to={store.user ? "/crear-evento" : "/login"}>
							<button className="btn-primary-custom">
								<img src={create_ico} alt="sdsdsd" className="ico_create"/> Crear evento
							</button>
						</Link>
					</div>
					<button
						className="btn-hamburger d-flex d-md-none"
						type="button"
						data-bs-toggle="offcanvas"
						data-bs-target="#navOffcanvas"
						aria-controls="navOffcanvas"
					>
						<i className="fa-solid fa-bars"></i>
					</button>
				</div>
			</nav>

			<div
				className="offcanvas offcanvas-end custom-offcanvas-navbar"
				tabIndex="-1"
				id="navOffcanvas"
				aria-labelledby="navOffcanvasLabel"
			>
				<div className="offcanvas-header">
					<h5 className="offcanvas-title me-4" id="navOffcanvasLabel">Menú</h5>
					<button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Cerrar"></button>
				</div>
				<div className="offcanvas-body">
					<div className="d-flex flex-column gap-3">
						<button 
							className="btn-primary-custom" 
							data-bs-dismiss="offcanvas"
							onClick={() => navigate(store.user ? "/perfil" : "/login")}
						>
							<img src={user_ico} alt="user" className="user_ico"/> Mi Perfil
						</button>
						<button 
							className="btn-primary-custom" 
							data-bs-dismiss="offcanvas"
							onClick={() => navigate(store.user ? "/crear-evento" : "/login")}
						>
							<img src={create_ico} alt="sdsdsd" className="ico_create"/> Crear evento
						</button>
					</div>
				</div>
			</div>
		</>
	);
};
