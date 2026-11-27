# Punto de entrada de la API en Vercel (función serverless de Python).
# Vercel busca una variable WSGI llamada `app` en este archivo.
# Las migraciones NO se aplican aquí: se lanzan a mano con `flask db upgrade`.
import os
import sys

# El código de Flask vive en src/ e importa `api.*` (src/api), así que src
# tiene que ir el primero en el path para no confundirlo con esta carpeta.
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "src"))

from app import app  # noqa: E402,F401
