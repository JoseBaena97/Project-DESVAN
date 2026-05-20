import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./Details.css";
import caja04 from "../assets/img/caja04.png";

// Datos para coincidir con Explore.jsx
const EVENT_DETAILS = {
  1: {
    title: "Mercado de Motores",
    subtitle: "El encuentro vintage más grande de Madrid, rodeado de trenes históricos.",
    badge: { text: "Destacado", icon: "fa-star" },
    location: "Museo del Ferrocarril, Madrid",
    address: "Paseo de las Delicias, 61, 28045 Madrid",
    date: "12-13 Noviembre",
    dateDetail: "12 y 13 de Noviembre / Sábado y Domingo",
    time: "11:00 - 22:00",
    timeDetail: "11:00 - 22:00 hrs. / Entrada libre hasta completar aforo",
    category: "Mercadillo",
    interested: 232,
    images: {
      main: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1000&auto=format&fit=crop&q=80",
      thumb1: "https://images.unsplash.com/photo-1539625318660-15967d64ecde?w=500&auto=format&fit=crop&q=80",
      thumb2: "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=500&auto=format&fit=crop&q=80",
      thumb3: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=500&auto=format&fit=crop&q=80",
      thumb4: "https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=500&auto=format&fit=crop&q=80",
    },
    description: [
      "Sumérgete en la histórica atmósfera del Mercado de Motores, un evento mensual imprescindible donde la creatividad y el coleccionismo vintage se dan la mano.",
      "Vente a recorrer decenas de stands de diseño, decoración retro, moda clásica, joyería de autor y coleccionables extraños, todo ello rodeado de imponentes locomotoras de vapor y vagones de época en el Museo del Ferrocarril de Madrid.",
      "Es el plan perfecto de fin de semana para encontrar tesoros únicos con los que decorar tu hogar o renovar tu estilo, mientras disfrutas de una jornada entrañable y diferente.",
      "La experiencia se completa con una vibrante zona exterior de food trucks con música en acústico, donde podrás almorzar o tomar una cerveza artesanal fresca. ¡Ven a dejarte contagiar por la magia del coleccionismo!"
    ]
  },
  2: {
    title: "Feria de Almoneda",
    subtitle: "Antigüedades clásicas, joyería de época y piezas únicas de coleccionista.",
    badge: { text: "Recomendado", icon: "fa-thumbs-up" },
    location: "IFEMA, Madrid",
    address: "Av. del Partenón, 5, Barajas, 28042 Madrid",
    date: "18-22 Noviembre",
    dateDetail: "18 al 22 de Noviembre / Miércoles a Domingo",
    time: "12:00 - 21:00",
    timeDetail: "12:00 - 21:00 hrs. / Acceso con entrada y taquilla disponible",
    category: "Antigüedades",
    interested: 184,
    images: {
      main: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=1000&auto=format&fit=crop&q=80",
      thumb1: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=500&auto=format&fit=crop&q=80",
      thumb2: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500&auto=format&fit=crop&q=80",
      thumb3: "https://images.unsplash.com/photo-1531988042231-d39a9cc12a9a?w=500&auto=format&fit=crop&q=80",
      thumb4: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500&auto=format&fit=crop&q=80",
    },
    description: [
      "La Feria de Almoneda es un escaparate fascinante para los apasionados de los objetos con alma e historia. Miles de piezas genuinas de colección listas para encontrar un nuevo hogar.",
      "Desde mobiliario vanguardista de mediados del siglo XX hasta cámaras fotográficas antiguas, numismática, pinturas al óleo clásicas y exquisitos relojes vintage de cuerda.",
      "Un paseo en el tiempo donde cada stand cuenta una anécdota y cada objeto nos transporta a los talleres y hogares de otras épocas.",
      "Disfruta del asesoramiento directo de reconocidos anticuarios nacionales e internacionales en un entorno seguro y agradable. ¡Hazte con esa pieza icónica que estabas buscando!"
    ]
  },
  3: {
    title: "Mercado Vintage",
    subtitle: "Exclusiva selección de prendas de los años 70 y 80, accesorios retro y moda circular de calidad.",
    badge: { text: "Especial Moda", icon: "fa-shirt" },
    location: "Malasaña, Madrid",
    address: "Calle de Velarde, 14, Centro, 28004 Madrid",
    date: "25-26 Noviembre",
    dateDetail: "25 y 26 de Noviembre / Sábado y Domingo",
    time: "11:00 - 20:00",
    timeDetail: "11:00 - 20:00 hrs. / Entrada libre hasta completar aforo",
    category: "Ropa Retro",
    interested: 147,
    images: {
      main: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1000&auto=format&fit=crop&q=80",
      thumb1: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=500&auto=format&fit=crop&q=80",
      thumb2: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&auto=format&fit=crop&q=80",
      thumb3: "https://images.unsplash.com/photo-1509319117193-57bab727e09d?w=500&auto=format&fit=crop&q=80",
      thumb4: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=500&auto=format&fit=crop&q=80",
    },
    description: [
      "El Mercado Vintage de Malasaña es el epicentro de la moda circular y del estilo retro de la capital. Una selección rigurosa para quienes buscan prendas con identidad propia.",
      "Encuentra chaquetas vaqueras de los 80, camisas de seda estampadas, bolsos retro impecablemente restaurados, gafas de sol pin-up y accesorios nostálgicos singulares.",
      "Todas las prendas expuestas han sido previamente seleccionadas y desinfectadas por coleccionistas apasionados de la moda clásica, garantizando su autenticidad y excelente estado.",
      "Disfruta de una atmósfera inigualable con música funk y soul de fondo pinchada en discos de vinilo y cócteles artesanales inspirados en los clásicos del siglo pasado."
    ]
  }
};

export const Details = () => {
  const { eventId } = useParams();

  // Seleccionar datos del evento en función de la ID en la ruta o por defecto Mercado de Motores (ID 1)
  const selectedId = eventId && EVENT_DETAILS[eventId] ? parseInt(eventId) : 1;
  const event = EVENT_DETAILS[selectedId];

  // Estados locales para la interactividad de la página
  const [isSaved, setIsSaved] = useState(false);
  const [isReserved, setIsReserved] = useState(false);
  const [shareFeedback, setShareFeedback] = useState("");
  const [showAllModal, setShowAllModal] = useState(false);

  // Copiar enlace simulado y dar retroalimentación interactiva
  const handleShare = () => {
    const fakeUrl = `${window.location.origin}/single/${eventId}`;
    navigator.clipboard.writeText(fakeUrl)
      .then(() => {
        setShareFeedback("¡Enlace copiado!");
        setTimeout(() => setShareFeedback(""), 2000);
      })
      .catch(() => {
        setShareFeedback("Error al copiar");
        setTimeout(() => setShareFeedback(""), 2000);
      });
  };

  const toggleSave = () => {
    setIsSaved(prev => !prev);
  };

  const handleReserve = () => {
    setIsReserved(prev => !prev);
  };

  // Truquito para Google Maps
  const encodedAddress = encodeURIComponent(event.address);
  const mapUrl = `https://maps.google.com/maps?q=${encodedAddress}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="event-detail-page page-transition">
      <div className="event-detail-container">
        
        {/* ── COLUMNA PRINCIPAL (Contenido del Evento) ── */}
        <main className="event-main-content">
          
          {/* Badge Destacado */}
          {event.badge && (
            <span className="event-badge-destacado">
              <i className={`fa-solid ${event.badge.icon}`}></i> {event.badge.text}
            </span>
          )}

          {/* Título y Subtítulo */}
          <h1 className="event-title">{event.title}</h1>
          <p className="event-subtitle">{event.subtitle}</p>

          {/* Fila de Metadatos Rápidos con iconos */}
          <div className="event-meta-row">
            <div className="event-meta-item">
              <i className="fa-solid fa-location-dot"></i>
              <span>{event.location}</span>
            </div>
            <div className="event-meta-item">
              <i className="fa-solid fa-calendar-days"></i>
              <span>{event.date}</span>
            </div>
            <div className="event-meta-item">
              <i className="fa-solid fa-clock"></i>
              <span>{event.time}</span>
            </div>
            <div className="event-meta-item">
              <i className="fa-solid fa-tag"></i>
              <span>{event.category}</span>
            </div>
          </div>

          {/* Galería de Imágenes Asimétrica */}
          <div className="event-gallery-grid">
            
            {/* Imagen Principal Grande */}
            <div className="gallery-main-wrapper">
              <img 
                src={event.images.main} 
                alt={`${event.title} main`} 
                className="gallery-main-img" 
              />
            </div>

            {/* Cuadrícula 2x2 Lateral */}
            <div className="gallery-thumbs-wrapper">
              <div className="gallery-thumb-item">
                <img src={event.images.thumb1} alt="vinyls" className="gallery-thumb-img" />
              </div>
              <div className="gallery-thumb-item">
                <img src={event.images.thumb2} alt="candles" className="gallery-thumb-img" />
              </div>
              <div className="gallery-thumb-item">
                <img src={event.images.thumb3} alt="library" className="gallery-thumb-img" />
              </div>
              <div className="gallery-thumb-item">
                <img src={event.images.thumb4} alt="drinks" className="gallery-thumb-img" />
              </div>
            </div>

            {/* Acciones Flotantes sobre la Galería */}
            <div className="gallery-actions-overlay">
              <button 
                className="gallery-action-btn" 
                onClick={handleShare}
                aria-label="Compartir evento"
              >
                <i className="fa-solid fa-share-nodes"></i>
                <span>{shareFeedback ? shareFeedback : "Compartir"}</span>
              </button>
              <button 
                className={`gallery-action-btn${isSaved ? " active" : ""}`} 
                onClick={toggleSave}
                aria-label="Guardar en favoritos"
              >
                <i className={isSaved ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>
                <span>{isSaved ? "Guardado" : "Guardar"}</span>
              </button>
              <button 
                className="gallery-action-btn" 
                onClick={() => setShowAllModal(true)}
                aria-label="Ver todas las imágenes"
              >
                <i className="fa-solid fa-images"></i>
                <span>Ver todas</span>
              </button>
            </div>
          </div>

          {/* Sección "Sobre el evento" */}
          <section className="event-detail-card">
            <h2 className="card-title">Sobre el evento</h2>
            <div className="event-description">
              {event.description.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </section>

          {/* Sección "Ubicación" con mapa retro */}
          <section className="event-detail-card">
            <h2 className="card-title">Ubicación</h2>
            <p className="location-address">
              <i className="fa-solid fa-location-dot"></i> {event.address}
            </p>
            <div className="map-container">
              <iframe
                title={`Mapa de ${event.title}`}
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight="0"
                marginWidth="0"
                src={mapUrl}
                style={{
                  border: "none",
                  filter: "grayscale(0.2) sepia(0.2) contrast(0.9) brightness(1.02)",
                }}
              ></iframe>
            </div>
          </section>
        </main>

        {/* ── COLUMNA LATERAL (Sidebar con tarjetas) ── */}
        <aside className="event-sidebar-content">
          
          {/* Tarjeta Aforo Limitado */}
          <div className="card-limited">
            <h3>Aforo limitado</h3>
            <button 
              className="btn-reserve-ticket" 
              onClick={handleReserve}
              style={isReserved ? { backgroundColor: "#3d271d", boxShadow: "none" } : {}}
            >
              <i className={isReserved ? "fa-solid fa-circle-check" : "fa-solid fa-ticket"}></i>
              <span>{isReserved ? "¡Plaza reservada!" : "Reservar plaza"}</span>
            </button>
          </div>

          {/* Tarjeta Entrada Libre */}
          <div className="card-sidebar-white">
            <h3 className="sidebar-title">Entrada libre</h3>
            <div className="sidebar-info-list">
              <div className="sidebar-info-item">
                <i className="fa-regular fa-calendar sidebar-info-icon"></i>
                <div className="sidebar-info-text">
                  <strong>{event.dateDetail.split(" / ")[0]}</strong>
                  <span>{event.dateDetail.split(" / ")[1]}</span>
                </div>
              </div>
              <div className="sidebar-info-item">
                <i className="fa-regular fa-clock sidebar-info-icon"></i>
                <div className="sidebar-info-text">
                  <strong>{event.timeDetail.split(" / ")[0]}</strong>
                  <span>{event.timeDetail.split(" / ")[1]}</span>
                </div>
              </div>
              <div className="sidebar-info-item">
                <i className="fa-solid fa-train-subway sidebar-info-icon"></i>
                <div className="sidebar-info-text">
                  <strong>{event.location.split(", ")[0]}</strong>
                  <span>{event.location.split(", ")[1]}</span>
                </div>
              </div>
            </div>
            
            <div className="sidebar-interested-footer">
              <i className="fa-solid fa-users"></i>
              <span>{event.interested + (isReserved ? 1 : 0)} personas interesadas</span>
            </div>
          </div>

          {/* Tarjeta Promocional "¿Te gusta este estilo?" */}
          <div className="card-sidebar-promo">
            <h3 className="promo-title">¿Te gusta este estilo?</h3>
            <p className="promo-desc">
              Descubre más eventos vintage y coleccionismo únicos en tu zona.
            </p>
            <Link to="/explorar" className="btn-explore-more">
              <span>Explorar más eventos</span>
              <i className="fa-solid fa-arrow-right-long"></i>
            </Link>
          </div>

          {/* Mascot Ilustración Flotante */}
          <div className="sidebar-mascot-container">
            <img 
              src={caja04} 
              alt="Mascota Desván" 
              className="sidebar-mascot-img" 
            />
          </div>
        </aside>
      </div>

      {/* Modal simple para "Ver todas" las imágenes de la galería */}
      {showAllModal && (
        <div 
          className="modal-backdrop" 
          onClick={() => setShowAllModal(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(61, 39, 29, 0.8)",
            backdropFilter: "blur(5px)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem"
          }}
        >
          <div 
            className="modal-content-custom"
            onClick={e => e.stopPropagation()}
            style={{
              background: "#FFF8F5",
              padding: "2.5rem",
              borderRadius: "20px",
              maxWidth: "800px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
              border: "1px solid #EEDFC5"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ fontFamily: "'DM Serif Text', serif", fontSize: "1.8rem", margin: 0 }}>Galería de Imágenes</h3>
              <button 
                onClick={() => setShowAllModal(false)}
                style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "#3d271d" }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <img src={event.images.main} alt="img1" style={{ width: "100%", borderRadius: "10px", height: "200px", objectFit: "cover" }} />
              <img src={event.images.thumb1} alt="img2" style={{ width: "100%", borderRadius: "10px", height: "200px", objectFit: "cover" }} />
              <img src={event.images.thumb2} alt="img3" style={{ width: "100%", borderRadius: "10px", height: "200px", objectFit: "cover" }} />
              <img src={event.images.thumb3} alt="img4" style={{ width: "100%", borderRadius: "10px", height: "200px", objectFit: "cover" }} />
              <img src={event.images.thumb4} alt="img5" style={{ width: "100%", borderRadius: "10px", height: "200px", objectFit: "cover" }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
