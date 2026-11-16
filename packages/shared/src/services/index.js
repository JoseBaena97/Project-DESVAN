// Services de la API, comunes a la web y a la app.
// Antes de usarlos, la plataforma debe llamar a configureApi() y configureTokenStorage().
export { default as adminService } from './admin.service.js';
export { default as authService } from './auth.service.js';
export { default as eventService } from './event.service.js';
export { default as favoriteService } from './favorite.service.js';
export { default as notificationService } from './notification.service.js';
export { default as reservationService } from './reservation.service.js';
export { default as reviewService } from './review.service.js';
export { default as uploadService } from './upload.service.js';
export { default as userService } from './user.service.js';
