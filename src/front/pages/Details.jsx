import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./Details.css";
import caja04 from "../assets/img/caja04.png";
import eventService from "../services/event.service";
import favoriteService from "../services/favorite.service";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Details = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [isSaved, setIsSaved] = useState(false);
  const [isReserved, setIsReserved] = useState(false);
  const [shareFeedback, setShareFeedback] = useState("");
  const [showAllModal, setShowAllModal] = useState(false);
  const [event, setEvent] = useState(null);
  const [favoriteRecord, setFavoriteRecord] = useState(null);

  const { store } = useGlobalReducer();

  // ── FETCH EVENT ──
  useEffect(() => {
    if (!eventId) return;

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    eventService.getEvent(eventId)
      .then(res => {
        setEvent(res.data);
      })
      .catch(err => console.log(err));

  }, [eventId]);

  useEffect(() => {
    if (!event || !store.user) {
      setFavoriteRecord(null);
      setIsSaved(false);
      return;
    }

    const currentFavorite = event.favorites?.find((fav) => fav.user?.id === store.user.id) ?? null;
    setFavoriteRecord(currentFavorite);
    setIsSaved(Boolean(currentFavorite));
  }, [event, store.user]);

  // ── LOADING STATE ──
  if (!event) {
    return (
      <div className="loading-container">
        <p>Cargando los detalles del evento...</p>
      </div>
    );
  }

  // ── MAP URL ──
  const encodedAddress = encodeURIComponent(event?.exact_address || event?.city || "");
  const mapUrl = `https://maps.google.com/maps?q=${encodedAddress}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  // ── ACTIONS ──
  const handleShare = () => {
    const fakeUrl = `${window.location.origin}/detalles/${eventId}`;
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

  const toggleSave = async () => {
    if (!store.user) {
      navigate("/login");
      return;
    }

    if (favoriteRecord) {
      const resp = await favoriteService.deleteFavorite(favoriteRecord.id);
      if (resp) {
        setFavoriteRecord(null);
        setIsSaved(false);
        setEvent((prevEvent) => ({
          ...prevEvent,
          favorites: (prevEvent.favorites || []).filter((fav) => fav.id !== favoriteRecord.id),
        }));
      }
      return;
    }

    const resp = await favoriteService.createFavorite(event.id);
    if (resp?.favorite) {
      setFavoriteRecord(resp.favorite);
      setIsSaved(true);
      setEvent((prevEvent) => ({
        ...prevEvent,
        favorites: [...(prevEvent.favorites || []), resp.favorite],
      }));
    }
  };

  const handleReserve = () => setIsReserved(prev => !prev);

  return (
    <div className="event-detail-page page-transition">
      <div className="event-detail-container">

        {/* ── MAIN ── */}
        <main className="event-main-content">

          {/* BADGE */}
          {event.badge && (
            <span className="event-badge-destacado">
              <i className={`fa-solid ${event.badge.icon}`}></i>
              {event.badge.text}
            </span>
          )}

          {/* TITLE */}
          <h1 className="event-title">{event.title}</h1>

          {/* SUBTITLE (backend no lo manda → seguro) */}
          <p className="event-subtitle">{event.city}</p>

          {/* META */}
          <div className="event-meta-row">

            <div className="event-meta-item">
              <i className="fa-solid fa-location-dot"></i>
              <span>{event.city}</span>
            </div>

            <div className="event-meta-item">
              <i className="fa-solid fa-map-pin"></i>
              <span>{event.exact_address}</span>
            </div>

            <div className="event-meta-item">
              <i className="fa-solid fa-tag"></i>
              <span>{event.event_type}</span>
            </div>

          </div>

          {/* GALLERY */}
          <div className="event-gallery-grid">

            <div className="gallery-main-wrapper">
              <img
                src={event.image_url?.cover}
                alt={event.title}
                className="gallery-main-img"
              />
            </div>

            <div className="gallery-thumbs-wrapper">
              <img src={event.image_url?.cover} className="gallery-thumb-img" />
              <img src={event.image_url?.cover} className="gallery-thumb-img" />
              <img src={event.image_url?.cover} className="gallery-thumb-img" />
              <img src={event.image_url?.cover} className="gallery-thumb-img" />
            </div>

            <div className="gallery-actions-overlay">

              <button className="gallery-action-btn" onClick={handleShare}>
                <i className="fa-solid fa-share-nodes"></i>
                <span>{shareFeedback || "Compartir"}</span>
              </button>

              <button
                className={`gallery-action-btn ${isSaved ? "active" : ""}`}
                onClick={toggleSave}
              >
                <i className={isSaved ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>
                <span>{isSaved ? "Guardado" : "Guardar"}</span>
              </button>

              <button
                className="gallery-action-btn"
                onClick={() => setShowAllModal(true)}
              >
                <i className="fa-solid fa-images"></i>
                <span>Ver todas</span>
              </button>

            </div>
          </div>

          {/* DESCRIPTION */}
          <section className="event-detail-card">
            <h2 className="card-title">Sobre el evento</h2>
            <div className="event-description">
              <p>{event.description}</p>
            </div>
          </section>

          {/* LOCATION */}
          <section className="event-detail-card">
            <h2 className="card-title">Ubicación</h2>
            <p className="location-address">
              <i className="fa-solid fa-location-dot"></i>
              {event.exact_address}
            </p>

            <div className="map-container">
              <iframe
                title="map"
                width="100%"
                height="100%"
                frameBorder="0"
                src={mapUrl}
                style={{
                  border: "none",
                  filter: "grayscale(0.2)"
                }}
              />
            </div>
          </section>

        </main>

        {/* ── SIDEBAR ── */}
        <aside className="event-sidebar-content">

          <div className="card-limited">
            <h3>Aforo limitado</h3>
            <button
              className="btn-reserve-ticket"
              onClick={handleReserve}
            >
              <i className={isReserved ? "fa-solid fa-circle-check" : "fa-solid fa-ticket"}></i>
              <span>{isReserved ? "¡Plaza reservada!" : "Reservar plaza"}</span>
            </button>
          </div>

          <div className="card-sidebar-white">
            <h3 className="sidebar-title">Información</h3>

            <div className="sidebar-info-list">

              <div className="sidebar-info-item">
                <i className="fa-regular fa-calendar"></i>
                <div>
                  <strong>
                    {event.start_time ? new Date(event.start_time).toLocaleDateString() : ""}
                  </strong>
                  <span>
                    {event.end_time ? new Date(event.end_time).toLocaleDateString() : ""}
                  </span>
                </div>
              </div>

              <div className="sidebar-info-item">
                <i className="fa-regular fa-clock"></i>
                <div>
                  <strong>
                    {event.start_time ? new Date(event.start_time).toLocaleTimeString() : ""}
                  </strong>
                  <span>
                    {event.end_time ? new Date(event.end_time).toLocaleTimeString() : ""}
                  </span>
                </div>
              </div>

              <div className="sidebar-info-item">
                <i className="fa-solid fa-location-dot"></i>
                <div>
                  <strong>{event.city}</strong>
                  <span>{event.exact_address}</span>
                </div>
              </div>

            </div>

            <div className="sidebar-interested-footer">
              <i className="fa-solid fa-users"></i>
              <span>{(event.interested || 0) + (isReserved ? 1 : 0)} personas interesadas</span>
            </div>

          </div>

          <div className="card-sidebar-promo">
            <h3>¿Te gusta este estilo?</h3>
            <p>Descubre más eventos cerca de ti.</p>
            <Link to="/explorar" className="btn-explore-more">
              Explorar más
            </Link>
          </div>

          <div className="sidebar-mascot-container">
            <img src={caja04} alt="mascota" className="sidebar-mascot-img" />
          </div>

        </aside>
      </div>

      {/* MODAL */}
      {showAllModal && (
        <div className="modal-backdrop" onClick={() => setShowAllModal(false)}>
          <div className="modal-content-custom" onClick={e => e.stopPropagation()}>

            <h3>Galería</h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <img src={event.image_url?.cover} />
              <img src={event.image_url?.cover} />
              <img src={event.image_url?.cover} />
              <img src={event.image_url?.cover} />
            </div>

          </div>
        </div>
      )}
    </div>
  );
};