from flask import request, jsonify
from api.routes import api
from api.models import db, Review


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

@api.route("/review", methods=['POST'])
def create_review():
    body = request.get_json()
    #verificación de datos

    required_fields = ['rating', 'reviewer_id', 'reviewed_id', 'event_id']
    for field in required_fields:
        if field not in body:
            return jsonify({"success": False, "msg": f"Missing field: {field}"}), 403


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
def update_review(review_id):
    review = db.session.get(Review, review_id)
    if not review:
        return jsonify({"success": False, "msg": "Review not found"}), 404

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
def delete_review(review_id):
    review = db.session.get(Review, review_id)
    if not review:
        return jsonify({"success": False, "msg": "Review not found"}), 404

    db.session.delete(review)
    db.session.commit()
    return jsonify({"success": True, "data": "Review deleted successfully"}), 200
