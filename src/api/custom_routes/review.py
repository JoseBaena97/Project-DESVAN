from flask import request, jsonify
from api.routes import api
from api.models import db, Review, User, Event
from flask_jwt_extended import jwt_required, get_jwt_identity


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


@api.route("/review", methods=['POST'])
def create_review():
    body = request.get_json()
    # verificación de datos

    required_fields = ['rating', 'reviewer_id', 'reviewed_id', 'event_id']
    for field in required_fields:
        if field not in body:
            return jsonify({"success": False, "msg": f"Missing field: {field}"}), 403

    if body['reviewer_id'] == body['reviewed_id']:
        return jsonify({"success": False, "msg": "No puedes escribir una valoración sobre ti mismo."}), 403

    new_review = Review(
        rating=body['rating'],
        comment=body.get('comment'),
        reviewer_id=body['reviewer_id'],
        reviewed_id=body['reviewed_id'],
        event_id=body['event_id']
    )

    db.session.add(new_review)
    db.session.commit()
    return jsonify({"success": True, "data": "All Ok"}), 201


@api.route("/review/<int:review_id>", methods=['PUT'])
@jwt_required()
def update_review(review_id):
    review = db.session.get(Review, review_id)
    if not review:
        return jsonify({"success": False, "msg": "Review not found"}), 404

    reviewer_id = get_jwt_identity()
    try:
        reviewer_id = int(reviewer_id)
    except Exception:
        pass

    if str(review.reviewer_id) != str(reviewer_id):
        return jsonify({"success": False, "msg": "Unauthorized"}), 401

    body = request.get_json()
    if not body:
        return jsonify({"success": False, "msg": "Body is required"}), 403

    if 'rating' in body:
        review.rating = body['rating']
    if 'comment' in body:
        review.comment = body['comment']

    db.session.commit()
    return jsonify({"success": True, "data": "All Ok"}), 200


@api.route("/review/<int:review_id>", methods=['DELETE'])
@jwt_required()
def delete_review(review_id):
    review = db.session.get(Review, review_id)
    if not review:
        return jsonify({"success": False, "msg": "Review not found"}), 404

    reviewer_id = get_jwt_identity()
    try:
        reviewer_id = int(reviewer_id)
    except Exception:
        pass

    if str(review.reviewer_id) != str(reviewer_id):
        return jsonify({"success": False, "msg": "Unauthorized"}), 401

    db.session.delete(review)
    db.session.commit()
    return jsonify({"success": True, "data": "Review deleted successfully"}), 200
