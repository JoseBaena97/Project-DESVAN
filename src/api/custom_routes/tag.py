from flask import request, jsonify
from api.routes import api
from api.models import db, Tag

@api.route("/tag", methods=["GET"])
def get_tags():
    tags = db.session.execute(db.select(Tag)).scalars().all()
    return jsonify([tag.serialize() for tag in tags]), 200

@api.route("/tag/<int:tag_id>", methods=["GET"])
def get_tag(tag_id):
    tag = db.session.get(Tag, tag_id)
    if not tag:
        return jsonify({"message": "Tag not found"}), 404
    return jsonify(tag.serialize()), 200

@api.route("/tag", methods=["POST"])
def create_tag():
    body = request.get_json()
    if not body:
        return jsonify({"message": "Request body is required"}), 400
    name = body.get("name")
    if not name:
        return jsonify({"message": "name is required"}), 400
    existing = db.session.execute(
        db.select(Tag).where(Tag.name == name)
    ).scalar_one_or_none()
    if existing:
        return jsonify({"message": "Tag with this name already exists"}), 400
    new_tag = Tag(name=name)
    db.session.add(new_tag)
    db.session.commit()
    return jsonify({"message": "Tag created successfully", "tag": new_tag.serialize()}), 201

@api.route("/tag/<int:tag_id>", methods=["PUT"])
def update_tag(tag_id):
    tag = db.session.get(Tag, tag_id)
    if not tag:
        return jsonify({"message": "Tag not found"}), 404
    body = request.get_json()
    if not body:
        return jsonify({"message": "Request body is required"}), 400
    if "name" in body:
        tag.name = body["name"]
    db.session.commit()
    return jsonify({"message": "Tag updated successfully", "tag": tag.serialize()}), 200

@api.route("/tag/<int:tag_id>", methods=["DELETE"])
def delete_tag(tag_id):
    tag = db.session.get(Tag, tag_id)
    if not tag:
        return jsonify({"message": "Tag not found"}), 404
    db.session.delete(tag)
    db.session.commit()
    return jsonify({"message": "Tag deleted successfully"}), 200
