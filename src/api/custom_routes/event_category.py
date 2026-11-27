from flask import request, jsonify
from api.routes import api
from api.models import db, EventCategory, Event, Category
from api.auth_helpers import login_required, current_user, is_owner_or_admin


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



# Asignar una categoría a un evento: solo su organizador o un admin
@api.route("/event_category", methods=['POST'])
@login_required
def create_event_category():
    body = request.get_json(silent=True)
    #verificación de datos
    if not body:
        return jsonify({"success": False, "msg": "Body is required"}), 400

    event = db.session.get(Event, body.get('event_id'))
    if not event:
        return jsonify({"success": False, "msg": "Event not found"}), 404
    if not is_owner_or_admin(current_user(), event.seller_id):
        return jsonify({"success": False, "msg": "Forbidden"}), 403
    category = db.session.get(Category, body.get('category_id'))
    if not category:
        return jsonify({"success": False, "msg": "Category not found"}), 404

    new_ec = EventCategory(
        event_id=event.id,
        category_id=category.id
    )
    db.session.add(new_ec)
    db.session.commit()
    return jsonify({"success": True, "data": "All Ok"}), 201



@api.route("/event_category/<int:event_category_id>", methods=['DELETE'])
@login_required
def delete_event_category(event_category_id):
    event_category = db.session.get(EventCategory, event_category_id)
    if not event_category:
        return jsonify({"success": False, "msg": "EventCategory not found"}), 404
    if not is_owner_or_admin(current_user(), event_category.event.seller_id):
        return jsonify({"success": False, "msg": "Forbidden"}), 403

    db.session.delete(event_category)
    db.session.commit()
    return jsonify({"success": True, "data": "EventCategory deleted successfully"}), 200


