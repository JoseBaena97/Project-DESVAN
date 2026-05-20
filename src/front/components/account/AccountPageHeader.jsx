export const AccountPageHeader = ({ title, titleAccent, subtitle, mascotComment }) => {
	const renderTitle = () => {
		if (!titleAccent || !title.includes(titleAccent)) {
			return <h1 className="account-page-title account-page-title--full">{title}</h1>;
		}

		const [before, after] = title.split(titleAccent);

		return (
			<h1 className="account-page-title">
				<span className="account-title-accent">{titleAccent}</span>
				{before}
				{after}
			</h1>
		);
	};

	return (
		<header className="account-page-header">
			<div className="account-page-header-text">
				{renderTitle()}
				{subtitle && <p className="account-page-subtitle">{subtitle}</p>}
			</div>

			<div className="account-page-mascot">
				{/* TODO: Coloca aquí la mascota/ilustración de la cabecera de esta página
				    <img src={rutaATuMascota} alt="" className="account-mascot-img" />
				*/}
				<div className="account-mascot-placeholder account-img-placeholder" aria-hidden="true" />
				{mascotComment && <span className="visually-hidden">{mascotComment}</span>}
			</div>
		</header>
	);
};
