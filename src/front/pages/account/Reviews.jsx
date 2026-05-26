import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AccountPageHeader } from "../../components/account/AccountPageHeader";
import authService from "../../services/auth.service";
import useGlobalReducer from "../../hooks/useGlobalReducer";

const TABS = ["Recibidas", "Escritas"];

export const Reviews = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const loadUser = async () => {
      let currentUser = store.user;
      if (!currentUser) {
        try {
          const profile = await authService.getMe();
          currentUser = profile?.data ?? profile;
          if (currentUser) {
            dispatch({ type: "auth", payload: { user: currentUser } });
          }
        } catch (err) {
          console.log(err);
          setError("Error al cargar usuario");
        }
      }

      if (!currentUser) {
        navigate("/login");
        return;
      }

      setUser(currentUser);
      setLoading(false);
    };

    loadUser();
  }, [store.user, dispatch, navigate]);

  const writtenReviews = user?.my_written_reviews || [];
  const receivedReviews = user?.my_received_reviews || [];

  const reviewsToShow = activeTab === "Recibidas" ? receivedReviews : writtenReviews;

  const renderRatingStars = (rating) => {
    const rounded = Math.round(Number(rating) || 0);
    return Array.from({ length: 5 }).map((_, index) => (
      <i
        key={index}
        className={
          index < rounded ? "fa-solid fa-star review-star-icon" : "fa-regular fa-star review-star-icon"
        }
      />
    ));
  };

  const renderReviewCard = (review, type) => (
    <article key={review.id} className="review-card">
      <div className="review-card-top">
        <div>
          <span className="review-card-badge">{type === "received" ? "Recibida" : "Escrita"}</span>
          <p className="review-card-meta">
            {type === "received" ? `De ${review.reviewer?.email ?? "usuario"}` : `Sobre ${review.reviewed?.email ?? "usuario"}`}
          </p>
        </div>
        <div className="review-card-rating">
          {renderRatingStars(review.rating)}
          <span>{review.rating?.toFixed ? review.rating.toFixed(1) : review.rating}</span>
        </div>
      </div>

      <p className="review-card-comment">{review.comment || "Sin comentario"}</p>

      <div className="review-card-footer">
        <span className="review-card-event">{review.event?.title || "Evento no disponible"}</span>
        <span className="review-card-date">
          {review.created_at ? new Date(review.created_at).toLocaleDateString("es-ES") : "Fecha desconocida"}
        </span>
      </div>
    </article>
  );

  return (
    <div className="reviews-page">
      <AccountPageHeader title="Mis valoraciones" titleAccent="Mis" subtitle="Tus reviews recibidas y escritas en un solo lugar." />

      {loading ? (
        <div className="favorite-empty-state">
          <p>Cargando tus valoraciones…</p>
        </div>
      ) : error ? (
        <div className="favorite-empty-state">
          <p>{error}</p>
        </div>
      ) : (
        <>
          <div className="account-tabs">
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                className={`account-tab${activeTab === tab ? " account-tab--active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <section className="reviews-section">
            <div className="reviews-section-header">
              <div>
                <h2>{activeTab === "Recibidas" ? "Valoraciones recibidas" : "Valoraciones escritas"}</h2>
                <p className="reviews-section-subtitle">
                  {activeTab === "Recibidas"
                    ? "Comentarios que otros usuarios han dejado sobre ti."
                    : "Reseñas que tú has escrito sobre otros."}
                </p>
              </div>
              <span className="reviews-section-count">{reviewsToShow.length} valoraciones</span>
            </div>

            {reviewsToShow.length === 0 ? (
              <div className="favorite-empty-state">
                <p>{activeTab === "Recibidas" ? "Aún no has recibido valoraciones." : "Aún no has escrito ninguna valoración."}</p>
              </div>
            ) : (
              <div className="reviews-grid">
                {reviewsToShow.map((review) => renderReviewCard(review, activeTab === "Recibidas" ? "received" : "written"))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};
