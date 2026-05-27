export const AccountPageHeader = ({ title, titleAccent, subtitle }) => {
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
			{renderTitle()}
			{subtitle && <p className="account-page-subtitle">{subtitle}</p>}
		</header>
	);
};
