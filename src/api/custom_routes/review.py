from flask import request, jsonify
from api.routes import api
from api.models import db, Review, User, Event, Notification, NotificationType
from api.auth_helpers import login_required, current_user


def _parse_rating(value):
    """Nota entre 1 y 5. None si no es válida."""
    try:
        rating = float(value)
    except (TypeError, ValueError):
        return None
    return rating if 1 <= rating <= 5 else None


def _recalculate_user_rating(user):
    reviews = user.my_received_reviews
    if reviews:
        user.user_rating = round(sum(float(r.rating) for r in reviews) / len(reviews), 2)
    else:
        user.user_rating = None


@api.route("/review", methods=['GET'])
def get_reviews():
    reviews = db.session.execute(db.select(Review)).scalars().all()
    transformed = [review.serialize() for review in reviews]
    return jsonify({"success": True, "data": transformed, "total": len(transformed)}), 200


@api.route("/review/<int:review_id>", methods=['GET'])
def get_review(review_id):
    review = db.session.get(Review, review_id)
    if review:
        transformed = review.serialize()
        return jsonify({"success": True, "data": transformed}), 200
    else:
        return jsonify({"success": False, "msg": "Review not found"}), 404

# Get de reviews escritas por un usurario


@api.route("/user/<int:user_id>/written_reviews", methods=['GET'])
def get_written_reviews_by_user(user_id):
    user = db.session.get(User, user_id)
    if user:
        reviews = db.session.execute(db.select(Review).where(
            Review.reviewer_id == user_id)).scalars().all()
        transformed = [review.serialize() for review in reviews]
        return jsonify({"success": True, "data": transformed}), 200
    else:
        return jsonify({"success": False, "msg": "User not found"}), 404


# Get de reviews recibidas por una usuario
@api.route("/user/<int:user_id>/recieved_reviews", methods=['GET'])
def get_recieved_reviews_by_user(user_id):
    user = db.session.get(User, user_id)
    if user:
        reviews = db.session.execute(db.select(Review).where(
            Review.reviewed_id == user_id)).scalars().all()
        transformed = [review.serialize() for review in reviews]
        return jsonify({"success": True, "data": transformed}), 200
    else:
        return jsonify({"success": False, "msg": "User not found"}), 404


# Get reviews de un evento
@api.route("/event/<int:event_id>/reviews", methods=['GET'])
def get_reviews_by_event(event_id):
    event = db.session.get(Event, event_id)
    if event:
        reviews = db.session.execute(db.select(Review).where(
            Review.event_id == event_id)).scalars().all()
        transformed = [review.serialize() for review in reviews]
        return jsonify({"success": True, "data": transformed}), 200
    else:
        return jsonify({"success": False, "msg": "Event not found"}), 404


# Crear reseña: el autor es siempre el usuario del token y el valorado es
# el organizador del evento (reviewer_id y reviewed_id del body se ignoran).
@api.route("/review", methods=['POST'])
@login_required
def create_review():
    body = request.get_json(silent=True)
    if not body:
        return jsonify({"success": False, "msg": "Body is required"}), 400

    reviewer = current_user()

    rating = _parse_rating(body.get('rating'))
    if rating is None:
        return jsonify({"success": False, "msg": "La valoración debe estar entre 1 y 5."}), 400

    event = db.session.get(Event, body.get('event_id'))
    if not event:
        return jsonify({"success": False, "msg": "Event not found"}), 404

    reviewed = event.seller
    if not reviewed or reviewed.id == reviewer.id:
        return jsonify({"success": False, "msg": "No puedes escribir una valoración sobre ti mismo."}), 403

    already = db.session.execute(db.select(Review).where(
        (Review.reviewer_id == reviewer.id) & (Review.event_id == event.id)
    )).scalars().first()
    if already:
        return jsonify({"success": False, "msg": "Ya has valorado este evento."}), 409

    new_review = Review(
        rating=rating,
        comment=body.get('comment'),
        reviewer_id=reviewer.id,
        reviewed_id=reviewed.id,
        event_id=event.id
    )
    db.session.add(new_review)
    db.session.flush()

    _recalculate_user_rating(reviewed)

    db.session.add(Notification(
        user_id=reviewed.id,
        type=NotificationType.review_received,
        message=f"{reviewer.username} te ha dejado una reseña de {rating:g} estrellas.",
        related_event_id=event.id
    ))

    db.session.commit()
    return jsonify({"success": True, "data": "All Ok"}), 201


@api.route("/review/<int:review_id>", methods=['PUT'])
@login_required
def update_review(review_id):
    review = db.session.get(Review, review_id)
    if not review:
        return jsonify({"success": False, "msg": "Review not found"}), 404

    # solo el autor; los admins usan /admin/reviews
    if review.reviewer_id != current_user().id:
        return jsonify({"success": False, "msg": "Forbidden"}), 403

    body = request.get_json()
    if not body:
        return jsonify({"success": False, "msg": "Body is required"}), 403

    if 'rating' in body:
        rating = _parse_rating(body['rating'])
        if rating is None:
            return jsonify({"success": False, "msg": "La valoración debe estar entre 1 y 5."}), 400
        review.rating = rating
    if 'comment' in body:
        review.comment = body['comment']

    reviewed = db.session.get(User, review.reviewed_id)
    if reviewed:
        _recalculate_user_rating(reviewed)

    db.session.commit()
    return jsonify({"success": True, "data": "All Ok"}), 200


@api.route("/review/<int:review_id>", methods=['DELETE'])
@login_required
def delete_review(review_id):
    review = db.session.get(Review, review_id)
    if not review:
        return jsonify({"success": False, "msg": "Review not found"}), 404

    # solo el autor; los admins usan /admin/reviews
    if review.reviewer_id != current_user().id:
        return jsonify({"success": False, "msg": "Forbidden"}), 403

    reviewed = db.session.get(User, review.reviewed_id)
    db.session.delete(review)
    db.session.flush()

    if reviewed:
        _recalculate_user_rating(reviewed)

    db.session.commit()
    return jsonify({"success": True, "data": "Review deleted successfully"}), 200
