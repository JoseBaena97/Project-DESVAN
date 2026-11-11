from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from api.routes import api
from api.models import db, User
from datetime import datetime, timezone

@api.route("/user", methods=["GET"])
def get_users():
    users = db.session.execute(db.select(User).where(User.deleted_at.is_(None))).scalars().all()
    return jsonify([user.serialize() for user in users]), 200

@api.route("/user/<int:user_id>", methods=["GET"])
def get_user(user_id):
    user = db.session.get(User, user_id)
    if not user or user.deleted_at:
        return jsonify({"message": "User not found"}), 404
    return jsonify(user.serialize()), 200


@api.route("/user/<int:user_id>/public", methods=["GET"])
@jwt_required()
def get_user_public_profile(user_id):
    user = db.session.get(User, user_id)
    if not user or user.deleted_at:
        return jsonify({"message": "User not found"}), 404
    return jsonify({"data": user.public_profile_serialize()}), 200


def _get_requester():
    """Usuario que hace la petición, según el token. None si no existe o está desactivado."""
    requester = db.session.get(User, int(get_jwt_identity()))
    if not requester or requester.deleted_at:
        return None
    return requester


@api.route("/user/<int:user_id>", methods=["PUT"])
@jwt_required()
def update_user(user_id):
    requester = _get_requester()
    if not requester:
        return jsonify({"message": "Unauthorized"}), 401
    # solo el propio usuario o un admin pueden editar la cuenta
    if requester.id != user_id and not requester.is_admin:
        return jsonify({"message": "Forbidden"}), 403

    user = db.session.get(User, user_id)
    if not user or user.deleted_at:
        return jsonify({"message": "User not found"}), 404

    body = request.get_json(silent=True)
    if not body:
        return jsonify({"message": "Request body is required"}), 400

    if "email" in body and body["email"] != user.email:
        exists = db.session.execute(
            db.select(User).where(User.email == body["email"])).scalar_one_or_none()
        if exists:
            return jsonify({"message": "Email already in use"}), 409
        user.email = body["email"]
    if "username" in body and body["username"] != user.username:
        exists = db.session.execute(
            db.select(User).where(User.username == body["username"])).scalar_one_or_none()
        if exists:
            return jsonify({"message": "Username already in use"}), 409
        user.username = body["username"]
    if "password" in body:
        # solo el propio usuario, confirmando la contraseña actual
        if requester.id != user_id:
            return jsonify({"message": "Only the account owner can change the password"}), 403
        current = body.get("current_password")
        if not current or not check_password_hash(user.password, current):
            return jsonify({"message": "Current password is incorrect"}), 401
        if not body["password"]:
            return jsonify({"message": "Password cannot be empty"}), 400
        user.password = generate_password_hash(body["password"])
    if "bio" in body:
        user.bio = body["bio"]
    if "profile_picture_url" in body:
        user.profile_picture_url = body["profile_picture_url"]

    db.session.commit()
    return jsonify({"message": "User updated successfully", "user": user.serialize()}), 200


@api.route("/user/<int:user_id>", methods=["DELETE"])
@jwt_required()
def delete_user(user_id):
    requester = _get_requester()
    if not requester:
        return jsonify({"message": "Unauthorized"}), 401
    # solo el propio usuario o un admin pueden desactivar la cuenta
    if requester.id != user_id and not requester.is_admin:
        return jsonify({"message": "Forbidden"}), 403

    user = db.session.get(User, user_id)
    if not user or user.deleted_at:
        return jsonify({"message": "User not found"}), 404

    user.deleted_at = datetime.now(timezone.utc)
    db.session.commit()
    return jsonify({"message": "User deleted successfully"}), 200