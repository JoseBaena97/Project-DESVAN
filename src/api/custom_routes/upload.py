import os
import cloudinary
import cloudinary.uploader
from flask import request, jsonify
from api.routes import api
from flask_jwt_extended import jwt_required

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True,
)


@api.route("/upload", methods=["POST"])
@jwt_required()
def upload_image():
    if "file" not in request.files:
        return jsonify({"success": False, "msg": "No file provided"}), 400

    file = request.files["file"]
    if not file or file.filename == "":
        return jsonify({"success": False, "msg": "No file selected"}), 400

    folder = request.form.get("folder")
    try:
        upload_result = cloudinary.uploader.upload(
            file,
            folder=folder if folder else None,
            resource_type="image",
            overwrite=False,
            unique_filename=True,
        )

        return jsonify({
            "success": True,
            "data": {
                "url": upload_result.get("secure_url"),
                "public_id": upload_result.get("public_id"),
            },
        }), 200
    except Exception as error:
        return jsonify({"success": False, "msg": str(error)}), 500
