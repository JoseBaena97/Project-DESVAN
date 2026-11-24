from flask import request, jsonify
from api.routes import api
from api.models import db, Favorite, User, Event
from api.auth_helpers import login_required, admin_required, current_user, is_owner_or_admin


# Todos los favoritos: solo admin
@api.route("/favorite", methods=["GET"])
@admin_required
def get_favorites():
    favorites = db.session.execute(db.select(Favorite)).scalars().all()
    return jsonify([f.serialize() for f in favorites]), 200


@api.route("/favorite/<int:favorite_id>", methods=["GET"])
@login_required
def get_favorite(favorite_id):
    favorite = db.session.get(Favorite, favorite_id)
    if not favorite or not is_owner_or_admin(current_user(), favorite.user_id):
        return jsonify({"message": "Favorite not found"}), 404
    return jsonify(favorite.serialize()), 200


@api.route("/user/<int:user_id>/favorites", methods=["GET"])
@login_required
def get_favorites_by_user(user_id):
    if not is_owner_or_admin(current_user(), user_id):
        return jsonify({"message": "Forbidden"}), 403
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    favs = db.session.execute(db.select(Favorite).where(
        Favorite.user_id == user_id)).scalars().all()
    return jsonify([f.serialize() for f in favs]), 200


# Quién tiene un evento en favoritos: solo el organizador o un admin
@api.route("/event/<int:event_id>/favorites", methods=["GET"])
@login_required
def get_favorites_by_event(event_id):
    event = db.session.get(Event, event_id)
    if not event:
        return jsonify({"message": "Event not found"}), 404
    if not is_owner_or_admin(current_user(), event.seller_id):
        return jsonify({"message": "Forbidden"}), 403
    favs = db.session.execute(db.select(Favorite).where(
        Favorite.event_id == event_id)).scalars().all()
    return jsonify([f.serialize() for f in favs]), 200


@api.route("/favorite", methods=["POST"])
@login_required
def create_favorite():
    body = request.get_json(silent=True)
    if not body:
        return jsonify({"message": "Request body is required"}), 400
    event_id = body.get("event_id")
    if not event_id:
        return jsonify({"message": "event_id is required"}), 400
    user_id = current_user().id
    event = db.session.get(Event, event_id)
    if not event:
        return jsonify({"message": "Event not found"}), 404
    existing = db.session.execute(
        db.select(Favorite).where((Favorite.user_id == user_id)
                                  & (Favorite.event_id == event_id))
    ).scalar_one_or_none()
    if existing:
        return jsonify({"message": "Already in favorites"}), 400
    new_fav = Favorite(user_id=user_id, event_id=event_id)
    db.session.add(new_fav)
    db.session.commit()
    return jsonify({"message": "Favorite created successfully", "favorite": new_fav.serialize()}), 201


@api.route("/favorite/<int:favorite_id>", methods=["DELETE"])
@login_required
def delete_favorite(favorite_id):
    favorite = db.session.get(Favorite, favorite_id)
    if not favorite:
        return jsonify({"message": "Favorite not found"}), 404
    if favorite.user_id != current_user().id:
        return jsonify({"message": "Forbidden"}), 403
    db.session.delete(favorite)
    db.session.commit()
    return jsonify({"message": "Favorite deleted successfully"}), 200
