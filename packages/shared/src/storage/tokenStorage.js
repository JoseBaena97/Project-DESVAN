// Almacenamiento del token de sesión, independiente de la plataforma.
//
// La API es asíncrona para que funcione igual en la web (localStorage, síncrono)
// y en la app (expo-secure-store, asíncrono). Cada plataforma registra su
// adaptador al arrancar, antes de usar ningún service:
//
//   web:    configureTokenStorage(window.localStorage)
//   móvil:  configureTokenStorage({
//             getItem: SecureStore.getItemAsync,
//             setItem: SecureStore.setItemAsync,
//             removeItem: SecureStore.deleteItemAsync,
//           })
//
// Un adaptador es cualquier objeto con getItem/setItem/removeItem,
// síncronos o que devuelvan una promesa.

const TOKEN_KEY = 'token';

let adapter = null;

export function configureTokenStorage(storageAdapter) {
	adapter = storageAdapter;
}

function getAdapter() {
	if (!adapter) {
		throw new Error('tokenStorage sin configurar: llama a configureTokenStorage() al arrancar la app');
	}
	return adapter;
}

export const tokenStorage = {
	async get() {
		const token = await getAdapter().getItem(TOKEN_KEY);
		return token || null;
	},
	async set(token) {
		await getAdapter().setItem(TOKEN_KEY, token);
	},
	async remove() {
		await getAdapter().removeItem(TOKEN_KEY);
	},
};

// Cabecera Authorization lista para mezclar en fetch:
//   headers: { 'Content-Type': 'application/json', ...(await authHeader()) }
// Sin token devuelve {} en lugar de "Bearer null".
export async function authHeader() {
	const token = await tokenStorage.get();
	return token ? { Authorization: 'Bearer ' + token } : {};
}
