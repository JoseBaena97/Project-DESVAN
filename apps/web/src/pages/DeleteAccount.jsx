import { useState } from "react";
import { Link } from "react-router-dom";
import authService from "../services/auth.service";
import useGlobalReducer from "../hooks/useGlobalReducer";
import "./Legal.css";

// Página pública exigida por Google Play: permite borrar la cuenta
// sin instalar la app y sin iniciar sesión (también si está desactivada).
export const DeleteAccount = () => {
	const { store, dispatch } = useGlobalReducer();
	const [email, setEmail] = useState(store.user?.email || "");
	const [password, setPassword] = useState("");
	const [confirmed, setConfirmed] = useState(false);
	const [sending, setSending] = useState(false);
	const [error, setError] = useState("");
	const [done, setDone] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setSending(true);
		try {
			await authService.deleteAccount(email.trim(), password);
			if (store.auth) {
				authService.logout();
				dispatch({ type: "logout" });
			}
			setDone(true);
		} catch (err) {
			setError(err.message);
		} finally {
			setSending(false);
		}
	};

	return (
		<main className="legal-page">
			<div className="legal-page-inner">
				<h1>Eliminar tu cuenta de El Desván</h1>
				<p className="legal-updated">
					Sirve para la web y la app de Android. El borrado es inmediato y no se puede deshacer.
				</p>

				<h2>Qué se borra</h2>
				<ul>
					<li>Tu perfil: email, nombre, teléfono, dirección, biografía y foto.</li>
					<li>Los eventos que has publicado. Quien tenga reserva en uno futuro recibirá un aviso de cancelación.</li>
					<li>Tus reservas, favoritos, valoraciones (escritas y recibidas) y notificaciones.</li>
				</ul>

				<h2>Qué se conserva</h2>
				<p>
					Los reportes de moderación en los que aparezcas, sin datos personales: tu usuario
					queda como «usuario-eliminado». Consulta la{" "}
					<Link to="/privacidad">política de privacidad</Link>.
				</p>

				<div className="legal-card">
					{done ? (
						<p className="legal-success" role="status">
							Tu cuenta se ha eliminado. Gracias por haber pasado por el Desván.
						</p>
					) : (
						<form className="legal-form" onSubmit={handleSubmit}>
							<label>
								Email
								<input
									type="email"
									autoComplete="email"
									required
									value={email}
									onChange={(e) => setEmail(e.target.value)}
								/>
							</label>
							<label>
								Contraseña
								<input
									type="password"
									autoComplete="current-password"
									required
									value={password}
									onChange={(e) => setPassword(e.target.value)}
								/>
							</label>
							<label className="legal-check">
								<input
									type="checkbox"
									checked={confirmed}
									onChange={(e) => setConfirmed(e.target.checked)}
								/>
								Entiendo que mi cuenta y mis datos se borrarán para siempre.
							</label>
							{error && <p className="legal-error" role="alert">{error}</p>}
							<button
								type="submit"
								className="legal-btn-danger"
								disabled={!confirmed || sending}
							>
								{sending ? "Eliminando…" : "Eliminar mi cuenta"}
							</button>
							<p>
								¿No recuerdas la contraseña?{" "}
								<Link to="/forgot-password">Recupérala</Link> y vuelve aquí.
							</p>
						</form>
					)}
				</div>
			</div>
		</main>
	);
};
