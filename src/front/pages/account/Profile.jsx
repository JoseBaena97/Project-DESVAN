import { AccountPageHeader } from "../../components/account/AccountPageHeader";

const DEFAULT_PROFILE = {
	fileNumber: "000241",
	joinDate: "15 ABR 2023",
	displayName: "Archibald_Vance",
	legalName: "Archibald Vance",
	phone: "+34 612 345 678",
	email: "archibald.vance@desvan.es",
	address: "Calle del Rastro, 12, 3º B",
	city: "Madrid",
	postalCode: "28005",
};

export const Profile = () => {
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
					<span className="collector-file-number">Nº {DEFAULT_PROFILE.fileNumber}</span>
				</div>

				<div className="collector-file-body">
					<div className="collector-photo-block">
						{/* TODO: Foto principal del coleccionista (retrato B/N estilo polaroid)
						    <img src={rutaATuFotoPerfil} alt="Archibald Vance" className="collector-photo" />
						*/}
						<div className="collector-photo account-img-placeholder" aria-hidden="true" />

						<p className="collector-photo-name">Archibald Vance</p>

						<div className="collector-data-boxes">
							<div className="collector-data-box">
								<label>
									<i className="fa-regular fa-calendar" /> FECHA DE ALTA
								</label>
								<span>{DEFAULT_PROFILE.joinDate}</span>
							</div>
							<div className="collector-data-box">
								<label>NOMBRE EN EL DESVÁN</label>
								<span>{DEFAULT_PROFILE.displayName}</span>
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
									<input type="text" defaultValue={DEFAULT_PROFILE.legalName} readOnly />
								</div>
								<div className="collector-field">
									<label>
										<i className="fa-solid fa-phone" /> TELÉFONO DE CONTACTO
									</label>
									<input type="text" defaultValue={DEFAULT_PROFILE.phone} readOnly />
								</div>
								<div className="collector-field collector-field--full">
									<label>
										<i className="fa-solid fa-envelope" /> CORREO ELECTRÓNICO
									</label>
									<input type="email" defaultValue={DEFAULT_PROFILE.email} readOnly />
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
									<input type="text" defaultValue={DEFAULT_PROFILE.address} readOnly />
								</div>
								<div className="collector-field">
									<label>
										<i className="fa-solid fa-city" /> CIUDAD / PROVINCIA
									</label>
									<input type="text" defaultValue={DEFAULT_PROFILE.city} readOnly />
								</div>
								<div className="collector-field">
									<label>
										<i className="fa-solid fa-mailbox" /> CÓDIGO POSTAL
									</label>
									<input type="text" defaultValue={DEFAULT_PROFILE.postalCode} readOnly />
								</div>
							</div>
						</section>
					</div>
				</div>
			</article>

			<div className="profile-actions">
				<button type="button" className="profile-btn-discard">
					<i className="fa-solid fa-xmark" /> Descartar cambios
				</button>
				<button type="button" className="profile-btn-save">
					<i className="fa-solid fa-floppy-disk" /> Guardar cambios
				</button>
			</div>

			<aside className="profile-banner">
				{/* TODO: Icono del documento/perfil del banner inferior
				    <img src={rutaAlIconoDocumento} alt="" className="profile-banner-icon" />
				*/}
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
					{/* TODO: Logo de la Biblioteca del Desván (templo / sello)
					    <img src={rutaAlLogoBiblioteca} alt="Biblioteca del Desván" />
					*/}
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
