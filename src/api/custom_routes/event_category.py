from flask import request, jsonify
from api.routes import api
from api.models import db, EventCategory


@api.route("/event_category", methods=['GET'])
def get_event_categories():
    event_categories = db.session.execute(db.select(EventCategory)).scalars().all()
    transformed = [event_category.serialize() for event_category in event_categories]
    return jsonify({"success": True, "data": transformed}), 200



@api.route("/event_category/<int:event_category_id>", methods=['GET'])
def get_event_category(event_category_id):
    event_category = db.session.get(EventCategory, event_category_id)
    if event_category:
        transformed = event_category.serialize()
        return jsonify({"success": True, "data": transformed}), 200
    else:
        return jsonify({"success": False, "msg": "EventCategory not found"}), 404



@api.route("/event_category", methods=['POST'])
def create_event_category():
    body = request.get_json()
    #verificación de datos
    if not body:
        return jsonify({"success": False, "msg": "Body is required"}), 403
    
    new_ec = EventCategory(
        event_id=body['event_id'],
        category_id=body['category_id']
    )
    db.session.add(new_ec)
    db.session.commit()
    return jsonify({"success": True, "data": "All Ok"}), 201



@api.route("/event_category/<int:event_category_id>", methods=['DELETE'])
def delete_event_category(event_category_id):
    event_category = db.session.get(EventCategory, event_category_id)
    if not event_category:
        return jsonify({"success": False, "msg": "EventCategory not found"}), 404

    db.session.delete(event_category)
    db.session.commit()
    return jsonify({"success": True, "data": "EventCategory deleted successfully"}), 200


