from flask import request, jsonify
from flask_jwt_extended import jwt_required
from api.routes import api
from api.models import db, Profile, User
from api.auth_helpers import get_current_user, is_owner_or_admin

# El perfil guarda teléfono y dirección: nada de aquí es público.
# Para editar el perfil propio la web usa PUT /profile (auth.py).


# Todos los perfiles: solo admin
@api.route("/profiles", methods=["GET"])
@jwt_required()
def get_profiles():
    requester = get_current_user()
    if not requester:
        return jsonify({"message": "Unauthorized"}), 401
    if not requester.is_admin:
        return jsonify({"message": "Forbidden"}), 403
    profiles = db.session.execute(db.select(Profile)).scalars().all()
    return jsonify([profile.serialize() for profile in profiles]), 200


@api.route("/profile/<int:profile_id>", methods=["GET"])
@jwt_required()
def get_perfil(profile_id):
    requester = get_current_user()
    if not requester:
        return jsonify({"message": "Unauthorized"}), 401
    profile = db.session.get(Profile, profile_id)
    if not profile:
        return jsonify({"message": "Profile not found"}), 404
    if not is_owner_or_admin(requester, profile.user_id):
        return jsonify({"message": "Forbidden"}), 403
    return jsonify(profile.serialize()), 200


# Obtener perfil por user_id
@api.route("/user/<int:user_id>/profile", methods=["GET"])
@jwt_required()
def get_profile_by_user(user_id):
    requester = get_current_user()
    if not requester:
        return jsonify({"message": "Unauthorized"}), 401
    if not is_owner_or_admin(requester, user_id):
        return jsonify({"message": "Forbidden"}), 403
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    if not user.profile:
        return jsonify({"message": "Profile not found for this user"}), 404
    return jsonify(user.profile.serialize()), 200


# Crear el perfil del usuario del token (el user_id del body se ignora)
@api.route("/profile", methods=["POST"])
@jwt_required()
def create_profile():
    requester = get_current_user()
    if not requester:
        return jsonify({"message": "Unauthorized"}), 401

    body = request.get_json(silent=True)
    if not body:
        return jsonify({"message": "Request body is required"}), 400

    address = body.get("address")
    phone = body.get("phone")
    firstname = body.get("firstname")
    lastname = body.get("lastname")

    if not address or not phone or not firstname or not lastname:
        return jsonify({"message": "address, phone, firstname and lastname are required"}), 400

    if requester.profile:
        return jsonify({"message": "This user already has a profile"}), 400

    new_profile = Profile(
        user_id=requester.id,
        address=address,
        phone=phone,
        firstname=firstname,
        lastname=lastname
    )
    db.session.add(new_profile)
    db.session.commit()

    return jsonify({"message": "Profile created successfully", "profile": new_profile.serialize()}), 201


@api.route("/profile/<int:profile_id>", methods=["PUT"])
@jwt_required()
def update_profile(profile_id):
    requester = get_current_user()
    if not requester:
        return jsonify({"message": "Unauthorized"}), 401
    profile = db.session.get(Profile, profile_id)
    if not profile:
        return jsonify({"message": "Profile not found"}), 404
    if not is_owner_or_admin(requester, profile.user_id):
        return jsonify({"message": "Forbidden"}), 403

    body = request.get_json(silent=True)
    if not body:
        return jsonify({"message": "Request body is required"}), 400

    if "address" in body:
        profile.address = body["address"]
    if "phone" in body:
        profile.phone = body["phone"]
    if "firstname" in body:
        profile.firstname = body["firstname"]
    if "lastname" in body:
        profile.lastname = body["lastname"]

    db.session.commit()
    return jsonify({"message": "Profile updated successfully", "profile": profile.serialize()}), 200
