import { AccountPageHeader } from "../../components/account/AccountPageHeader";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../services/auth.service";
import uploadService from "../../services/upload.service";
import useGlobalReducer from "../../hooks/useGlobalReducer";

const FALLBACK = {
	fileNumber: "000241",
};

const PHONE_PREFIXES = [
	{ code: "+34",  label: "+34 🇪🇸" },
	{ code: "+1",   label: "+1 🇺🇸" },
	{ code: "+44",  label: "+44 🇬🇧" },
	{ code: "+33",  label: "+33 🇫🇷" },
	{ code: "+49",  label: "+49 🇩🇪" },
	{ code: "+39",  label: "+39 🇮🇹" },
	{ code: "+351", label: "+351 🇵🇹" },
	{ code: "+31",  label: "+31 🇳🇱" },
	{ code: "+32",  label: "+32 🇧🇪" },
	{ code: "+41",  label: "+41 🇨🇭" },
	{ code: "+52",  label: "+52 🇲🇽" },
	{ code: "+54",  label: "+54 🇦🇷" },
	{ code: "+55",  label: "+55 🇧🇷" },
	{ code: "+56",  label: "+56 🇨🇱" },
	{ code: "+57",  label: "+57 🇨🇴" },
	{ code: "+51",  label: "+51 🇵🇪" },
	{ code: "+593", label: "+593 🇪🇨" },
	{ code: "+598", label: "+598 🇺🇾" },
	{ code: "+595", label: "+595 🇵🇾" },
];

const splitPhone = (fullPhone) => {
	if (!fullPhone) return { prefix: "+34", number: "" };
	if (!fullPhone.startsWith("+")) return { prefix: "+34", number: fullPhone };
	const sorted = [...PHONE_PREFIXES].sort((a, b) => b.code.length - a.code.length);
	for (const { code } of sorted) {
		if (fullPhone.startsWith(code)) {
			return { prefix: code, number: fullPhone.slice(code.length) };
		}
	}
	return { prefix: "+34", number: fullPhone };
};

export const Profile = () => {
	const [data, setData] = useState(null);
	const [firstname, setFirstname] = useState("");
	const [lastname, setLastname] = useState("");
	const [phonePrefix, setPhonePrefix] = useState("+34");
	const [phoneNumber, setPhoneNumber] = useState("");
	const [email, setEmail] = useState("");
	const [address, setAddress] = useState("");
	const [profilePictureFile, setProfilePictureFile] = useState(null);
	const [profilePicturePreview, setProfilePicturePreview] = useState("");
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [successMsg, setSuccessMsg] = useState("");
	const [showPrefixDropdown, setShowPrefixDropdown] = useState(false);
	const navigate = useNavigate();
	const { dispatch } = useGlobalReducer();
	const addressInputRef = useRef(null);
	const autocompleteRef = useRef(null);
	const prefixDropdownRef = useRef(null);

	useEffect(() => {
		const handleClickOutside = (e) => {
			if (prefixDropdownRef.current && !prefixDropdownRef.current.contains(e.target)) {
				setShowPrefixDropdown(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	useEffect(() => {
		const setupAutocomplete = () => {
			if (!addressInputRef.current || !window.google || autocompleteRef.current) return;
			const ac = new window.google.maps.places.Autocomplete(
				addressInputRef.current,
				{ types: ["geocode", "establishment"], fields: ["formatted_address"] }
			);
			ac.addListener("place_changed", () => {
				const place = ac.getPlace();
				if (!place.formatted_address) return;
				setAddress(place.formatted_address);
			});
			autocompleteRef.current = ac;
		};

		if (window.google) {
			setupAutocomplete();
			return;
		}

		const existingScript = document.getElementById("google-maps-script");
		if (existingScript) {
			existingScript.addEventListener("load", setupAutocomplete);
			return () => existingScript.removeEventListener("load", setupAutocomplete);
		}

		const script = document.createElement("script");
		script.id = "google-maps-script";
		script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
		script.async = true;
		script.addEventListener("load", setupAutocomplete);
		document.head.appendChild(script);

		return () => { autocompleteRef.current = null; };
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		const load = async () => {
			const resp = await authService.getMe();
			const user = resp?.data ?? resp;
			if (user) {
				setData(user);
				setEmail(user.email || "");
				const { prefix, number } = splitPhone((user.profile && user.profile.phone) || "");
				setPhonePrefix(prefix);
				setPhoneNumber(number);
				setAddress((user.profile && user.profile.address) || "");
				setFirstname((user.profile && user.profile.firstname) || "");
				setLastname((user.profile && user.profile.lastname) || "");
				if (user.profile_picture_url) {
					setProfilePicturePreview(user.profile_picture_url);
				}
			}
		};
		load();
	}, []);

	const onSave = async () => {
		let profile_picture_url = null;

		if (profilePictureFile) {
			try {
				const uploadResp = await uploadService.uploadImage(profilePictureFile, "profiles");
				if (uploadResp && uploadResp.url) {
					profile_picture_url = uploadResp.url;
				}
			} catch (error) {
				alert("Error al subir la imagen de perfil.");
				return;
			}
		}

		const payload = {
			email,
			firstname,
			lastname,
			phone: phoneNumber.trim() ? `${phonePrefix}${phoneNumber}` : "",
			address,
			...(profile_picture_url ? { profile_picture_url } : {}),
		};
		const resp = await authService.updateProfile(payload);
		if (resp) {
			const updatedUser = resp?.data ?? resp;
			setData(updatedUser);
			if (updatedUser.profile_picture_url) {
				setProfilePicturePreview(updatedUser.profile_picture_url);
			}
			setSuccessMsg('Perfil actualizado correctamente.');
			setTimeout(() => setSuccessMsg(""), 4000);
			setIsEditing(false);
		} else {
			alert('Error al actualizar');
		}
	};

	const onDiscard = () => {
		if (!data) return;
		setEmail(data.email || "");
		const { prefix: dPrefix, number: dNumber } = splitPhone((data.profile && data.profile.phone) || "");
		setPhonePrefix(dPrefix);
		setPhoneNumber(dNumber);
		setAddress((data.profile && data.profile.address) || "");
		setFirstname((data.profile && data.profile.firstname) || "");
		setLastname((data.profile && data.profile.lastname) || "");
		setProfilePictureFile(null);
		setProfilePicturePreview(data.profile_picture_url || "");
		setShowPrefixDropdown(false);
		setIsEditing(false);
	};

	const handleProfilePictureChange = (event) => {
		const file = event.target.files && event.target.files[0];
		if (!file) return;
		setProfilePictureFile(file);
		setProfilePicturePreview(URL.createObjectURL(file));
	};

	const getJoinText = () => {
		const createdAt = data?.created_at;
		if (!createdAt) return "";
		try {
			const d = new Date(createdAt);
			const day = String(d.getDate()).padStart(2, '0');
			const month = String(d.getMonth() + 1).padStart(2, '0');
			const year = d.getFullYear();
			return `${day}/${month}/${year}`;
		} catch (error) {
			return "";
		}
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
					titleAccent="Mi"
					subtitle="Gestiona tu identidad. Exclusivo para quienes saben mirar entre lo olvidado."
					mascot={<i className="fa-solid fa-id-card account-mascot-icon" aria-hidden="true" />}
				/>
			</div>
			
			<article className="collector-file">
				<div className="collector-file-top">
					<div>
						<p className="collector-file-library">REGISTRO DEL DESVÁN</p>
						<h2 className="collector-file-title">CÉDULA PERSONAL</h2>
					</div>
					<span className="collector-file-number">Nº {FALLBACK.fileNumber}</span>
				</div>

				<div className="collector-file-body">
					<div className="collector-photo-block">
						<div className="collector-photo account-img-placeholder">
							{(profilePicturePreview || data?.profile_picture_url) ? (
								<img
									src={profilePicturePreview || data.profile_picture_url}
									alt="Foto de perfil"
									className="account-photo-preview"
								/>
							) : (
								<span className="collector-photo-placeholder-text">Sube tu foto</span>
							)}
							{isEditing && (
								<label className="collector-photo-upload">
									<span className="collector-photo-upload-label">Cambiar foto</span>
									<input type="file" accept="image/*" onChange={handleProfilePictureChange} />
								</label>
							)}
						</div>
						{data?.is_verified ? (
							<div className="profile-stamp">
								<i className="fa-solid fa-eye" />
								<span>IDENTIDAD VERIFICADA</span>
							</div>
						) : (
							<div className="profile-stamp profile-stamp--pending">
								<i className="fa-solid fa-clock" />
								<span>PENDIENTE DE VERIFICAR</span>
							</div>
						)}
					</div>

					<div className="collector-sections">
						<section className="collector-section">
							<h3 className="collector-section-header">IDENTIDAD PRIVADA</h3>
							<div className="collector-fields">
								<div className="collector-field">
									<label>
										<i className="fa-solid fa-user" /> NOMBRE
									</label>
									<input type="text" value={firstname} onChange={(e) => setFirstname(e.target.value)} disabled={!isEditing} />
								</div>
								<div className="collector-field">
									<label>
										<i className="fa-solid fa-user" /> APELLIDOS
									</label>
									<input type="text" value={lastname} onChange={(e) => setLastname(e.target.value)} disabled={!isEditing} />
								</div>
								<div className="collector-field">
									<label>
										<i className="fa-solid fa-phone" /> TELÉFONO DE CONTACTO
									</label>
									<div className="phone-input-group">
										<div className="phone-prefix-dropdown" ref={prefixDropdownRef}>
											<button
												type="button"
												className={`phone-prefix-btn${showPrefixDropdown ? " open" : ""}`}
												onClick={() => isEditing && setShowPrefixDropdown(prev => !prev)}
												disabled={!isEditing}
											>
												{PHONE_PREFIXES.find(p => p.code === phonePrefix)?.label ?? phonePrefix}
												{isEditing && <i className="fa-solid fa-chevron-down" />}
											</button>
											{showPrefixDropdown && isEditing && (
												<ul className="phone-prefix-list">
													{PHONE_PREFIXES.map(({ code, label }) => (
														<li key={code}>
															<button
																type="button"
																className={`phone-prefix-option${code === phonePrefix ? " phone-prefix-option--active" : ""}`}
																onClick={() => { setPhonePrefix(code); setShowPrefixDropdown(false); }}
															>
																{label}
															</button>
														</li>
													))}
												</ul>
											)}
										</div>
										<input
											type="tel"
											value={phoneNumber}
											onChange={(e) => setPhoneNumber(e.target.value)}
											disabled={!isEditing}
											placeholder="600 000 000"
										/>
									</div>
								</div>
								<div className="collector-field">
									<label>
										<i className="fa-solid fa-envelope" /> CORREO ELECTRÓNICO
									</label>
									<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={!isEditing} />
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
									<input ref={addressInputRef} type="text" value={address} onChange={(e) => setAddress(e.target.value)} disabled={!isEditing} autoComplete="off" />
								</div>
							</div>
						</section>
					</div>
				</div>
			</article>

			{successMsg && (
				<div className="alert alert-success alert-dismissible d-flex align-items-center gap-2" role="alert">
					<i className="fa-solid fa-circle-check" />
					<span>{successMsg}</span>
					<button type="button" className="btn-close" onClick={() => setSuccessMsg("")} aria-label="Cerrar" />
				</div>
			)}

			<div className="profile-actions">
				{!isEditing ? (
					<button type="button" className="profile-btn-save" onClick={() => setIsEditing(true)}>
						<i className="fa-solid fa-pen-to-square" /> Editar perfil
					</button>
				) : (
					<>
						<button type="button" className="profile-btn-discard" onClick={onDiscard}>
							<i className="fa-solid fa-xmark" /> Descartar cambios
						</button>
						<button type="button" className="profile-btn-save" onClick={onSave}>
							<i className="fa-solid fa-floppy-disk" /> Guardar cambios
						</button>
					</>
				)}
			</div>

			<aside className="profile-banner">
				<i class="fa-solid fa-address-card fa-2x"></i>

				<div className="profile-banner-text">
					<h3>Este es tu registro en el Desván</h3>
					<p>
						Tu ficha queda archivada en nuestros registros. Mantén tus datos
						actualizados para que el Desván pueda localizarte cuando surja un rastro
						imprescindible.
					</p>
				</div>

				<div className="profile-banner-logo">
					<i className="fa-solid fa-building-columns fa-2x" aria-hidden="true" />
					<span>
						BIBLIOTECA DEL DESVÁN
						<br />
						EST. 2026
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
