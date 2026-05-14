from api.routes import api

@api.route("/test")
def test():
    return "test pasado"