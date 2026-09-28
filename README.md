<div align="center">

# 🏡 El Desván

### La plataforma para descubrir y organizar mercadillos, mercados artesanales y garage sales

*Conecta a vendedores que organizan eventos con clientes que quieren descubrirlos, reservar plaza y vivirlos.*

[![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react&logoColor=white&style=flat-square)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-4.4-646CFF?logo=vite&logoColor=white&style=flat-square)](https://vitejs.dev/)
[![Flask](https://img.shields.io/badge/Flask-2.3-000000?logo=flask&logoColor=white&style=flat-square)](https://flask.palletsprojects.com/)
[![Python](https://img.shields.io/badge/Python-3.13-3776AB?logo=python&logoColor=white&style=flat-square)](https://www.python.org/)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0-D71F00?logo=sqlalchemy&logoColor=white&style=flat-square)](https://www.sqlalchemy.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white&style=flat-square)](https://www.postgresql.org/)
[![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white&style=flat-square)](https://jwt.io/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media-3448C5?logo=cloudinary&logoColor=white&style=flat-square)](https://cloudinary.com/)

</div>

---

## 📖 Sobre el proyecto

**El Desván** es una aplicación web full-stack tipo marketplace de eventos locales. Cualquier usuario puede publicar un evento de venta —**mercadillo**, **mercado artesanal** o **casa abierta** (al estilo *garage sale* estadounidense)— definiendo si es **público** (acceso libre) o **privado** (con **reserva de plaza y control de aforo**). Los usuarios interesados pueden explorar eventos cercanos en el mapa, filtrar por categoría/etiquetas, guardarlos como favoritos, reservar plaza, valorar al organizador tras el evento y construir así una reputación dentro de la comunidad.

No existen "roles" rígidos: **cualquier usuario es a la vez potencial vendedor y potencial cliente** — basta con completar el perfil (teléfono y dirección verificados) para poder publicar un evento propio.

El proyecto se construyó como una aplicación real de producción: autenticación segura, subida de imágenes a la nube, geolocalización, notificaciones in-app, sistema de reseñas y reputación, moderación de contenido con reportes, y un **panel de administración (backoffice)** completo para la gestión de la plataforma.

---

## ✨ Funcionalidades principales

| Área | Detalle |
|---|---|
| 🔐 **Autenticación** | Registro/login con JWT, recuperación de contraseña por email con token temporal, sesión persistida y rutas protegidas |
| 🗓️ **Gestión de eventos** | Alta, edición y borrado de eventos con galería de imágenes, fechas/horarios, categorías y etiquetas |
| 🌍 **Geolocalización** | Ubicación exacta por evento, mapa embebido y búsqueda de eventos cercanos (cálculo de distancia por fórmula de Haversine) |
| 🔒 **Eventos públicos y privados** | Los privados requieren reserva de plaza con control de aforo (`max_capacity`) |
| 📅 **Reservas** | Reserva/cancelación de plaza, validaciones de aforo y de reservas duplicadas |
| ⭐ **Reputación y reseñas** | Valoraciones entre usuarios ligadas a cada evento, con recálculo automático de rating |
| ❤️ **Favoritos** | Guardado de eventos de interés para consulta rápida |
| 🔔 **Notificaciones in-app** | Avisos automáticos de nuevas reservas, reseñas recibidas, eventos cancelados y recordatorios 24h antes del evento |
| 🚩 **Reportes y moderación** | Sistema de denuncias entre usuarios con resolución desde el backoffice |
| 🖼️ **Imágenes en la nube** | Subida de fotos de perfil y galerías de eventos a Cloudinary |
| 🛠️ **Panel de administración** | Backoffice con estadísticas, gestión de usuarios (suspender/restaurar), eventos, reseñas y reportes |
| 👤 **Perfil público de vendedor** | Página pública por usuario con sus eventos y valoraciones |

---

## 🧰 Stack tecnológico

### Frontend
- **React 18** — construcción de interfaz por componentes
- **Vite** — bundler y servidor de desarrollo
- **React Router DOM 6** — enrutado y guardas de ruta (`ProtectedRoute`, `AdminRoute`)
- **Context API + useReducer** — gestión de estado global propia (sin librerías externas)
- **CSS modular** por componente/página
- **Fetch API** encapsulada en una capa de *services* por entidad

### Backend
- **Python 3.13 + Flask 2.3** — API REST
- **SQLAlchemy 2.0 + Flask-SQLAlchemy** — ORM (sintaxis moderna `Mapped` / `mapped_column`)
- **Flask-Migrate (Alembic)** — control de versiones del esquema de base de datos
- **Flask-JWT-Extended** — autenticación basada en tokens
- **Flask-Mail** — envío de emails transaccionales (recuperación de contraseña)
- **Flask-CORS** — comunicación segura entre frontend y backend
- **Flask-Admin** — panel administrativo a nivel de datos
- **Cloudinary SDK** — almacenamiento y entrega de imágenes
- **Werkzeug** — hashing seguro de contraseñas
- **Gunicorn** — servidor WSGI de producción

### Base de datos e infraestructura
- **PostgreSQL** (producción) / **SQLite** (desarrollo local)
- **Render.com** — despliegue continuo (backend + frontend)

---

## 🏗️ Arquitectura del proyecto

```
Project-DESVAN/
├── src/
│   ├── app.py                    # Entry point de Flask (config JWT, Mail, CORS, DB)
│   ├── wsgi.py                   # Entry point para Gunicorn (producción)
│   ├── api/                      # Backend
│   │   ├── models.py             # Modelos SQLAlchemy (User, Event, Reservation...)
│   │   ├── routes.py             # Registro del blueprint principal
│   │   ├── admin.py              # Configuración de Flask-Admin
│   │   ├── commands.py           # Comandos CLI (seed de datos de demo)
│   │   └── custom_routes/        # Endpoints organizados por entidad
│   │       ├── auth.py, user.py, profile.py
│   │       ├── event.py, category.py, tag.py
│   │       ├── reservation.py, favorite.py, review.py
│   │       ├── notification.py, report.py, admin.py
│   │       └── upload.py, email_service.py
│   │
│   └── front/                    # Frontend React
│       ├── routes.jsx            # Definición de rutas
│       ├── store.js              # Estado global (Context + Reducer)
│       ├── components/           # Navbar, Footer, Map, NotificationBell...
│       ├── pages/
│       │   ├── Home, Explore, Details, CreateEvent, Login...
│       │   ├── account/          # Perfil, favoritos, mis eventos, reservas, reseñas
│       │   └── admin/            # Backoffice: dashboard, usuarios, eventos, reportes
│       └── services/             # Capa de comunicación con la API (fetch)
│
├── migrations/                   # Migraciones de base de datos (Alembic)
├── render.yaml, render_build.sh  # Configuración de despliegue en Render
└── Pipfile / package.json        # Dependencias backend / frontend
```

---

## 🗃️ Modelo de datos (resumen)

- **User** — cuenta con email, contraseña hasheada, rating y estado de verificación
- **Profile** — datos personales (nombre, teléfono, dirección) necesarios para publicar eventos
- **Event** — evento con tipo (público/privado), estado, fechas, aforo, ubicación y galería de imágenes
- **Reservation** — reserva de plaza de un usuario en un evento, con control de estado y aforo
- **Review** — valoración y comentario entre usuarios, asociada a un evento
- **Favorite** — relación usuario–evento para marcar favoritos
- **Category / Tag** — clasificación de eventos (relación muchos a muchos)
- **Report** — denuncias entre usuarios con motivo y resolución
- **Notification** — notificaciones in-app generadas por eventos del sistema

---

## 🚀 Puesta en marcha local

### Requisitos previos
- Python 3.13 + [Pipenv](https://pipenv.pypa.io/)
- Node.js ≥ 20
- PostgreSQL (o SQLite para pruebas rápidas)
- Cuenta de [Cloudinary](https://cloudinary.com/) (para subida de imágenes)

### Backend

```bash
# 1. Instalar dependencias
pipenv install

# 2. Configurar variables de entorno
cp .env.example .env

# 3. Aplicar migraciones
pipenv run migrate
pipenv run upgrade

# 4. (Opcional) Poblar la base de datos con datos de demo
pipenv run insert-test-data

# 5. Arrancar el servidor Flask
pipenv run start
```

### Frontend

```bash
# 1. Instalar dependencias
npm install

# 2. Arrancar el servidor de desarrollo (Vite)
npm run dev
```

### Variables de entorno principales

```env
DATABASE_URL=postgres://usuario:password@localhost:5432/eldesvan
FLASK_APP=src/app.py
FLASK_APP_KEY=una-clave-secreta
JWT_SECRET_KEY=otra-clave-secreta   # obligatoria en producción

# Frontend
VITE_BACKEND_URL=http://localhost:3001/
VITE_GOOGLE_MAPS_API_KEY=

# Envío de emails (recuperación de contraseña)
MAIL_SERVER=
MAIL_PORT=
MAIL_USE_TLS=
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_DEFAULT_SENDER=

# Subida de imágenes
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## 📦 Despliegue

Desplegado en **Render.com** mediante `render.yaml`: `render_build.sh` compila el frontend con Vite e instala las dependencias de Python, y el servicio aplica las migraciones y arranca Flask con Gunicorn, que sirve también el frontend compilado.

---

## 👥 Autores

| | |
|---|---|
| **Jose Baena** | [github.com/JoseBaena97](https://github.com/JoseBaena97) |
| **Alicia López** | [github.com/Alicia2202](https://github.com/Alicia2202) |

---

<div align="center">

Hecho con 🧡 combinando React y Flask para conectar comunidades a través de sus mercadillos y ferias locales.

</div>
