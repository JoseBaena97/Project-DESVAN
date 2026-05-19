from flask import request, jsonify
from api.routes import api
from api.models import db, User
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash

@api.route('/auth', methods=['POST'])
def register():
    body = request.get_json()
    if not body["email"] or not body["password"]:
        return jsonify({"msg": "Missing JSON in request"}), 403
    
    # Check if user already exists
    user = db.session.execute(db.select(User).where(User.email == body["email"])).scalar_one_or_none()
    if body["type"] == "register":
        if user:
            return jsonify({"msg": "User already exists"}), 403
        
        # Hash the password
        hashed_password = generate_password_hash(body["password"])
        
        new_user = User(email=body["email"], username=body["username"], password=hashed_password)
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"msg": "User created successfully"}), 201

    if body["type"] == "login":
        if not user:
            return jsonify({"msg": "User not found"}), 404
        
        # Check password
        if not check_password_hash(user.password, body["password"]):
            return jsonify({"msg": "Invalid credentials"}), 401
        token = create_access_token(identity=user.id)
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