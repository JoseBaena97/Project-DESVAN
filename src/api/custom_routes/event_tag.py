from flask import request, jsonify
from api.routes import api
from api.models import db, EventTag, Event, Tag

@api.route("/event-tag", methods=["GET"])
def get_event_tags():
    ets = db.session.execute(db.select(EventTag)).scalars().all()
    return jsonify([et.serialize() for et in ets]), 200

@api.route("/event-tag/<int:et_id>", methods=["GET"])
def get_event_tag(et_id):
    et = db.session.get(EventTag, et_id)
    if not et:
        return jsonify({"message": "EventTag not found"}), 404
    return jsonify(et.serialize()), 200

# Obtener tags de un evento
@api.route("/event/<int:event_id>/tags", methods=["GET"])
def get_tags_by_event(event_id):
    event = db.session.get(Event, event_id)
    if not event:
        return jsonify({"message": "Event not found"}), 404
    ets = db.session.execute(
        db.select(EventTag).where(EventTag.event_id == event_id)
    ).scalars().all()
    return jsonify([et.serialize() for et in ets]), 200

@api.route("/event-tag", methods=["POST"])
def create_event_tag():
    body = request.get_json()
    if not body:
        return jsonify({"message": "Request body is required"}), 400
    event_id = body.get("event_id")
    tag_id = body.get("tag_id")
    if not event_id or not tag_id:
        return jsonify({"message": "event_id and tag_id are required"}), 400
    event = db.session.get(Event, event_id)
    if not event:
        return jsonify({"message": "Event not found"}), 404
    tag = db.session.get(Tag, tag_id)
    if not tag:
        return jsonify({"message": "Tag not found"}), 404
    existing = db.session.execute(
        db.select(EventTag).where(
            (EventTag.event_id == event_id) & (EventTag.tag_id == tag_id)
        )
    ).scalar_one_or_none()
    if existing:
        return jsonify({"message": "This tag is already assigned to this event"}), 400
    new_et = EventTag(event_id=event_id, tag_id=tag_id)
    db.session.add(new_et)
    db.session.commit()
    return jsonify({"message": "EventTag created successfully", "event_tag": new_et.serialize()}), 201

@api.route("/event-tag/<int:et_id>", methods=["DELETE"])
def delete_event_tag(et_id):
    et = db.session.get(EventTag, et_id)
    if not et:
        return jsonify({"message": "EventTag not found"}), 404
    db.session.delete(et)
    db.session.commit()
    return jsonify({"message": "EventTag deleted successfully"}), 200
