import os
import secrets
from flask import request, jsonify
from api.routes import api
from api.models import db, User
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timezone, timedelta
from api.custom_routes.email_service import send_reset_email


@api.route('/auth', methods=['POST'])
def register():
    body = request.get_json()
    if not body["email"] or not body["password"]:
        return jsonify({"msg": "Missing JSON in request"}), 403

    # Check if user already exists
    user = db.session.execute(db.select(User).where(
        User.email == body["email"])).scalar_one_or_none()
    if body["type"] == "register":
        if user:
            return jsonify({"msg": "User already exists"}), 403

        # Hash the password
        hashed_password = generate_password_hash(body["password"])

        new_user = User(
            email=body["email"], username=body["username"], password=hashed_password)
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"msg": "User created successfully"}), 201

    if body["type"] == "login":
        if not user:
            return jsonify({"msg": "User not found"}), 404

        # Check password
        if not check_password_hash(user.password, body["password"]):
            return jsonify({"msg": "Invalid credentials"}), 401
        # Block login for soft-deleted (deactivated) accounts
        if user.deleted_at:
            return jsonify({"msg": "Esta cuenta ha sido desactivada"}), 403
        token = create_access_token(identity=str(user.id))
        return jsonify({"data": user.serialize(), "access_token": token}), 200

    return jsonify({"msg": "missing data?"}), 418


@api.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    id = get_jwt_identity()
    user = db.session.get(User, id)
    if not user:
        return jsonify({"msg": "User not found"}), 404
    return jsonify({"data": user.serialize()}), 200


@api.route('/profile', methods=['PUT'])
@jwt_required()
def update_my_profile():
    id = get_jwt_identity()
    body = request.get_json() or {}
    user = db.session.get(User, id)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    # Update basic user fields if provided
    email = body.get('email')
    username = body.get('username')
    if email and email != user.email:
        # check uniqueness
        existing = db.session.execute(db.select(User).where(
            User.email == email)).scalar_one_or_none()
        if existing and existing.id != user.id:
            return jsonify({"msg": "Email already in use"}), 409
        user.email = email
    if username and username != user.username:
        existing = db.session.execute(db.select(User).where(
            User.username == username)).scalar_one_or_none()
        if existing and existing.id != user.id:
            return jsonify({"msg": "Username already in use"}), 409
        user.username = username
    if "profile_picture_url" in body:
        user.profile_picture_url = body.get("profile_picture_url")

    # Update or create profile
    profile = user.profile
    if not profile:
        from api.models import Profile
        profile = Profile(address=body.get('address', ''), phone=body.get('phone', ''), firstname=body.get(
            'firstname', ''), lastname=body.get('lastname', ''), user_id=user.id)
        db.session.add(profile)
    else:
        if 'address' in body:
            profile.address = body.get('address')
        if 'phone' in body:
            profile.phone = body.get('phone')
        if 'firstname' in body:
            profile.firstname = body.get('firstname')
        if 'lastname' in body:
            profile.lastname = body.get('lastname')

    db.session.commit()
    return jsonify({"data": user.serialize()}), 200


@api.route('/profile', methods=['DELETE'])
@jwt_required()
def deactivate_my_account():
    id = get_jwt_identity()
    user = db.session.get(User, id)
    if not user or user.deleted_at:
        return jsonify({"msg": "User not found"}), 404

    user.deleted_at = datetime.now(timezone.utc)
    db.session.commit()
    return jsonify({"msg": "Cuenta desactivada correctamente"}), 200


# Para recuperación de contraseña
@api.route('/auth/forgot-password', methods=['POST'])
def forgot_password():

    body = request.get_json()

    email = body.get('email')

    user = db.session.execute(
        db.select(User).where(User.email == email)
    ).scalar_one_or_none()

    # seguridad:
    # no revelar si el email existe o no
    if not user:
        return jsonify({
            "msg": "Si el email existe, recibirás un enlace"
        }), 200

    token = secrets.token_urlsafe(32)

    user.reset_token = token

    user.reset_token_expires = (
        datetime.now(timezone.utc)
        + timedelta(hours=1)
    )

    db.session.commit()

    send_reset_email(user.email, token)

    return jsonify({
        "msg": "Si el email existe, recibirás un enlace"
    }), 200


@api.route('/auth/reset-password', methods=['POST'])
def reset_password():

    body = request.get_json()

    token = body.get('token')

    new_password = body.get('password')

    user = db.session.execute(
        db.select(User).where(User.reset_token == token)
    ).scalar_one_or_none()

    if not user:
        return jsonify({
            "msg": "Token inválido o expirado"
        }), 400

    expires = user.reset_token_expires
    if expires is not None and expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)

    if not expires or expires < datetime.now(timezone.utc):
        return jsonify({
            "msg": "Token inválido o expirado"
        }), 400

    if check_password_hash(user.password, new_password):
        return jsonify({
            "msg": "No puedes usar la misma contraseña anterior"
        }), 400

    user.password = generate_password_hash(new_password)

    # invalidar token
    user.reset_token = None
    user.reset_token_expires = None

    db.session.commit()

    return jsonify({
        "msg": "Contraseña actualizada correctamente"
    }), 200
