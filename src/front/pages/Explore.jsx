import { useState } from "react";
import caja05 from "../assets/img/caja05.png";

const CATEGORIES = ["Todos los rastros", "Muebles", "Ropa", "Joyería", "Libros", "Decoración", "Vintage"];

const EVENTS = [
    {
        id: 1,
        title: "Mercado de Motores",
        description: "Una cuidadosa selección de mobiliario vintage, ropa retro y curiosidades en un entorno industrial...",
        badge: { text: "Destacado", icon: "fa-star", type: "destacado" },
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=380&fit=crop",
    },
    {
        id: 2,
        title: "Feria de Almoneda",
        description: "Antigüedades clásicas, joyería de época y piezas únicas de coleccionista. Ideal para los más...",
        badge: null,
        image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&h=380&fit=crop",
    },
    {
        id: 3,
        title: "Mercado Vintage",
        description: "Exclusiva selección de prendas de los años 70 y 80, accesorios retro y moda circular de calidad.",
        badge: { text: "Especial Moda", icon: null, type: "moda" },
        image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&h=380&fit=crop",
    },
];

export const Explore = () => {
    const [selectedCategory, setSelectedCategory] = useState("Todos los rastros");
    const [distance, setDistance] = useState("10km");
    const [favorites, setFavorites] = useState({});


    

    const toggleFavorite = (id) => {
        setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
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

                        {/* Precio */}
                        <div className="filter-block">
                            <h4 className="filter-block-title">
                                <span className="filter-icon"><i className="fa-solid fa-coins"></i></span>
                                Precio
                            </h4>
                            <div className="price-inputs">
                                <input type="number" placeholder="Min €" className="price-input" />
                                <span className="price-dash">-</span>
                                <input type="number" placeholder="Max €" className="price-input" />
                            </div>
                        </div>

                        {/* Distancia */}
                        <div className="filter-block">
                            <h4 className="filter-block-title">
                                <span className="filter-icon"><i className="fa-solid fa-location-dot"></i></span>
                                Distancia
                            </h4>
                            <div className="radio-group">
                                {["5km", "10km", "50km"].map(d => (
                                    <label key={d} className="radio-label">
                                        <input
                                            type="radio"
                                            name="distance"
                                            value={d}
                                            checked={distance === d}
                                            onChange={() => setDistance(d)}
                                        />
                                        <span>Menos de {d}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Estado */}
                        <div className="filter-block">
                            <h4 className="filter-block-title">
                                <span className="filter-icon"><i className="fa-solid fa-tag"></i></span>
                                Estado
                            </h4>
                            <div className="checkbox-group">
                                {["Como nuevo", "Buen estado", "Usado"].map(estado => (
                                    <label key={estado} className="checkbox-label">
                                        <input type="checkbox" />
                                        <span>{estado}</span>
                                    </label>
                                ))}
                            </div>
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
                            <p className="explore-subtitle">Descubre tesoros ocultos.</p>
                        </div>
                        <div className="sort-control">
                            <span className="sort-label">Ordenar por: </span>
                            <span className="sort-value">
                                Recomendados <i className="fa-solid fa-chevron-down"></i>
                            </span>
                        </div>
                    </div>

                    <div className="events-grid">
                        {EVENTS.map(event => (
                            <div key={event.id} className="event-card">
                                <div className="event-img-wrapper">
                                    <img src={event.image} alt={event.title} className="event-img" />
                                    {event.badge && (
                                        <span className={`event-badge event-badge--${event.badge.type}`}>
                                            {event.badge.icon && <i className={`fa-solid ${event.badge.icon}`}></i>}
                                            {event.badge.text}
                                        </span>
                                    )}
                                    <button
                                        className={`event-fav-btn${favorites[event.id] ? " active" : ""}`}
                                        onClick={() => toggleFavorite(event.id)}
                                        aria-label="Añadir a favoritos"
                                    >
                                        <i className={favorites[event.id] ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>
                                    </button>
                                </div>
                                <div className="event-card-body">
                                    <h3 className="event-card-title">{event.title}</h3>
                                    <p className="event-card-desc">{event.description}</p>
                                    <button className="btn-ver-rastro">Ver rastro</button>
                                </div>
                            </div>
                        ))}

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
