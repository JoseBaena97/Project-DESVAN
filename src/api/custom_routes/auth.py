from flask import request, jsonify
from api.routes import api
from api.models import db, User
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timezone


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
