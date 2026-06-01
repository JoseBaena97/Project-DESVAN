from flask import request, jsonify
from flask_jwt_extended import jwt_required
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


@api.route("/user/<int:user_id>", methods=["PUT"])
def update_user(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
        
    body = request.get_json()
    if not body:
        return jsonify({"message": "Request body is required"}), 400
        
    if "email" in body:
        user.email = body["email"]
    if "password" in body:
        user.password = body["password"]
    if "username" in body:
        user.username = body["username"]
    if "bio" in body:
        user.bio = body["bio"]
    if "profile_picture_url" in body:
        user.profile_picture_url = body["profile_picture_url"]
        
    db.session.commit()
    return jsonify({"message": "User updated successfully", "user": user.serialize()}), 200

@api.route("/user/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    user = db.session.get(User, user_id)
    if not user or user.deleted_at:
        return jsonify({"message": "User not found"}), 404
        
    user.deleted_at = datetime.now(timezone.utc)
    db.session.commit()
    return jsonify({"message": "User deleted successfully"}), 200