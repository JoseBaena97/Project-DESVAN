import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import userService from "../services/user.service";
import "./PublicProfile.css";
import "./Explore.css";

const formatJoinDate = (isoString) => {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return "";
  }
};

const formatDate = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
};

const formatTime = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", hour12: false });
};

const renderStars = (rating) => {
  const rounded = Math.round(Number(rating) || 0);
  return [1, 2, 3, 4, 5].map((star) => (
    <i
      key={star}
      className={`${star <= rounded ? "fa-solid" : "fa-regular"} fa-star`}
    />
  ));
};

export const PublicProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    setLoading(true);    setError(null);

    userService
      .getPublicProfile(userId)
      .then((data) => {
        if (!data) {
          setError("No se ha encontrado este vendedor.");
          setProfile(null);
          return;
        }
        setProfile(data);
      })
      .catch(() => setError("No se ha podido cargar el perfil."))
      .finally(() => setLoading(false));
  }, [userId, navigate]);

  if (loading) {
    return (
      <div className="public-profile-page page-transition">
        <div className="public-profile-loading">
          <p>Cargando perfil del vendedor…</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="public-profile-page page-transition">
        <div className="public-profile-error">
          <p>{error || "Perfil no disponible."}</p>
          <Link to="/explorar" className="public-profile-back" style={{ marginTop: "1rem" }}>
            <i className="fa-solid fa-arrow-left" /> Volver a explorar
          </Link>
        </div>
      </div>
    );
  }

  const displayRating = profile.user_rating != null ? Number(profile.user_rating).toFixed(1) : null;

  return (
    <div className="public-profile-page page-transition">
      <button type="button" className="public-profile-back" onClick={() => navigate(-1)}>
        <i className="fa-solid fa-arrow-left" /> Volver
      </button>

      <header className="public-profile-header">
        <div className="public-profile-header-top">
          <div className="public-profile-avatar">
            {profile.profile_picture_url ? (
              <img src={profile.profile_picture_url} alt={profile.username} />
            ) : (
              <div className="public-profile-avatar-fallback">
                {profile.username?.[0]?.toUpperCase() || "V"}
              </div>
            )}
          </div>

          <div className="public-profile-identity">
            <p className="public-profile-handle">@{profile.username}</p>
            <h1 className="public-profile-name">{profile.full_name || profile.username}</h1>

            <div className="public-profile-meta-row">
              {profile.created_at && (
                <span className="public-profile-meta-item">
                  <i className="fa-regular fa-calendar" />
                  Se unió el {formatJoinDate(profile.created_at)}
                </span>
              )}

              <span className="public-profile-meta-item public-profile-rating">
                {displayRating ? (
                  <>
                    {renderStars(profile.user_rating)}
                    <span>{displayRating} / 5</span>
                    <span>({profile.reviews_count} valoraciones)</span>
                  </>
                ) : (
                  <span>Sin valoración</span>
                )}
              </span>

              {profile.is_verified && (
                <span className="public-profile-verified">
                  <i className="fa-solid fa-circle-check" />
                  Verificado
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <section className="public-profile-bio-section">
        <h2 className="public-profile-section-title">Biografía</h2>
        {profile.bio ? (
          <p className="public-profile-bio-text">{profile.bio}</p>
        ) : (
          <p className="public-profile-bio-empty">Este vendedor aún no ha escrito su biografía.</p>
        )}
      </section>

      <section className="public-profile-section">
        <div className="public-profile-section-header">
          <h2 className="public-profile-section-title">Eventos creados</h2>
          <span className="public-profile-section-count">
            {profile.events_count} {profile.events_count === 1 ? "evento" : "eventos"}
          </span>
        </div>

        {profile.events?.length > 0 ? (
          <div className="public-profile-events-grid">
            {profile.events.map((event) => (
              <div key={event.id} className="event-card">
                <div className="event-img-wrapper">
                  <img
                    src={event.image_url?.cover}
                    alt={event.title}
                    className="event-img"
                  />
                </div>
                <div className="event-card-body">
                  <h3 className="event-card-title">{event.title}</h3>
                  <p className="event-card-desc">{event.description}</p>
                  <div className="event-card-meta">
                    <span className="event-card-meta-item">
                      <i className="fa-solid fa-location-dot" />
                      {event.exact_address}
                    </span>
                    <span className="event-card-meta-item">
                      <i className="fa-regular fa-calendar" />
                      {formatDate(event.start_date || event.start_time)} · {formatTime(event.start_time)}
                    </span>
                  </div>
                  <Link to={`/detalles/${event.id}`}>
                    <button type="button" className="btn-ver-rastro">Ver rastro</button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="public-profile-empty">
            <i className="fa-solid fa-box-open" />
            <p>Este vendedor aún no tiene eventos activos.</p>
          </div>
        )}
      </section>

      <section className="public-profile-section">
        <div className="public-profile-section-header">
          <h2 className="public-profile-section-title">Valoraciones recibidas</h2>
          <span className="public-profile-section-count">
            {profile.reviews_count} {profile.reviews_count === 1 ? "valoración" : "valoraciones"}
          </span>
        </div>

        {profile.received_reviews?.length > 0 ? (
          <div className="public-profile-reviews-list">
            {profile.received_reviews.map((review) => (
              <article key={review.id} className="public-review-card">
                <div className="public-review-card-top">
                  <div className="public-review-reviewer">
                    <div className="public-review-reviewer-avatar">
                      {review.reviewer?.profile_picture_url ? (
                        <img src={review.reviewer.profile_picture_url} alt="" />
                      ) : (
                        review.reviewer?.username?.[0]?.toUpperCase() || "?"
                      )}
                    </div>
                    <p className="public-review-reviewer-name">
                      @{review.reviewer?.username || "usuario"}
                    </p>
                  </div>
                  <div className="public-review-rating">
                    {renderStars(review.rating)}
                    <span>{Number(review.rating).toFixed(1)}</span>
                  </div>
                </div>

                {review.comment && (
                  <p className="public-review-comment">{review.comment}</p>
                )}

                <div className="public-review-footer">
                  <span className="public-review-event">
                    {review.event?.title || "Evento"}
                  </span>
                  <span>
                    {review.created_at
                      ? new Date(review.created_at).toLocaleDateString("es-ES")
                      : ""}
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="public-profile-empty">
            <i className="fa-regular fa-star" />
            <p>Aún no ha recibido valoraciones.</p>
          </div>
        )}
      </section>
    </div>
  );
};


