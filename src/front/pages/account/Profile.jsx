import { AccountPageHeader } from "../../components/account/AccountPageHeader";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../services/auth.service";
import useGlobalReducer from "../../hooks/useGlobalReducer";

const FALLBACK = {
	fileNumber: "000241",
	joinDate: "15 ABR 2023",
};

export const Profile = () => {
	const [data, setData] = useState(null);
	const [legalName, setLegalName] = useState("");
	const [phone, setPhone] = useState("");
	const [email, setEmail] = useState("");
	const [address, setAddress] = useState("");
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const navigate = useNavigate();
	const { dispatch } = useGlobalReducer();

	useEffect(() => {
		const load = async () => {
			const resp = await authService.getMe();
			if (resp && resp.data) {
				const user = resp.data;
				setData(user);
				setEmail(user.email || "");
				setPhone((user.profile && user.profile.phone) || "");
				setAddress((user.profile && user.profile.address) || "");
				const firstname = user.profile && user.profile.firstname ? user.profile.firstname : "";
				const lastname = user.profile && user.profile.lastname ? user.profile.lastname : "";
				setLegalName(`${firstname} ${lastname}`.trim());
			}
		};
		load();
	}, []);

	const onSave = async () => {
		// split legalName into firstname/lastname
		const parts = legalName.trim().split(" ");
		const firstname = parts.shift() || "";
		const lastname = parts.join(" ") || "";
		const payload = {
			email,
			firstname,
			lastname,
			phone,
			address,
		};
		const resp = await authService.updateProfile(payload);
		if (resp && resp.data) {
			setData(resp.data);
			alert('Perfil actualizado');
		} else {
			alert('Error al actualizar');
		}
	};

	const onDiscard = () => {
		if (!data) return;
		setEmail(data.email || "");
		setPhone((data.profile && data.profile.phone) || "");
		setAddress((data.profile && data.profile.address) || "");
		const firstname = data.profile && data.profile.firstname ? data.profile.firstname : "";
		const lastname = data.profile && data.profile.lastname ? data.profile.lastname : "";
		setLegalName(`${firstname} ${lastname}`.trim());
	};

	const onDeactivateAccount = async () => {
		setDeleting(true);
		const resp = await authService.deactivateAccount();
		setDeleting(false);
		if (resp) {
			// Logout: clear token and redirect
			authService.logout();
			dispatch({ type: "logout" });
			navigate("/login");
		} else {
			alert("Error al desactivar la cuenta");
			setShowDeleteModal(false);
		}
	};

	return (
		<div className="profile-page">
			<div className="profile-page-header">
				<AccountPageHeader
					title="Mi perfil"
					subtitle="Gestiona tu identidad. Exclusivo para quienes saben mirar entre lo olvidado."
				/>
				<div className="profile-stamp">
					<i className="fa-solid fa-eye" />
					<span>IDENTIDAD VERIFICADA</span>
				</div>
			</div>

			<article className="collector-file">
				<div className="collector-file-top">
					<div>
						<p className="collector-file-library">BIBLIOTECA DEL DESVÁN</p>
						<h2 className="collector-file-title">FICHA DE COLECCIONISTA</h2>
					</div>
					<span className="collector-file-number">Nº {FALLBACK.fileNumber}</span>
				</div>

				<div className="collector-file-body">
					<div className="collector-photo-block">
						<div className="collector-photo account-img-placeholder" aria-hidden="true" />

						<p className="collector-photo-name">{data ? data.username : "Usuario"}</p>

						<div className="collector-data-boxes">
							<div className="collector-data-box">
								<label>
									<i className="fa-regular fa-calendar" /> FECHA DE ALTA
								</label>
								<span>{FALLBACK.joinDate}</span>
							</div>
							<div className="collector-data-box">
								<label>NOMBRE EN EL DESVÁN</label>
								<span>{data ? data.username : "-"}</span>
							</div>
						</div>
					</div>

					<div className="collector-sections">
						<section className="collector-section">
							<h3 className="collector-section-header">IDENTIDAD PRIVADA</h3>
							<div className="collector-fields">
								<div className="collector-field">
									<label>
										<i className="fa-solid fa-user" /> NOMBRE LEGAL
									</label>
									<input type="text" value={legalName} onChange={(e) => setLegalName(e.target.value)} />
								</div>
								<div className="collector-field">
									<label>
										<i className="fa-solid fa-phone" /> TELÉFONO DE CONTACTO
									</label>
									<input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
								</div>
								<div className="collector-field collector-field--full">
									<label>
										<i className="fa-solid fa-envelope" /> CORREO ELECTRÓNICO
									</label>
									<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
								</div>
							</div>
						</section>

						<section className="collector-section">
							<h3 className="collector-section-header">LOGÍSTICA Y RESIDENCIA</h3>
							<div className="collector-fields">
								<div className="collector-field collector-field--full">
									<label>
										<i className="fa-solid fa-location-dot" /> DIRECCIÓN
									</label>
									<input type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
								</div>
								<div className="collector-field">
									<label>
										<i className="fa-solid fa-city" /> CIUDAD / PROVINCIA
									</label>
									<input type="text" defaultValue="" />
								</div>
								<div className="collector-field">
									<label>
										<i className="fa-solid fa-mailbox" /> CÓDIGO POSTAL
									</label>
									<input type="text" defaultValue="" />
								</div>
							</div>
						</section>
					</div>
				</div>
			</article>

			<div className="profile-actions">
				<button type="button" className="profile-btn-discard" onClick={onDiscard}>
					<i className="fa-solid fa-xmark" /> Descartar cambios
				</button>
				<button type="button" className="profile-btn-save" onClick={onSave}>
					<i className="fa-solid fa-floppy-disk" /> Guardar cambios
				</button>
			</div>

			<aside className="profile-banner">
				<div className="profile-banner-icon account-img-placeholder" aria-hidden="true" />

				<div className="profile-banner-text">
					<h3>Este es tu registro en la Biblioteca del Desván</h3>
					<p>
						Tu ficha queda archivada en nuestro catálogo de coleccionistas. Mantén tus datos
						actualizados para que el Desván pueda localizarte cuando surja un rastro
						imprescindible.
					</p>
				</div>

				<div className="profile-banner-logo">
					<div className="account-img-placeholder" aria-hidden="true" />
					<span>
						BIBLIOTECA DEL DESVÁN
						<br />
						EST. 2023
					</span>
				</div>
			</aside>

			{/* ── Zona de peligro: Desactivar cuenta ── */}
			<section className="profile-danger-zone">
				<div className="profile-danger-zone-icon">
					<i className="fa-solid fa-triangle-exclamation" />
				</div>
				<div className="profile-danger-zone-content">
					<h3>Zona de peligro</h3>
					<p>
						Al desactivar tu cuenta, tu perfil dejará de ser visible y no podrás acceder
						al Desván. Tus datos quedarán archivados de forma segura.
					</p>
				</div>
				<button
					type="button"
					className="profile-btn-deactivate"
					onClick={() => setShowDeleteModal(true)}
				>
					<i className="fa-solid fa-skull-crossbones" /> Desactivar cuenta
				</button>
			</section>

			{/* ── Modal de confirmación ── */}
			{showDeleteModal && (
				<div className="delete-account-backdrop" onClick={() => setShowDeleteModal(false)}>
					<div className="delete-account-modal" onClick={(e) => e.stopPropagation()}>
						<div className="delete-account-modal-header">
							<h3>
								<i className="fa-solid fa-ghost" /> ¿Desactivar tu cuenta?
							</h3>
							<button
								className="delete-account-modal-close"
								onClick={() => setShowDeleteModal(false)}
								aria-label="Cerrar"
							>
								<i className="fa-solid fa-xmark" />
							</button>
						</div>
						<p className="delete-account-modal-text">
							Tu ficha de coleccionista será archivada en las sombras del Desván.
							Ya no podrás iniciar sesión ni acceder a tus eventos, reservas o favoritos.
							<br /><br />
							<strong>Esta acción no se puede deshacer fácilmente.</strong>
						</p>
						<div className="delete-account-modal-actions">
							<button
								type="button"
								className="delete-account-modal-btn delete-account-modal-btn--cancel"
								onClick={() => setShowDeleteModal(false)}
								disabled={deleting}
							>
								Cancelar
							</button>
							<button
								type="button"
								className="delete-account-modal-btn delete-account-modal-btn--delete"
								onClick={onDeactivateAccount}
								disabled={deleting}
							>
								{deleting ? (
									<><i className="fa-solid fa-spinner fa-spin" /> Desactivando…</>
								) : (
									<><i className="fa-solid fa-skull-crossbones" /> Sí, desactivar</>
								)}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
