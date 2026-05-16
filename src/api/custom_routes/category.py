from flask import request, jsonify
from api.routes import api
from api.models import db, Category


@api.route("/category", methods=['GET'])
def get_categories():
    categories = db.session.execute(db.select(Category)).scalars().all()
    transformed = [category.serialize() for category in categories]
    return jsonify({"success": True, "data": transformed, "total":len(transformed)}), 200



@api.route("/category/<int:category_id>", methods=['GET'])
def get_category(category_id):
    category = db.session.get(Category, category_id)
    if category:
        transformed = category.serialize()
        return jsonify({"success": True, "data": transformed}), 200
    else:
        return jsonify({"success": False, "msg": "Category not found"}), 404
    



@api.route("/category", methods=['POST'])
def create_category():
    body = request.get_json()
    #verificación de datos necesarios  
    if not body:
        return jsonify({"success": False, "msg": "Missing field: name"}), 403
    
    #creación de categoría
    new_category = Category(name=body['name'])
    db.session.add(new_category)
    db.session.commit()
    return jsonify({"success": True, "data": "All Ok"}), 201



@api.route("/category/<int:category_id>", methods=['PUT'])
def update_category(category_id):
    category = db.session.get(Category, category_id)
    if not category:
        return jsonify({"success": False, "msg": "Category not found"}), 404

    body = request.get_json()
    if not body:
        return jsonify({"success": False, "msg": "Missing body"}), 400

    
    category.name = body['name']
    db.session.commit()
    return jsonify({"success": True, "data": "All Ok"}), 200



@api.route("/category/<int:category_id>", methods=['DELETE'])
def delete_category(category_id):
    category = db.session.get(Category, category_id)
    if not category:
        return jsonify({"success": False, "msg": "Category not found"}), 404

    db.session.delete(category)
    db.session.commit()
    return jsonify({"success": True, "data": "Category deleted successfully"}), 200
