from flask import request, jsonify
from api.routes import api
from api.models import db, Profile, User

@api.route("/profile", methods=["GET"])
def get_profiles():
    profiles = db.session.execute(db.select(Profile)).scalars().all()
    return jsonify([profile.serialize() for profile in profiles]), 200

@api.route("/profile/<int:profile_id>", methods=["GET"])
def get_perfil(profile_id):
    profile = db.session.get(Profile, profile_id)
    if not profile:
        return jsonify({"message": "Profile not found"}), 404
    return jsonify(profile.serialize()), 200

# Obtener perfil por user_id
@api.route("/user/<int:user_id>/profile", methods=["GET"])
def get_profile_by_user(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    if not user.profile:
        return jsonify({"message": "Profile not found for this user"}), 404
    return jsonify(user.profile.serialize()), 200

@api.route("/profile", methods=["POST"])
def create_profile():
    body = request.get_json()
    if not body:
        return jsonify({"message": "Request body is required"}), 400
    
    user_id = body.get("user_id")
    address = body.get("address")
    phone = body.get("phone")
    firstname = body.get("firstname")
    lastname = body.get("lastname")

    if not user_id or not address or not phone or not firstname or not lastname:
        return jsonify({"message": "user_id, address, phone, firstname and lastname are required"}), 400
    
    # Verificar que el usuario existe
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    
    # Verificar que el usuario no tenga ya un perfil
    existing_profile = db.session.execute(
        db.select(Profile).where(Profile.user_id == user_id)
    ).scalar_one_or_none()
    
    if existing_profile:
        return jsonify({"message": "This user already has a profile"}), 400

    new_profile = Profile(
        user_id=user_id,
        address=address,
        phone=phone,
        firstname=firstname,
        lastname=lastname
    )
    db.session.add(new_profile)
    db.session.commit()
    
    return jsonify({"message": "Profile created successfully", "profile": new_profile.serialize()}), 201

@api.route("/profile/<int:profile_id>", methods=["PUT"])
def update_profile(profile_id):
    profile = db.session.get(Profile, profile_id)
    if not profile:
        return jsonify({"message": "Profile not found"}), 404
        
    body = request.get_json()
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