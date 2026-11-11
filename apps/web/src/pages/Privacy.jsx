import { Link } from "react-router-dom";
import "./Legal.css";

// TODO: sustituir por el correo real de contacto antes de publicar en Play Store
const CONTACT_EMAIL = "privacidad@el-desvan.com";
const LAST_UPDATED = "11 de noviembre de 2026";

const DATA_ROWS = [
	["Cuenta", "Email, nombre de usuario y contraseña (guardada cifrada).", "Crear tu cuenta e iniciar sesión."],
	["Perfil", "Nombre, apellidos, teléfono, dirección, biografía y foto de perfil.", "Mostrar tu ficha de vendedor y verificar tu cuenta."],
	["Ubicación", "Tu posición aproximada, solo si das permiso en el navegador o en la app. Dirección y coordenadas de los eventos que publicas.", "Buscar mercadillos cerca de ti y situarlos en el mapa. Tu posición no se guarda."],
	["Fotos", "Imágenes de eventos y foto de perfil que subes.", "Mostrarlas en la plataforma."],
	["Actividad", "Eventos, reservas, favoritos, valoraciones, notificaciones y reportes.", "Prestar el servicio y moderar la comunidad."],
];

const PROVIDERS = [
	["Render", "Alojamiento de la web, la API y la base de datos."],
	["Cloudinary", "Almacenamiento de las imágenes que subes."],
	["Google Maps", "Mapas y autocompletado de direcciones."],
	["Proveedor de correo (SMTP)", "Envío de emails de recuperación de contraseña."],
];

export const Privacy = () => (
	<main className="legal-page">
		<div className="legal-page-inner">
			<h1>Política de privacidad</h1>
			<p className="legal-updated">Última actualización: {LAST_UPDATED}</p>

			<p>
				Esta política explica qué datos recoge El Desván (la web y la app para Android),
				para qué los usa y cómo puedes borrarlos.
			</p>

			<h2>Qué datos recogemos</h2>
			<table className="legal-table">
				<thead>
					<tr><th>Tipo</th><th>Datos</th><th>Para qué</th></tr>
				</thead>
				<tbody>
					{DATA_ROWS.map(([type, data, purpose]) => (
						<tr key={type}><td>{type}</td><td>{data}</td><td>{purpose}</td></tr>
					))}
				</tbody>
			</table>
			<p>
				No vendemos tus datos ni los usamos para publicidad. La base legal es la ejecución
				del servicio que aceptas al registrarte (art. 6.1.b del RGPD).
			</p>

			<h2>Con quién se comparten</h2>
			<p>Solo con los proveedores que necesitamos para que el servicio funcione:</p>
			<table className="legal-table">
				<tbody>
					{PROVIDERS.map(([name, use]) => (
						<tr key={name}><td>{name}</td><td>{use}</td></tr>
					))}
				</tbody>
			</table>
			<p>
				Otros usuarios ven tu nombre de usuario, foto, biografía, valoraciones y los eventos
				que publicas. Tu email, teléfono y dirección personal no son públicos.
			</p>

			<h2>Cuánto tiempo los guardamos</h2>
			<p>
				Mientras tengas la cuenta. Si la eliminas, borramos tu perfil, eventos, reservas,
				favoritos, valoraciones y notificaciones. Solo conservamos, sin datos personales,
				los reportes de moderación en los que aparezcas.
			</p>

			<h2>Tus derechos</h2>
			<p>
				Puedes acceder, corregir o borrar tus datos, oponerte a su uso o pedir una copia
				escribiendo a <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Puedes editar
				tu perfil desde la propia cuenta y{" "}
				<Link to="/eliminar-cuenta">eliminar tu cuenta aquí</Link>, sin necesidad de la app.
				Si crees que no hemos atendido tu solicitud, puedes reclamar ante la Agencia Española
				de Protección de Datos (<a href="https://www.aepd.es" target="_blank" rel="noreferrer">aepd.es</a>).
			</p>

			<h2>Seguridad</h2>
			<p>
				Las contraseñas se guardan cifradas y las comunicaciones van por HTTPS. En la app,
				la sesión se guarda en el almacenamiento seguro del dispositivo.
			</p>
		</div>
	</main>
);
