import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import caja05 from "../assets/img/caja05.png";
import eventService from "../services/event.service";
import favoriteService from "../services/favorite.service";
import authService from "../services/auth.service";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { Map } from "../components/Map";

const CATEGORIES = ["Todos los rastros", "Muebles", "Ropa", "Joyería", "Libros", "Decoración", "Vintage"];

export const Explore = () => {

    const [events, setEvents] = useState([]);

    const [selectedCategory, setSelectedCategory] = useState("Todos los rastros");

    const [distance, setDistance] = useState("10km");

    const [favoriteMap, setFavoriteMap] = useState({});

    // Estados para el mapa de eventos cercanos
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [nearbyEvents, setNearbyEvents] = useState([]);
    const [loadingNearby, setLoadingNearby] = useState(false);
    const [locationInput, setLocationInput] = useState("");
    const locationInputRef = useRef(null);
    const autocompleteRef = useRef(null);

    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();
    const location = useLocation();

    // Query de busqueda del navbar
    const searchParams = new URLSearchParams(location.search);
    const textQuery = searchParams.get("q") || "";

    const formatTime = (isoString) => {
        if (!isoString) return "";
        const date = new Date(isoString);
        return date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", hour12: false });
    };

    const formatDate = (isoString) => {
        if (!isoString) return "";
        const date = new Date(isoString);
        return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
    };

    const getEventBadge = (event) => {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrowStart = new Date(todayStart);
        tomorrowStart.setDate(todayStart.getDate() + 1);

        const toDateOnly = (iso) => {
            if (!iso) return null;
            const d = new Date(iso);
            return new Date(d.getFullYear(), d.getMonth(), d.getDate());
        };

        // Si start_date no está relleno, usamos la fecha que viene en start_time
        const startDateOnly = toDateOnly(event.start_date || event.start_time);
        // Para la fecha de fin: end_date → start_date → start_time (evento de un solo día)
        const endDateOnly = toDateOnly(event.end_date || event.start_date || event.start_time);

        // 1. Finalizado
        if (endDateOnly && endDateOnly < todayStart) {
            return { text: "Finalizado", type: "finalizado" };
        }

        // 2. Activo ahora: hoy está dentro del rango de fechas Y la hora actual está dentro del horario
        if (
            startDateOnly &&
            endDateOnly &&
            startDateOnly <= todayStart &&
            endDateOnly >= todayStart &&
            event.start_time &&
            event.end_time
        ) {
            const st = new Date(event.start_time);
            const et = new Date(event.end_time);
            const nowMins = now.getHours() * 60 + now.getMinutes();
            const openMins = st.getHours() * 60 + st.getMinutes();
            const closeMins = et.getHours() * 60 + et.getMinutes();
            // Si closeMins < openMins el evento cruza medianoche (ej. 22:30–02:30)
            const isActive =
                closeMins < openMins
                    ? nowMins >= openMins || nowMins <= closeMins
                    : nowMins >= openMins && nowMins <= closeMins;
            if (isActive) {
                return { text: "Activo ahora", type: "activo" };
            }
        }

        // 3. Hot: evento privado con >= 35 % de su cupo reservado
        if (
            event.event_type === "privado" &&
            event.max_capacity > 0 &&
            (event.reservations?.length || 0) / event.max_capacity >= 0.35
        ) {
            return { text: "Hot", type: "hot", icon: "fa-fire" };
        }

        // 4. Hoy
        if (startDateOnly && startDateOnly.toDateString() === todayStart.toDateString()) {
            return { text: "Hoy", type: "hoy" };
        }

        // 5. Mañana
        if (startDateOnly && startDateOnly.toDateString() === tomorrowStart.toDateString()) {
            return { text: "Mañana", type: "manana" };
        }

        return null;
    };

    const buildFavoriteMap = (loadedEvents, userId) => {
        return loadedEvents.reduce((map, event) => {
            const favorite = event.favorites?.find((fav) => fav.user?.id === userId);
            if (favorite) {
                map[event.id] = favorite.id;
            }
            return map;
        }, {});
    };

    // ── OBTENER EVENTOS CERCANOS ──
    const fetchNearbyEvents = async (lat, lon) => {
        if (!store.user) {
            navigate("/login");
            return;
        }

        setLoadingNearby(true);
        try {
            const distanceKm = parseInt(distance) || 10;
            const res = await eventService.getNearbyEvents(lat, lon, distanceKm);
            if (res?.data) {
                setNearbyEvents(res.data);
            }
        } catch (err) {
            console.log("Error fetching nearby events:", err);
        } finally {
            setLoadingNearby(false);
        }
    };

    // ── OBTENER GEOLOCALIZACIÓN ──
    const getUserLocation = () => {
        if (!store.user) {
            navigate("/login");
            return;
        }

        if ("geolocation" in navigator) {
            setLoadingNearby(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    setLatitude(lat);
                    setLongitude(lon);
                    setLocationInput("Ubicación actual");
                    fetchNearbyEvents(lat, lon);
                },
                (error) => {
                    console.log("Error getting location:", error);
                    alert("No se pudo obtener tu ubicación. Por favor, verifica los permisos.");
                    setLoadingNearby(false);
                }
            );
        } else {
            alert("Tu navegador no soporta geolocalización.");
        }
    };

    // ── GEOCODIFICAR DIRECCIÓN CON PLACE AUTOCOMPLETE ──
    const initPlaceAutocomplete = () => {
        // Cargar Google Maps con Place Autocomplete
        if (!window.google) {
            console.warn("Google Maps API no está cargada");
            return;
        }

        if (locationInputRef.current && !autocompleteRef.current) {
            const autocomplete = new window.google.maps.places.Autocomplete(
                locationInputRef.current,
                {
                    types: ["geocode"],
                    fields: ["formatted_address", "geometry", "name"]
                }
            );

            autocomplete.addListener("place_changed", () => {
                const place = autocomplete.getPlace();

                if (!place.geometry) {
                    alert("Por favor selecciona una ubicación de la lista");
                    return;
                }

                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();

                setLatitude(lat);
                setLongitude(lng);
                setLocationInput(place.formatted_address || place.name || "");
                fetchNearbyEvents(lat, lng);
            });

            autocompleteRef.current = autocomplete;
        }
    };

    // Cargar Google Maps API y Place Autocomplete
    useEffect(() => {
        const loadGoogleMapsAPI = () => {
            if (window.google && window.google.maps && window.google.maps.places) {
                initPlaceAutocomplete();
            } else if (!document.getElementById("google-maps-script")) {
                const script = document.createElement("script");
                script.id = "google-maps-script";
                script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
                script.async = true;
                script.onload = () => {
                    setTimeout(initPlaceAutocomplete, 100);
                };
                script.onerror = () => {
                    console.error("Error al cargar Google Maps API");
                };
                document.head.appendChild(script);
            }
        };

        if (store.user) {
            loadGoogleMapsAPI();
        }
    }, [store.user]);



    //Para que carguen los eventos
    useEffect(() => {
        const loader = localStorage.getItem("token") ? eventService.getEvents() : eventService.getEventsPublic();

        loader
            .then((data) => {
                const items = data?.data || [];
                setEvents(items);
                if (store.user) {
                    setFavoriteMap(buildFavoriteMap(items, store.user.id));
                }
            })
            .catch((err) => console.log(err));

    }, []);

    useEffect(() => {
        if (store.user && events.length) {
            setFavoriteMap(buildFavoriteMap(events, store.user.id));
        }
    }, [store.user, events]);

    // ── RE-BUSCAR EVENTOS CERCANOS CUANDO CAMBIA LA DISTANCIA ──
    useEffect(() => {
        if (latitude && longitude && store.user) {
            fetchNearbyEvents(latitude, longitude);
        }
    }, [distance, store.user]);



    const toggleFavorite = async (event) => {
        if (!store.user) {
            navigate("/login");
            return;
        }

        const favoriteId = favoriteMap[event.id];

        if (favoriteId) {
            const resp = await favoriteService.deleteFavorite(favoriteId);
            if (resp) {
                setEvents((prevEvents) =>
                    prevEvents.map((evt) =>
                        evt.id === event.id
                            ? { ...evt, favorites: (evt.favorites || []).filter((fav) => fav.id !== favoriteId) }
                            : evt
                    )
                );
                setFavoriteMap((prev) => {
                    const next = { ...prev };
                    delete next[event.id];
                    return next;
                });
            }
            return;
        }

        const resp = await favoriteService.createFavorite(event.id);
        if (resp?.favorite) {
            setEvents((prevEvents) =>
                prevEvents.map((evt) =>
                    evt.id === event.id
                        ? { ...evt, favorites: [...(evt.favorites || []), resp.favorite] }
                        : evt
                )
            );
            setFavoriteMap((prev) => ({ ...prev, [event.id]: resp.favorite.id }));
        }
    };
    return (
        <div className="explore-page">
            <div className="explore-layout">

                {/* ── Sidebar ── */}
                <aside className="filters-sidebar">
                    <div className="filters-panel">
                        <h3 className="filters-heading">Filtros</h3>
                        <p className="filters-sub">Refina tu búsqueda</p>
                        <hr className="filters-hr" />

                        {/* Categorías */}
                        <div className="filter-block">
                            <h4 className="filter-block-title">
                                <span className="filter-icon"><i className="fa-solid fa-user-group"></i></span>
                                Categorías
                            </h4>
                            <ul className="categories-list">
                                {CATEGORIES.map(cat => (
                                    <li
                                        key={cat}
                                        className={`category-item${selectedCategory === cat ? " active" : ""}`}
                                        onClick={() => setSelectedCategory(cat)}
                                    >
                                        {cat}
                                        {selectedCategory === cat && <span className="cat-arrow">›</span>}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Fecha */}
                        <div className="filter-block">
                            <h4 className="filter-block-title">
                                <span className="filter-icon"><i className="fa-solid fa-calendar-days"></i></span>
                                Fecha
                            </h4>
                            <div className="select-wrapper">
                                <select className="date-select">
                                    <option>Este fin de semana</option>
                                    <option>Esta semana</option>
                                    <option>Este mes</option>
                                    <option>Cualquier fecha</option>
                                </select>
                                <i className="fa-solid fa-chevron-down select-arrow"></i>
                            </div>
                        </div>

                        <button className="btn-apply-filters">Aplicar Filtros</button>
                    </div>
                </aside>

                {/* ── Main content ── */}
                <main className="explore-main">
                    <div className="explore-header">
                        <div className="explore-header-left">
                            <h1 className="explore-title">Rastros para ti</h1>
                            <div className="create-event-title-line"></div>
                            <p className="explore-subtitle">Descubre tesoros ocultos.</p>
                        </div>
                        <div className="sort-control">
                            <span className="sort-label">Ordenar por: </span>
                            <span className="sort-value">
                                Recomendados <i className="fa-solid fa-chevron-down"></i>
                            </span>
                        </div>
                    </div>

                    {/* ── MAPA DE EVENTOS CERCANOS (solo usuarios logueados) ── */}
                    {store.user && (
                        <section className="nearby-events-section">
                            <div className="nearby-header">
                                <h2 className="nearby-title">
                                    <i className="fa-solid fa-map"></i> Rastros cercanos a tu ubicación
                                </h2>
                            </div>

                            <div className="nearby-controls">
                                <div className="location-form">
                                    <input
                                        ref={locationInputRef}
                                        type="text"
                                        placeholder="Ingresa una dirección o ciudad..."
                                        className="location-input"
                                        autoComplete="off"
                                    />
                                </div>

                                <button
                                    className="btn-current-location"
                                    onClick={getUserLocation}
                                    disabled={loadingNearby}
                                >
                                    <i className="fa-solid fa-location-crosshairs"></i>
                                    {loadingNearby ? "Buscando..." : "Mi ubicación"}
                                </button>
                            </div>

                            {latitude && longitude && (
                                <div className="nearby-content">
                                    <div className="nearby-map-wrapper">
                                        <Map
                                            latitude={latitude}
                                            longitude={longitude}
                                            zoom={13}
                                        />
                                    </div>

                                    <div className="nearby-list">
                                        <div className="nearby-list-header">
                                            <h3 className="nearby-count">
                                                {nearbyEvents.length} rastros a {distance} de distancia
                                            </h3>
                                            <div className="distance-selector">
                                                {["5km", "10km", "50km"].map(d => (
                                                    <button
                                                        key={d}
                                                        className={`distance-btn ${distance === d ? "active" : ""}`}
                                                        onClick={() => setDistance(d)}
                                                    >
                                                        {d}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {nearbyEvents.length > 0 ? (
                                            <div className="nearby-items">
                                                {nearbyEvents.map((item) => (
                                                    <div key={item.event.id} className="nearby-item">
                                                        <div className="nearby-item-header">
                                                            <h4>{item.event.title}</h4>
                                                            <span className="nearby-distance">
                                                                {item.distance_km} km
                                                            </span>
                                                        </div>
                                                        <p className="nearby-item-address">
                                                            <i className="fa-solid fa-location-dot"></i>
                                                            {item.event.exact_address}
                                                        </p>
                                                        <Link to={`/detalles/${item.event.id}`}>
                                                            <button className="btn-view-event">
                                                                Ver rastro
                                                            </button>
                                                        </Link>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="nearby-empty">
                                                <p>No hay rastros cercanos en esta zona</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </section>
                    )}

                    <div className="events-grid">
                        {events?.filter(event => {
                            if (!textQuery) return true;
                            const q = textQuery.toLowerCase();
                            const inTitle = event.title?.toLowerCase().includes(q);
                            const inDesc = event.description?.toLowerCase().includes(q);
                            const inTags = event.tags?.toLowerCase().includes(q);
                            const inAddress = event.exact_address?.toLowerCase().includes(q);
                            return inTitle || inDesc || inTags || inAddress;
                        }).map(event => {
                            const badge = store.user ? getEventBadge(event) : null;
                            return (
                                <div key={event.id} className="event-card">
                                    <div className="event-img-wrapper">
                                        <img src={event.image_url?.cover || event.image} alt={event.title} className="event-img" />

                                        <button
                                            className={`event-fav-btn${favoriteMap[event.id] ? " active" : ""}`}
                                            onClick={() => toggleFavorite(event)}
                                            aria-label={favoriteMap[event.id] ? "Quitar de favoritos" : "Añadir a favoritos"}
                                        >
                                            <i className={favoriteMap[event.id] ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>
                                        </button>
                                    </div>

                                    <div className="event-card-body">
                                        <div className="event-card-title-row">
                                            <h3 className="event-card-title">{event.title}</h3>
                                            {badge && (
                                                <span className={`event-card-date-badge event-card-date-badge--${badge.type}`}>
                                                    {badge.icon && <i className={`fa-solid ${badge.icon}`}></i>}
                                                    {badge.text}
                                                </span>
                                            )}
                                        </div>
                                        <p className="event-card-desc">{event.description}</p>

                                        {store.user && (
                                            <div className="event-card-meta">
                                                <span className="event-card-meta-item">
                                                    <i className="fa-solid fa-location-dot"></i>
                                                    {event.exact_address}
                                                </span>
                                                <span className="event-card-meta-item">
                                                    <i className="fa-regular fa-calendar"></i>
                                                    {formatDate(event.start_date || event.start_time)} · {formatTime(event.start_time)} - {formatTime(event.end_time)}
                                                </span>
                                            </div>
                                        )}

                                        <Link to={`/detalles/${event.id}`}>
                                            <button className="btn-ver-rastro">Ver rastro</button>
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Discover more card */}
                        <div className="event-card discover-card">
                            <div className="discover-inner">
                                <img src={caja05} alt="mascota" className="discover-mascot" />
                                <h3 className="discover-title">Descubre más</h3>
                                <p className="discover-text">
                                    Amplía tu zona de búsqueda y encuentra verdaderos tesoros escondidos en la región.
                                </p>
                                <button className="btn-explore-map">Explorar mapa completo</button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};
