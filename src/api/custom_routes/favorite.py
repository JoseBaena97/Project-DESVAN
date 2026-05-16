from flask import request, jsonify
from api.routes import api
from api.models import db, Favorite, User, Event

@api.route("/favorite", methods=["GET"])
def get_favorites():
    favorites = db.session.execute(db.select(Favorite)).scalars().all()
    return jsonify([f.serialize() for f in favorites]), 200

@api.route("/favorite/<int:favorite_id>", methods=["GET"])
def get_favorite(favorite_id):
    favorite = db.session.get(Favorite, favorite_id)
    if not favorite:
        return jsonify({"message": "Favorite not found"}), 404
    return jsonify(favorite.serialize()), 200

@api.route("/user/<int:user_id>/favorites", methods=["GET"])
def get_favorites_by_user(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    favs = db.session.execute(db.select(Favorite).where(Favorite.user_id == user_id)).scalars().all()
    return jsonify([f.serialize() for f in favs]), 200

@api.route("/event/<int:event_id>/favorites", methods=["GET"])
def get_favorites_by_event(event_id):
    event = db.session.get(Event, event_id)
    if not event:
        return jsonify({"message": "Event not found"}), 404
    favs = db.session.execute(db.select(Favorite).where(Favorite.event_id == event_id)).scalars().all()
    return jsonify([f.serialize() for f in favs]), 200

@api.route("/favorite", methods=["POST"])
def create_favorite():
    body = request.get_json()
    if not body:
        return jsonify({"message": "Request body is required"}), 400
    user_id = body.get("user_id")
    event_id = body.get("event_id")
    if not user_id or not event_id:
        return jsonify({"message": "user_id and event_id are required"}), 400
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    event = db.session.get(Event, event_id)
    if not event:
        return jsonify({"message": "Event not found"}), 404
    existing = db.session.execute(
        db.select(Favorite).where((Favorite.user_id == user_id) & (Favorite.event_id == event_id))
    ).scalar_one_or_none()
    if existing:
        return jsonify({"message": "Already in favorites"}), 400
    new_fav = Favorite(user_id=user_id, event_id=event_id)
    db.session.add(new_fav)
    db.session.commit()
    return jsonify({"message": "Favorite created successfully", "favorite": new_fav.serialize()}), 201

@api.route("/favorite/<int:favorite_id>", methods=["DELETE"])
def delete_favorite(favorite_id):
    favorite = db.session.get(Favorite, favorite_id)
    if not favorite:
        return jsonify({"message": "Favorite not found"}), 404
    db.session.delete(favorite)
    db.session.commit()
    return jsonify({"message": "Favorite deleted successfully"}), 200
