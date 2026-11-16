// URL del backend, inyectada por cada plataforma al arrancar:
//
//   web:    configureApi({ baseUrl: import.meta.env.VITE_BACKEND_URL })
//   móvil:  configureApi({ baseUrl: process.env.EXPO_PUBLIC_BACKEND_URL })
//
// Los services no leen variables de entorno: así el mismo código sirve
// para Vite y para Expo.

const API_PREFIX = 'api/v1/';

let backendUrl = null;

export function configureApi({ baseUrl } = {}) {
	if (!baseUrl) {
		backendUrl = null;
		return;
	}
	backendUrl = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
}

// Raíz del backend, con barra final: "https://el-desvan.onrender.com/"
export function getBackendUrl() {
	if (!backendUrl) {
		throw new Error('API sin configurar: llama a configureApi({ baseUrl }) al arrancar la app');
	}
	return backendUrl;
}

// Base de los endpoints versionados: "https://el-desvan.onrender.com/api/v1/"
//   fetch(getApiUrl() + 'event/public')
export function getApiUrl() {
	return getBackendUrl() + API_PREFIX;
}
