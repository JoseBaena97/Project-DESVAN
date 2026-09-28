"""
Blueprint principal de la API. Los endpoints se definen por entidad en
api/custom_routes y se registran al importarse aquí.
"""
from flask import Blueprint
from flask_cors import CORS

api = Blueprint('api', __name__)

# permite peticiones CORS a la API
CORS(api)

from api.custom_routes.event_category import *
from api.custom_routes.category import *
from api.custom_routes.event_tag import *
from api.custom_routes.tag import *
from api.custom_routes.review import *
from api.custom_routes.reservation import *
from api.custom_routes.favorite import *
from api.custom_routes.profile import *
from api.custom_routes.user import *
from api.custom_routes.upload import *
from api.custom_routes.event import *
from api.custom_routes.auth import *
from api.custom_routes.test import *
from api.custom_routes.notification import *
from api.custom_routes.admin import *
from api.custom_routes.report import *
