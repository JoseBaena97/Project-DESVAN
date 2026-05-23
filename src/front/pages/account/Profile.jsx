import { AccountPageHeader } from "../../components/account/AccountPageHeader";
import { useEffect, useState } from "react";
import authService from "../../services/auth.service";

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
		</div>
	);
};
