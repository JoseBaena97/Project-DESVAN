from flask import request, jsonify
from api.routes import api
from api.models import db, Event, EventType, EventStatus
from datetime import datetime

@api.route("/event", methods=['GET'])
def get_events():
    events = db.session.execute(db.select(Event)).scalars().all()
    transformed = [event.serialize() for event in events]
    return jsonify({"success": True, "data": transformed}), 200

@api.route("/event/<int:event_id>", methods=['GET'])
def get_event(event_id):
    event = db.session.get(Event, event_id)
    transformed = event.serialize()
    if event:
        return jsonify({"success": True, "data": transformed}), 200
    else:
        return jsonify({"success": False, "msg": "Event not found"}), 404

@api.route("/event", methods=['POST'])
def create_event():
    #Verificación de datos necesarios
    body = request.get_json()
    

    required_fields = ['title', 'status', 'event_type', 'start_time', 'end_time', 'latitude', 'longitude', 'exact_address', 'city', 'seller_id']
    for field in required_fields:
        if field not in body:
            return jsonify({"success": False, "data": f"Missing field: {field}"}), 403

    
    new_event = Event(
        title=body['title'],
        status=EventStatus(body['status']),
        event_type=EventType(body['event_type']),
        start_time=datetime.fromisoformat(body['start_time'].replace('Z', '+00:00')),#----> no tiene nullable false ni true lo pongo?
        end_time=datetime.fromisoformat(body['end_time'].replace('Z', '+00:00')),#----> no tiene nullable false ni true lo pongo?
        latitude=body['latitude'],
        longitude=body['longitude'],
        exact_address=body['exact_address'],
        city=body['city'],
        seller_id=body['seller_id']
    )

    db.session.add(new_event)
    db.session.commit()
    return jsonify({"success": True, "data": "All Ok"}), 201

@api.route("/event/<int:event_id>", methods=['PUT'])
def update_event(event_id):
    event = db.session.get(Event, event_id)
    if not event:
        return jsonify({"success": False, "data": "Event not found"}), 404

    body = request.get_json()
    if not body:
        return jsonify({"success": False,"data": "Missing body"}), 400

    
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
        event.start_time = datetime.fromisoformat(body['start_time'].replace('Z', '+00:00'))
    if 'end_time' in body:
        event.end_time = datetime.fromisoformat(body['end_time'].replace('Z', '+00:00'))
    if 'max_capacity' in body:
        event.max_capacity = body['max_capacity']
    if 'latitude' in body:
        event.latitude = body['latitude']
    if 'longitude' in body:
        event.longitude = body['longitude']
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
def delete_event(event_id):
    event = db.session.get(Event, event_id)
    if not event:
        return jsonify({"success": False,"msg": "Event not found"}), 404
    db.session.delete(event)
    db.session.commit()
    return jsonify({"success": True, "data": "Event deleted successfully"}), 200