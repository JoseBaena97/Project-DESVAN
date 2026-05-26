import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AccountPageHeader } from "../../components/account/AccountPageHeader";
import authService from "../../services/auth.service";
import reviewService from "../../services/review.service";
import useGlobalReducer from "../../hooks/useGlobalReducer";

const TABS = ["Recibidas", "Escritas"];

export const Reviews = () => {
  const [user, setUser] = useState(null);
  const [writtenReviews, setWrittenReviews] = useState([]);
  const [receivedReviews, setReceivedReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [selectedReview, setSelectedReview] = useState(null);
  const [editingReview, setEditingReview] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");
  const [actionError, setActionError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
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

      try {
        const [written, received] = await Promise.all([
          reviewService.getWrittenReviewsByUser(currentUser.id),
          reviewService.getReceivedReviewsByUser(currentUser.id),
        ]);
        setWrittenReviews(written || []);
        setReceivedReviews(received || []);
      } catch (err) {
        console.log(err);
        setError("Error al cargar valoraciones");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [store.user, dispatch, navigate]);

  const handleCloseEditReview = () => {
    setEditingReview(null);
    setEditRating(0);
    setEditComment("");
    setActionError(null);
  };

  const handleOpenEditReview = (review) => {
    setEditingReview(review);
    setEditRating(Number(review.rating) || 0);
    setEditComment(review.comment || "");
    setActionError(null);
  };

  const handleSaveReview = async () => {
    if (!editingReview) return;
    setIsSaving(true);
    setActionError(null);

    const reviewId = Number(editingReview?.id ?? editingReview?.review_id);
    if (!reviewId) {
      setActionError("ID de la valoración inválido");
      setIsSaving(false);
      return;
    }

    try {
      const payload = {
        rating: editRating,
        comment: editComment,
      };
      const resp = await reviewService.updateReview(reviewId, payload);
      if (!resp) {
        throw new Error("No se pudo actualizar la valoración");
      }

      const updatedReview = {
        ...editingReview,
        id: reviewId,
        rating: editRating,
        comment: editComment,
      };

      setWrittenReviews((prevWritten) =>
        prevWritten.map((review) => (review.id === reviewId ? updatedReview : review))
      );

      setUser((prevUser) => {
        if (!prevUser) return prevUser;
        const my_written_reviews = prevUser.my_written_reviews?.map((review) =>
          review.id === reviewId ? updatedReview : review
        );
        const updatedUser = { ...prevUser, my_written_reviews };
        dispatch({ type: "auth", payload: { user: updatedUser } });
        return updatedUser;
      });
      handleCloseEditReview();
    } catch (err) {
      console.log(err);
      setActionError(err?.message || "Error actualizando valoracion");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    const confirmDelete = window.confirm("¿Eliminar esta valoración?");
    if (!confirmDelete) return;

    setIsSaving(true);
    setActionError(null);

    try {
      const resp = await reviewService.deleteReview(reviewId);
      if (!resp) {
        throw new Error("No se pudo eliminar la valoración");
      }

      setWrittenReviews((prevWritten) => prevWritten.filter((review) => review.id !== reviewId));
      setUser((prevUser) => {
        if (!prevUser) return prevUser;
        const my_written_reviews = prevUser.my_written_reviews?.filter((review) => review.id !== reviewId);
        const updatedUser = { ...prevUser, my_written_reviews };
        dispatch({ type: "auth", payload: { user: updatedUser } });
        return updatedUser;
      });
      if (selectedReview?.id === reviewId) {
        setSelectedReview(null);
      }
    } catch (err) {
      console.log(err);
      setActionError(err?.message || "Error eliminando valoracion");
    } finally {
      setIsSaving(false);
    }
  };

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

  const truncateText = (text, maxLength = 60) => {
    if (!text) return "";
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };

  const reviewsToShow = activeTab === "Recibidas" ? receivedReviews : writtenReviews;

  const renderReviewCard = (review, type) => {
    const hasComment = Boolean(review.comment);
    const isLongComment = hasComment && review.comment.length > 60;
    const commentText = hasComment ? truncateText(review.comment) : "Sin comentario";

    return (
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

        {hasComment ? (
          <button
            type="button"
            className="review-card-comment-button"
            onClick={() => setSelectedReview(review)}
          >
            <span>{commentText}</span>
            {isLongComment && <span className="review-card-comment-more">Ver más</span>}
          </button>
        ) : (
          <p className="review-card-comment">{commentText}</p>
        )}

        {type === "written" && (
          <div className="review-card-actions">
            <button type="button" className="review-action-button review-action-button--edit" onClick={() => handleOpenEditReview(review)}>
              Editar
            </button>
            <button type="button" className="review-action-button review-action-button--delete" onClick={() => handleDeleteReview(review.id)}>
              Eliminar
            </button>
          </div>
        )}

        <div className="review-card-footer">
          <span className="review-card-event">{review.event?.title || "Evento no disponible"}</span>
          <span className="review-card-date">
            {review.created_at ? new Date(review.created_at).toLocaleDateString("es-ES") : "Fecha desconocida"}
          </span>
        </div>
      </article>
    );
  };

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

          {selectedReview && (
            <div className="modal-backdrop" onClick={() => setSelectedReview(null)}>
              <div className="modal-content-custom" onClick={(e) => e.stopPropagation()}>
                <div className="review-modal-header">
                  <h3>Comentario completo</h3>
                  <button
                    type="button"
                    className="modal-close-btn"
                    onClick={() => setSelectedReview(null)}
                    aria-label="Cerrar comentario completo"
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>
                <p className="review-modal-fullcomment">{selectedReview.comment}</p>
              </div>
            </div>
          )}

          {editingReview && (
            <div className="modal-backdrop" onClick={handleCloseEditReview}>
              <div className="modal-content-custom" onClick={(e) => e.stopPropagation()}>
                <div className="review-modal-header">
                  <h3>Editar valoración</h3>
                  <button
                    type="button"
                    className="modal-close-btn"
                    onClick={handleCloseEditReview}
                    aria-label="Cerrar edición de valoración"
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>
                <div className="review-edit-form">
                  <label>Calificación</label>
                  <div className="review-stars review-stars--edit">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        className={`review-star ${star <= editRating ? "active" : ""}`}
                        onClick={() => setEditRating(star)}
                      >
                        <i className={star <= editRating ? "fa-solid fa-star" : "fa-regular fa-star"}></i>
                      </button>
                    ))}
                  </div>
                  <label>
                    Comentario
                    <textarea
                      value={editComment}
                      onChange={(e) => setEditComment(e.target.value)}
                    />
                  </label>
                  {actionError && <p className="form-error">{actionError}</p>}
                  <div className="review-modal-actions">
                    <button type="button" className="review-btn-cancel" onClick={handleCloseEditReview}>
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="review-btn-submit"
                      onClick={handleSaveReview}
                      disabled={isSaving}
                    >
                      {isSaving ? "Guardando..." : "Guardar"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
