from flask import request, jsonify
from api.routes import api
from api.models import db, Event, EventType, EventStatus
from datetime import datetime
from flask_jwt_extended import jwt_required, get_jwt_identity


@api.route("/event/public", methods=['GET'])
def get_events_public():
    events = db.session.execute(db.select(Event)).scalars().all()
    transformed = [event.public_serialize() for event in events]
    return jsonify({"success": True, "data": transformed}), 200


@api.route("/event/private", methods=['GET'])
@jwt_required()
def get_events_private():
    events = db.session.execute(db.select(Event)).scalars().all()
    transformed = [event.serialize() for event in events]
    return jsonify({"success": True, "data": transformed}), 200


@api.route("/event/<int:event_id>", methods=['GET'])
@jwt_required()
def get_event(event_id):
    event = db.session.get(Event, event_id)
    transformed = event.serialize()
    if event:
        return jsonify({"success": True, "data": transformed}), 200
    else:
        return jsonify({"success": False, "msg": "Event not found"}), 404


@api.route("/event", methods=['POST'])
@jwt_required()
def create_event():
    # Verificación de datos necesarios
    body = request.get_json()

    seller_id = get_jwt_identity()

    required_fields = ['title', 'event_type', 'start_time',
                       'end_time', 'city']
    for field in required_fields:
        if not body.get(field):
            return jsonify({"success": False, "data": f"Missing field: {field}"}), 403

     # EVENT TYPE

    event_type_value = body.get("event_type")

    if not event_type_value:
        return jsonify({"msg": "event_type required"}), 400

    try:
        event_type = EventType(event_type_value)
    except ValueError:
        return jsonify({"msg": "Invalid event_type"}), 400

    # DATES
    try:
        start_time = datetime.fromisoformat(
            body['start_time'].replace('Z', '+00:00'))
        end_time = datetime.fromisoformat(
            body['end_time'].replace('Z', '+00:00'))
    except Exception:
        return jsonify({
            "success": False,
            "msg": "Invalid start_time or end_time format"
        }), 400

    exact_address = body.get('exact_address')
    if not exact_address:
        place = body.get('place', '').strip()
        city = body.get('city', '').strip()
        if place and city:
            exact_address = f"{place}, {city}"

    if not exact_address:
        return jsonify({"success": False, "data": "Missing field: exact_address"}), 403

    start_date = None
    end_date = None
    if body.get('start_date'):
        try:
            start_date = datetime.fromisoformat(body['start_date'])
        except Exception:
            return jsonify({"success": False, "msg": "Invalid start_date format"}), 400
    if body.get('end_date'):
        try:
            end_date = datetime.fromisoformat(body['end_date'])
        except Exception:
            return jsonify({"success": False, "msg": "Invalid end_date format"}), 400

    new_event = Event(
        title=body['title'],
        event_type=event_type,
        description=body.get('description'),
        start_time=start_time,
        end_time=end_time,
        start_date=start_date,
        end_date=end_date,
        max_capacity=int(body['max_capacity']) if body.get(
            'max_capacity') else None,
        exact_address=exact_address,
        city=body['city'],
        seller_id=seller_id
    )

    db.session.add(new_event)
    db.session.commit()
    return jsonify({"success": True, "data": new_event.id}), 201


@api.route("/event/<int:event_id>", methods=['PUT'])
@jwt_required()
def update_event(event_id):
    event = db.session.get(Event, event_id)
    if not event:
        return jsonify({"success": False, "data": "Event not found"}), 404

    body = request.get_json()
    seller_id = get_jwt_identity()
    if event.seller_id != seller_id:
        return jsonify({"success": False, "data": "Unauthorized"}), 400
    if not body:
        return jsonify({"success": False, "data": "Missing body"}), 400

    if 'title' in body:
        event.title = body['title']
    if 'description' in body:
        event.description = body['description']
    if 'image_url' in body:
        event.image_url = body['image_url']
    if 'status' in body:
        event.status = EventStatus(body['status'])
    if 'event_type' in body:
        event.event_type = EventType(body['event_type'])
    if 'start_time' in body:
        event.start_time = datetime.fromisoformat(
            body['start_time'].replace('Z', '+00:00'))
    if 'end_time' in body:
        event.end_time = datetime.fromisoformat(
            body['end_time'].replace('Z', '+00:00'))
    if 'max_capacity' in body:
        try:
            event.max_capacity = int(
                body['max_capacity']) if body['max_capacity'] is not None else None
        except Exception:
            pass
    if 'exact_address' in body:
        event.exact_address = body['exact_address']
    if 'place' in body:
        event.place = body['place']
    if 'city' in body:
        event.city = body['city']
    if 'postal_code' in body:
        event.postal_code = body['postal_code']

    db.session.commit()
    return jsonify({"success": True, "data": "All Ok"}), 200


@api.route("/event/<int:event_id>", methods=['DELETE'])
@jwt_required()
def delete_event(event_id):
    event = db.session.get(Event, event_id)
    seller_id = get_jwt_identity()
    if event.seller_id != seller_id:
        return jsonify({"success": False, "data": "Unauthorized"}), 400
    if not event:
        return jsonify({"success": False, "msg": "Event not found"}), 404
    db.session.delete(event)
    db.session.commit()
    return jsonify({"success": True, "data": "Event deleted successfully"}), 200
