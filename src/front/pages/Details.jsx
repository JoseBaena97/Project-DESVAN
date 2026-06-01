import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import "./Details.css";
import caja04 from "../assets/img/caja04.png";
import logoBw from "../assets/img/logo_bw.png";
import eventService from "../services/event.service";
import favoriteService from "../services/favorite.service";
import reservationService from "../services/reservation.service";
import reviewService from "../services/review.service";
import adminService from "../services/admin.service";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { Map } from "../components/Map";

export const Details = () => {
  const { eventId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [isSaved, setIsSaved] = useState(false);
  const [isReserved, setIsReserved] = useState(false);
  const [shareFeedback, setShareFeedback] = useState("");
  const [showAllModal, setShowAllModal] = useState(false);
  const [galleryActiveIdx, setGalleryActiveIdx] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewTarget, setReviewTarget] = useState("vendedor");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("spam");
  const [reportMessage, setReportMessage] = useState("");
  const [reportFeedback, setReportFeedback] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [event, setEvent] = useState(null);
  const [favoriteRecord, setFavoriteRecord] = useState(null);
  const [reservationRecord, setReservationRecord] = useState(null);

  const { store } = useGlobalReducer();

  // ── FETCH EVENT ──
  useEffect(() => {
    if (!eventId) return;

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", {
        replace: true,
        state: { from: location.state?.from ||"/explorar" },
      });
      return;
    }

    eventService.getEvent(eventId)
      .then(res => {
        setEvent(res.data);
      })
      .catch(() => {});

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

    const currentReservation = event.reservations?.find((r) => r.user?.id === store.user.id && r.status === "confirmed") ?? null;
    setReservationRecord(currentReservation);
    setIsReserved(Boolean(currentReservation));
  }, [event, store.user]);

  // ── LOADING STATE ──
  if (!event) {
    return (
      <div className="loading-container">
        <p>Cargando los detalles del evento...</p>
      </div>
    );
  }

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

  const handleReserve = async () => {

    // no dejar que el mismo usuario se reserve a sí mismo
    if (store.user.id === event.seller?.id) {
      setReviewFeedback("No puedes reservar tu propio evento.");
      return;
    }

    // si ya hay reserva, eliminarla
    if (reservationRecord) {
      const resp = await reservationService.deleteReservation(reservationRecord.id);
      if (resp) {
        setReservationRecord(null);
        setIsReserved(false);
        setEvent((prevEvent) => ({
          ...prevEvent,
          reservations: (prevEvent.reservations || []).filter((r) => r.id !== reservationRecord.id),
        }));
      }
      return;
    }

    // crear reserva
    const resp = await reservationService.createReservation(event.id, store.user?.id);
    if (resp?.reservation) {
      setReservationRecord(resp.reservation);
      setIsReserved(true);
      setEvent((prevEvent) => ({
        ...prevEvent,
        reservations: [...(prevEvent.reservations || []), resp.reservation],
      }));
    }

    
  };

  const handleSubmitReview = async () => {
    if (!store.user) {
      navigate("/login");
      return;
    }

    if (store.user.id === event.seller?.id) {
      setReviewFeedback("No puedes escribir una valoración sobre ti mismo.");
      return;
    }

    if (!reviewRating) {
      setReviewFeedback("Selecciona una valoración antes de enviar.");
      return;
    }

    const payload = {
      rating: reviewRating,
      comment: reviewComment,
      reviewer_id: store.user.id,
      reviewed_id: event.seller?.id,
      event_id: event.id,
    };

    const resp = await reviewService.createReview(payload);
    if (resp?.success) {
      setReviewFeedback("");
      setShowReviewModal(false);
      setReviewRating(0);
      setReviewComment("");
      setReviewTarget("vendedor");
      setEvent((prevEvent) => ({
        ...prevEvent,
        reviews: [...(prevEvent.reviews || []), {
          id: Date.now(),
          rating: reviewRating,
          comment: reviewComment,
          reviewer: {
            id: store.user.id,
            email: store.user.email,
          },
        }],
      }));
    } else {
      setReviewFeedback("No se ha podido enviar la valoración. Intenta de nuevo.");
    }
  };

  // calcular plazas disponibles para eventos privados
  const confirmedCount = (event.reservations || []).filter(r => r.status === "confirmed").length;
  const remainingSeats = event.max_capacity != null ? Math.max(event.max_capacity - confirmedCount, 0) : null;

  const galleryImgs = (event.image_url?.gallery || []).slice(0, 4);
  const thumbCount = galleryImgs.length;

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
          <div className="create-event-title-line"></div>

          {/* META */}
          <div className="event-meta-row">

            <div className="event-meta-item">
              <i className="fa-solid fa-location-dot"></i>
              <span>{event.exact_address}</span>
            </div>

            <div className="event-meta-item">
              <i className="fa-solid fa-tag"></i>
              <span>{event.event_type}</span>
            </div>

          </div>

          {/* GALLERY */}
          <div className={`event-gallery-grid${thumbCount === 0 ? " event-gallery-grid--solo" : ""}`}>

            <div className="gallery-main-wrapper">
              <img
                src={event.image_url?.cover || logoBw}
                alt={event.title}
                className={`gallery-main-img${!event.image_url?.cover ? " img-fallback" : ""}`}
              />
            </div>

            {thumbCount > 0 && (
              <div className={`gallery-thumbs-wrapper gallery-thumbs-wrapper--${thumbCount}`}>
                {galleryImgs.map((src, idx) => (
                  <img key={idx} src={src} alt={`${event.title} foto ${idx + 2}`} className="gallery-thumb-img" />
                ))}
              </div>
            )}

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

            <Map
              address={event.exact_address}
              latitude={event.latitude}
              longitude={event.longitude}
            />
          </section>

        </main>

        {/* ── SIDEBAR ── */}
        <aside className="event-sidebar-content">

          {event.event_type === "privado" && (
            <div className="card-limited">
              <h3>Aforo limitado</h3>
              {event.max_capacity != null && (
                <p className="remaining-seats">{remainingSeats > 0 ? `${remainingSeats} plazas disponibles` : "Agotado"}</p>
              )}
              {event.seller?.id === store.user?.id ? (
                <button className="btn-evaluate btn-evaluate--disabled" disabled>
                No puedes reservar tu propio evento
              </button>
              ): (
              <button
                className="btn-reserve-ticket"
                onClick={handleReserve}
                disabled={remainingSeats === 0}
              >
                <i className={isReserved ? "fa-solid fa-circle-check" : "fa-solid fa-ticket"}></i>
                <span>{isReserved ? "¡Plaza reservada!" : (remainingSeats === 0 ? "Sin plazas" : "Reservar plaza")}</span>
              </button>

              )}
            </div>
          )}

          <div className="card-seller-box">
            <div className="seller-card-header">Vendedor</div>
            <div className="seller-card-inner">
              <div className="seller-avatar">
                {event.seller?.profile_picture_url ? (
                  <img
                    src={event.seller.profile_picture_url}
                    alt={event.seller.username || "Vendedor"}
                  />
                ) : (
                  <div className="seller-avatar-fallback">
                    {event.seller?.username?.[0]?.toUpperCase() || "V"}
                  </div>
                )}
              </div>
              <div className="seller-card-info">
                <span className="seller-handle">
                  @{event.seller?.username || event.seller?.email?.split("@")[0] || "vendedor"}
                </span>
                <p className="seller-name">
                  {event.seller?.full_name || event.seller?.username || "Vendedor"}
                </p>
                <div className="seller-rating">
                  {event.seller?.user_rating || event.event_rating ? (
                    <>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <i
                          key={star}
                          className={`${star <= Math.round(event.seller?.user_rating ?? event.event_rating ?? 0) ? "fa-solid" : "fa-regular"} fa-star`}
                        ></i>
                      ))}
                      <span>{(event.seller?.user_rating ?? event.event_rating)?.toFixed(1)} / 5</span>
                    </>
                  ) : (
                    <span>Sin valoración</span>
                  )}
                </div>
              </div>
            </div>
            {event.seller?.id === store.user?.id ? (
              <button className="btn-evaluate btn-evaluate--disabled" disabled>
                No puedes evaluarte a ti mismo
              </button>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <button className="btn-evaluate" onClick={() => setShowReviewModal(true)}>
                  Evaluar
                </button>
                <button
                  className="btn-report-seller"
                  onClick={() => { setShowReportModal(true); setReportFeedback(""); }}
                >
                  <i className="bi bi-flag"></i> Reportar usuario
                </button>
              </div>
            )}
          </div>

          <div className="card-sidebar-white">
            <h3 className="details-info-title">Información</h3>

            <div className="sidebar-info-list">

              <div className="sidebar-info-item">
                <i className="fa-regular fa-calendar"></i>
                <div>
                  <strong>
                    {event.start_time ? new Date(event.start_time).toLocaleDateString() : ""}
                  </strong>
                  {event.end_time && event.start_time && " - "}
                  <span>
                    {event.end_time ? new Date(event.end_time).toLocaleDateString() : ""}
                  </span>
                </div>
              </div>

              <div className="sidebar-info-item">
                <i className="fa-regular fa-clock"></i>
                <div>
                  <strong>
                    {event.start_time ? new Date(event.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ""}
                  </strong>
                  {event.end_time && event.start_time && " - "}
                  <span>
                    {event.end_time ? new Date(event.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ""}
                  </span>
                </div>
              </div>

              <div className="sidebar-info-item">
                <i className="fa-solid fa-location-dot"></i>
                <div>
                  <span>{event.exact_address}</span>
                </div>
              </div>

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

      {/* MODAL — GALERÍA COMPLETA */}
      {showAllModal && (() => {
        const galleryImages = [
          event.image_url?.cover,
          ...(event.image_url?.gallery || []),
        ].filter(Boolean);

        return (
          <div className="gallery-modal-backdrop" onClick={() => { setShowAllModal(false); setGalleryActiveIdx(null); }}>
            <div className="gallery-modal-panel" onClick={e => e.stopPropagation()}>

              {/* Header */}
              <div className="gallery-modal-header">
                <div className="gallery-modal-header-left">
                  <i className="fa-solid fa-images gallery-modal-icon"></i>
                  <div>
                    <h2 className="gallery-modal-title">Galería de fotos</h2>
                    <p className="gallery-modal-subtitle">{event.title}</p>
                  </div>
                </div>
                <button
                  className="gallery-modal-close"
                  onClick={() => { setShowAllModal(false); setGalleryActiveIdx(null); }}
                  aria-label="Cerrar galería"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              {/* Lightbox — imagen destacada */}
              {galleryActiveIdx !== null ? (
                <div className="gallery-lightbox">
                  <button
                    className="gallery-nav-btn gallery-nav-prev"
                    onClick={() => setGalleryActiveIdx(i => (i - 1 + galleryImages.length) % galleryImages.length)}
                    aria-label="Anterior"
                  >
                    <i className="fa-solid fa-chevron-left"></i>
                  </button>

                  <div className="gallery-lightbox-img-wrap">
                    <img
                      src={galleryImages[galleryActiveIdx]}
                      alt={`Foto ${galleryActiveIdx + 1}`}
                      className="gallery-lightbox-img"
                    />
                    <span className="gallery-lightbox-counter">
                      {galleryActiveIdx + 1} / {galleryImages.length}
                    </span>
                  </div>

                  <button
                    className="gallery-nav-btn gallery-nav-next"
                    onClick={() => setGalleryActiveIdx(i => (i + 1) % galleryImages.length)}
                    aria-label="Siguiente"
                  >
                    <i className="fa-solid fa-chevron-right"></i>
                  </button>

                  <button
                    className="gallery-lightbox-back"
                    onClick={() => setGalleryActiveIdx(null)}
                  >
                    <i className="fa-solid fa-grip"></i>
                    Ver todas
                  </button>
                </div>
              ) : (
                /* Grid masonry */
                <div className="gallery-modal-grid">
                  {galleryImages.map((src, idx) => (
                    <div
                      key={idx}
                      className={`gallery-modal-item ${idx === 0 ? "gallery-modal-item--featured" : ""}`}
                      onClick={() => setGalleryActiveIdx(idx)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => e.key === "Enter" && setGalleryActiveIdx(idx)}
                    >
                      <img src={src} alt={`Foto ${idx + 1}`} className="gallery-modal-img" />
                      <div className="gallery-modal-overlay">
                        <i className="fa-solid fa-magnifying-glass-plus"></i>
                      </div>
                      {idx === 0 && (
                        <span className="gallery-modal-featured-badge">Portada</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div className="gallery-modal-footer">
                <i className="fa-solid fa-circle-info"></i>
                <span>Haz clic en cualquier imagen para verla a pantalla completa</span>
              </div>

            </div>
          </div>
        );
      })()}

      {showReviewModal && (
        <div className="modal-backdrop" onClick={() => setShowReviewModal(false)}>
          <div className="modal-content-custom" onClick={(e) => e.stopPropagation()}>
            <div className="review-modal-header">
              <h3>Evaluar {reviewTarget === "evento" ? "evento" : "vendedor"}</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowReviewModal(false)}
                aria-label="Cerrar modal"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="review-modal-seller">
              <div className="seller-avatar">
                {event.seller?.profile_picture_url ? (
                  <img
                    src={event.seller.profile_picture_url}
                    alt={event.seller.username || "Vendedor"}
                  />
                ) : (
                  <div className="seller-avatar-fallback">
                    {event.seller?.username?.[0]?.toUpperCase() || "V"}
                  </div>
                )}
              </div>
              <div>
                <p className="seller-name-modal">{event.seller?.full_name || event.seller?.username || "Vendedor"}</p>
                <p className="seller-handle-modal">
                  @{event.seller?.username || event.seller?.email?.split("@")[0] || "vendedor"}
                </p>
              </div>
            </div>


            <div className="review-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  className={`review-star ${star <= reviewRating ? "active" : ""}`}
                  onClick={() => setReviewRating(star)}
                >
                  <i className={star <= reviewRating ? "fa-solid fa-star" : "fa-regular fa-star"}></i>
                  
                </button>
              ))}
            </div>

            <textarea
              className="review-comment-textarea"
              placeholder="Escribe tu comentario aquí..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
            />

            {reviewFeedback && <p className="review-feedback">{reviewFeedback}</p>}

            <div className="review-modal-actions">
              <button type="button" className="btn-cancel" onClick={() => setShowReviewModal(false)}>
                Cancelar
              </button>
              <button type="button" className="btn-submit" onClick={handleSubmitReview}>
                Enviar valoración
              </button>
            </div>
          </div>
        </div>
      )}

      {showReportModal && (
        <div className="modal-backdrop" onClick={() => setShowReportModal(false)}>
          <div className="modal-content-custom report-modal" onClick={e => e.stopPropagation()}>

            <div className="review-modal-header">
              <h3>Reportar a @{event.seller?.username}</h3>
              <button className="modal-close-btn" onClick={() => setShowReportModal(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="report-modal-body">
              <div className="report-field">
                <label className="report-label">Motivo del reporte</label>
                <select
                  className="report-select"
                  value={reportReason}
                  onChange={e => setReportReason(e.target.value)}
                >
                  <option value="spam">Spam</option>
                  <option value="inappropriate_content">Contenido inapropiado</option>
                  <option value="harassment">Acoso</option>
                  <option value="fraud">Fraude</option>
                  <option value="other">Otro</option>
                </select>
              </div>

              <div className="report-field">
                <label className="report-label">Descripción <span className="report-label-opt">(opcional)</span></label>
                <textarea
                  className="review-comment-textarea"
                  rows={3}
                  placeholder="Describe el problema con más detalle..."
                  value={reportMessage}
                  onChange={e => setReportMessage(e.target.value)}
                />
              </div>

              {reportFeedback && (
                <p className={reportFeedback.startsWith("✓") ? "report-feedback report-feedback--ok" : "report-feedback report-feedback--err"}>
                  {reportFeedback}
                </p>
              )}
            </div>

            <div className="review-modal-actions">
              <button type="button" className="btn-cancel" onClick={() => setShowReportModal(false)}>
                Cancelar
              </button>
              <button
                type="button"
                className="btn-submit"
                disabled={reportLoading}
                onClick={async () => {
                  setReportLoading(true);
                  try {
                    await adminService.reportUser(event.seller.id, reportReason, reportMessage);
                    setReportFeedback("✓ Reporte enviado. Lo revisaremos pronto.");
                    setReportMessage("");
                    setTimeout(() => setShowReportModal(false), 1800);
                  } catch (err) {
                    setReportFeedback(err.message || "Error al enviar el reporte.");
                  } finally {
                    setReportLoading(false);
                  }
                }}
              >
                {reportLoading ? "Enviando..." : "Enviar reporte"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};