"""
Blueprint principal de la API. Los endpoints se definen por entidad en
api/custom_routes y se registran al importarse aquí.
"""
from flask import Blueprint

# CORS y prefijos (/api/v1 y el alias /api) se configuran en app.py
api = Blueprint('api', __name__)

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
from api.custom_routes.account import *
