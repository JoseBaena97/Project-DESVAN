from flask import request, jsonify
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

@api.route("/user", methods=["POST"])
def create_user():
    body = request.get_json()
    if not body:
        return jsonify({"message": "Request body is required"}), 400
    
    email = body.get("email")
    password = body.get("password")
    username = body.get("username")

    if not email or not password or not username:
        return jsonify({"message": "Email, password and username are required"}), 400
    
    # Check if user already exists
    existing_user = db.session.execute(
        db.select(User).where((User.email == email) | (User.username == username))
    ).scalar_one_or_none()
    
    if existing_user:
        return jsonify({"message": "User with this email or username already exists"}), 400

    new_user = User(
        email=email,
        password=password,
        username=username,
        bio=body.get("bio"),
        profile_picture_url=body.get("profile_picture_url")
    )
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({"message": "User created successfully", "user": new_user.serialize()}), 201

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