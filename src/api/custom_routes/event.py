from flask import request, jsonify
from api.routes import api
from api.models import db, Event, EventType, EventStatus, User
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
    if not event:
        return jsonify({"success": False, "msg": "Event not found"}), 404

    try:
        transformed = event.serialize()
        return jsonify({"success": True, "data": transformed}), 200
    except Exception as e:
        return jsonify({"success": False, "msg": str(e)}), 500


@api.route("/event", methods=['POST'])
@jwt_required()
def create_event():
    # Verificación de datos necesarios
    body = request.get_json()

    seller_id = get_jwt_identity()

    # Intentar convertir identity a entero si vino como string (tokens antiguos)
    try:
        seller_id = int(seller_id)
    except Exception:
        pass

    user = db.session.get(User, seller_id)
    if (not user or not user.profile
            or not (user.profile.phone and user.profile.phone.strip())
            or not (user.profile.address and user.profile.address.strip())):
        return jsonify({
            "success": False,
            "msg": "Debes completar tu perfil con teléfono y dirección antes de crear un evento."
        }), 403

    required_fields = ['title', 'event_type',
                       'start_time', 'end_time', 'exact_address']
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
        image_url=body.get('image_url'),
        start_time=start_time,
        end_time=end_time,
        start_date=start_date,
        end_date=end_date,
        max_capacity=int(body['max_capacity']) if body.get(
            'max_capacity') else None,
        exact_address=body['exact_address'],
        latitude=body.get('latitude'),
        longitude=body.get('longitude'),
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

    try:
        body = request.get_json()
        seller_id = get_jwt_identity()
        try:
            seller_id = int(seller_id)
        except Exception:
            pass

        # Comparación robusta aceptando string o int
        if str(event.seller_id) != str(seller_id):
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
            try:
                event.status = EventStatus(body['status'])
            except Exception:
                pass
        if 'event_type' in body:
            try:
                event.event_type = EventType(body['event_type'])
            except Exception:
                pass
        if 'start_time' in body:
            try:
                event.start_time = datetime.fromisoformat(
                    body['start_time'].replace('Z', '+00:00'))
            except Exception:
                pass
        if 'start_date' in body:
            try:
                event.start_date = datetime.fromisoformat(body['start_date'])
            except Exception:
                pass
        if 'end_time' in body:
            try:
                event.end_time = datetime.fromisoformat(
                    body['end_time'].replace('Z', '+00:00'))
            except Exception:
                pass
        if 'end_date' in body:
            try:
                event.end_date = datetime.fromisoformat(body['end_date'])
            except Exception:
                pass
        if 'max_capacity' in body:
            try:
                event.max_capacity = int(
                    body['max_capacity']) if body['max_capacity'] is not None else None
            except Exception:
                pass
        if 'exact_address' in body:
            event.exact_address = body['exact_address']
        if 'latitude' in body:
            event.latitude = body['latitude']
        if 'longitude' in body:
            event.longitude = body['longitude']

        db.session.commit()
        return jsonify({"success": True, "data": "All Ok"}), 200
    except Exception as e:
        return jsonify({"success": False, "msg": str(e)}), 500


@api.route("/event/<int:event_id>", methods=['DELETE'])
@jwt_required()
def delete_event(event_id):
    event = db.session.get(Event, event_id)
    if not event:
        return jsonify({"success": False, "msg": "Event not found"}), 404

    seller_id = get_jwt_identity()
    try:
        seller_id = int(seller_id)
    except Exception:
        pass

    if str(event.seller_id) != str(seller_id):
        return jsonify({"success": False, "data": "Unauthorized"}), 400
    db.session.delete(event)
    db.session.commit()
    return jsonify({"success": True, "data": "Event deleted successfully"}), 200


@api.route("/event/nearby", methods=['GET'])
@jwt_required()
def get_nearby_events():
    """
    Obtiene eventos cercanos a una ubicación específica.
    Parámetros query:
    - latitude: latitud (requerido)
    - longitude: longitud (requerido)
    - distance: distancia en km (opcional, default 10)
    """
    try:
        latitude = request.args.get('latitude', type=float)
        longitude = request.args.get('longitude', type=float)
        distance = request.args.get('distance', default=10, type=float)

        if latitude is None or longitude is None:
            return jsonify({
                "success": False,
                "msg": "latitude and longitude are required"
            }), 400

        # Obtener todos los eventos
        all_events = db.session.execute(db.select(Event)).scalars().all()

        # Función para calcular distancia Haversine
        def haversine_distance(lat1, lon1, lat2, lon2):
            from math import radians, cos, sin, asin, sqrt

            lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])

            dlon = lon2 - lon1
            dlat = lat2 - lat1
            a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
            c = 2 * asin(sqrt(a))
            r = 6371  # Radio de la tierra en km

            return c * r

        # Filtrar eventos cercanos
        nearby_events = []
        for event in all_events:
            if event.latitude and event.longitude:
                dist = haversine_distance(
                    latitude, longitude, event.latitude, event.longitude)
                if dist <= distance:
                    nearby_events.append({
                        "event": event.serialize(),
                        "distance_km": round(dist, 2)
                    })

        # Ordenar por distancia
        nearby_events.sort(key=lambda x: x['distance_km'])

        return jsonify({
            "success": True,
            "data": nearby_events,
            "count": len(nearby_events)
        }), 200

    except Exception as e:
        return jsonify({"success": False, "msg": str(e)}), 500
