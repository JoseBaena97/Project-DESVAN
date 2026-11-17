import { tokenStorage } from '../storage/index.js';
import authService from '../services/auth.service.js';

// Recupera la sesión guardada al arrancar la app.
//
// El store empieza con userLoading: true (sesión desconocida). Esta función
// lee el token de forma asíncrona y termina siempre con una de estas acciones:
//   - 'auth'   → hay token válido y se ha cargado el usuario
//   - 'logout' → no hay token, ha caducado o no se ha podido cargar el usuario
// Ambas dejan userLoading: false.
//
// Solo se borra el token si la API dice que ya no vale (401/422). Si el
// backend no responde (sin red, Render arrancando…) se conserva para
// reintentar en la siguiente apertura.
export async function restoreSession(dispatch) {
	const token = await tokenStorage.get();
	if (!token) {
		dispatch({ type: 'logout' });
		return;
	}

	try {
		const data = await authService.getMe();
		const user = data?.data ?? data;
		if (user) {
			dispatch({ type: 'auth', payload: { user } });
			return;
		}
	} catch (error) {
		if (error.status === 401 || error.status === 422) {
			await tokenStorage.remove();
		}
	}
	dispatch({ type: 'logout' });
}
