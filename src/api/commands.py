
import click
from datetime import datetime, timedelta, timezone
from werkzeug.security import generate_password_hash
from api.models import (
    db,
    User,
    Profile,
    Event,
    EventType,
    EventStatus,
    Reservation,
    ReservationStatus,
    Review,
    Favorite,
    Category,
    EventCategory,
    Tag,
    EventTag,
)

"""
In this file, you can add as many commands as you want using the @app.cli.command decorator
Flask commands are usefull to run cronjobs or tasks outside of the API but sill in integration 
with youy database, for example: Import the price of bitcoin every night as 12am
"""
def setup_commands(app):
    
    """ 
    This is an example command "insert-test-users" that you can run from the command line
    by typing: $ flask insert-test-users 5
    Note: 5 is the number of users to add
    """
    @app.cli.command("insert-test-users") # name of our command
    @click.argument("count") # argument of out command
    def insert_test_users(count):
        print("Creating test users")
        for x in range(1, int(count) + 1):
            user = User()
            user.email = "test_user" + str(x) + "@test.com"
            user.username = "test_user_" + str(x)
            user.password = generate_password_hash("123456")
            db.session.add(user)
            db.session.commit()
            print("User: ", user.email, " created.")

        print("All test users created")

    @app.cli.command("insert-test-data")
    def insert_test_data():
        print("Cleaning database")
        db.session.query(EventTag).delete()
        db.session.query(EventCategory).delete()
        db.session.query(Favorite).delete()
        db.session.query(Review).delete()
        db.session.query(Reservation).delete()
        db.session.query(Event).delete()
        db.session.query(Tag).delete()
        db.session.query(Category).delete()
        db.session.query(Profile).delete()
        db.session.query(User).delete()
        db.session.commit()

        # ── USUARIOS ──────────────────────────────────────────────────────────
        print("Creating users")
        pw = generate_password_hash("Pepe@123")

        pepe = User(
            email="pepe@pepe.pe", username="pepe", password=pw,
            bio="Organizo rastros de barrio y ventas de garage vintage en Madrid.",
            profile_picture_url="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
            is_verified=True, user_rating=4.4,
        )
        lola = User(
            email="lola@lola.lo", username="lola", password=pw,
            bio="Amante de las ferias de segunda mano y la decoracion retro.",
            profile_picture_url="https://images.unsplash.com/photo-1494790108377-be9c29b29330",
            is_verified=True, user_rating=4.73,
        )
        matia = User(
            email="matia@mat.ia", username="matia", password=pw,
            bio="Coleccionista de herramientas vintage y articulos de epoca.",
            profile_picture_url="https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
            is_verified=True, user_rating=4.43,
        )
        sara = User(
            email="sara@sara.sa", username="sara", password=pw,
            bio="Me encantan los mercadillos de ropa y complementos unicos.",
            profile_picture_url="https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
            is_verified=True, user_rating=4.7,
        )
        carlos = User(
            email="carlos@car.lo", username="carlos", password=pw,
            bio="Organizo eventos solidarios y ferias familiares en Bilbao.",
            profile_picture_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
            is_verified=True, user_rating=4.5,
        )
        ana = User(
            email="ana@ana.an", username="ana", password=pw,
            bio="Libreria ambulante y expositora de arte en ferias de toda Espana.",
            profile_picture_url="https://images.unsplash.com/photo-1544005313-94ddf0286df2",
            is_verified=True, user_rating=4.9,
        )
        luis = User(
            email="luis@luis.lu", username="luis", password=pw,
            bio="Cazador de chollos y jugador retro. Siempre buscando raridades.",
            profile_picture_url="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d",
            is_verified=False, user_rating=None,
        )
        maria = User(
            email="maria@mar.ia", username="maria", password=pw,
            bio="Madre y aficionada a renovar el hogar con piezas de segunda mano.",
            profile_picture_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2",
            is_verified=False, user_rating=None,
        )
        admin = User(
            email="admin@admin.com", username="admin", password=generate_password_hash("Admin@123"),
            bio="Administrador de la plataforma.",
            is_verified=True, is_admin=True,
        )

        db.session.add_all([pepe, lola, matia, sara, carlos, ana, luis, maria, admin])
        db.session.flush()

        # ── PERFILES ──────────────────────────────────────────────────────────
        print("Creating profiles")
        db.session.add_all([
            Profile(user_id=pepe.id,   firstname="Pepe",   lastname="Perez",    address="Calle Olmo 12, Madrid",           phone="+34911000111"),
            Profile(user_id=lola.id,   firstname="Lola",   lastname="Lopez",    address="Avenida Prado 54, Barcelona",     phone="+34911000112"),
            Profile(user_id=matia.id,  firstname="Matia",  lastname="Martinez", address="Plaza Central 3, Valencia",       phone="+34911000113"),
            Profile(user_id=sara.id,   firstname="Sara",   lastname="Santos",   address="Calle Sierpes 8, Sevilla",        phone="+34911000114"),
            Profile(user_id=carlos.id, firstname="Carlos", lastname="Ruiz",     address="Gran Via 22, Bilbao",             phone="+34911000115"),
            Profile(user_id=ana.id,    firstname="Ana",    lastname="Garcia",   address="Paseo de la Independencia 5, Zaragoza", phone="+34911000116"),
            Profile(user_id=luis.id,   firstname="Luis",   lastname="Fernandez",address="Calle Luna 7, Madrid",            phone="+34911000117"),
            Profile(user_id=maria.id,  firstname="Maria",  lastname="Blanco",   address="Avenida Constitucion 3, Sevilla", phone="+34911000118"),
            Profile(user_id=admin.id,  firstname="Admin",  lastname="",         address="",                                phone=""),
        ])

        # ── CATEGORÍAS Y TAGS ─────────────────────────────────────────────────
        print("Creating categories and tags")
        # índices: 0=Rastro 1=Feria 2=Mercado 3=Mercadillo 4=Vintage 5=Antigüedades
        cats = [
            Category(name="Rastro"),
            Category(name="Feria"),
            Category(name="Mercado"),
            Category(name="Mercadillo"),
            Category(name="Vintage"),
            Category(name="Antigüedades"),
        ]
        # índices: 0=Muebles 1=Ropa 2=Joyería 3=Libros 4=Decoración 5=Electrónica
        #          6=Juguetes 7=Arte 8=Coleccionismo 9=Calzado 10=Bolsos 11=Plantas
        #          12=Discos 13=Herramientas 14=Ropa de niños 15=Videojuegos
        tags = [
            Tag(name="Muebles"),
            Tag(name="Ropa"),
            Tag(name="Joyería"),
            Tag(name="Libros"),
            Tag(name="Decoración"),
            Tag(name="Electrónica"),
            Tag(name="Juguetes"),
            Tag(name="Arte"),
            Tag(name="Coleccionismo"),
            Tag(name="Calzado"),
            Tag(name="Bolsos"),
            Tag(name="Plantas"),
            Tag(name="Discos"),
            Tag(name="Herramientas"),
            Tag(name="Ropa de niños"),
            Tag(name="Videojuegos"),
        ]
        db.session.add_all(cats + tags)
        db.session.flush()

        # ── EVENTOS ───────────────────────────────────────────────────────────
        print("Creating events")
        now = datetime.now(timezone.utc)

        events = [
            # E0 – Rastro de Malasaña (Madrid) – en 3 días – Pepe
            Event(
                title="Rastro de Malasaña",
                description="El rastro mas querido del barrio. Ropa de todas las epocas, calzado, bolsos y complementos con mucho caracter.",
                image_url={
                    "cover": "https://images.unsplash.com/photo-1489515217757-5fd1be406fef",
                    "gallery": [
                        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64",
                        "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3",
                    ],
                },
                status=EventStatus.active, event_type=EventType.publico,
                start_time=now + timedelta(days=3, hours=8),
                end_time=now + timedelta(days=3, hours=15),
                start_date=now + timedelta(days=3),
                end_date=now + timedelta(days=3),
                exact_address="Calle Fuencarral 43, 28004 Madrid, España",
                latitude=40.4252, longitude=-3.7041,
                seller_id=pepe.id,
            ),
            # E1 – Mercadillo Vintage de Gràcia (Barcelona) – en 7 días – Lola
            Event(
                title="Mercadillo Vintage de Gracia",
                description="Decoracion retro, vinilos, vajilla de coleccion y muebles restaurados con amor. Un plan perfecto para el fin de semana.",
                image_url={
                    "cover": "https://images.unsplash.com/photo-1511988617509-a57c8a288659",
                    "gallery": [
                        "https://images.unsplash.com/photo-1582719471384-894fbb16e074",
                        "https://images.unsplash.com/photo-1523821741446-edb2b68bb7a0",
                    ],
                },
                status=EventStatus.active, event_type=EventType.publico,
                start_time=now + timedelta(days=7, hours=10),
                end_time=now + timedelta(days=7, hours=19),
                start_date=now + timedelta(days=7),
                end_date=now + timedelta(days=8),
                max_capacity=90,
                exact_address="Carrer de Girona 88, 08009 Barcelona, España",
                latitude=41.3976, longitude=2.1559,
                seller_id=lola.id,
            ),
            # E2 – Feria de Herramientas (Valencia) – FINALIZADO hace 12 días – Matia
            Event(
                title="Feria de Herramientas y Coleccionismo",
                description="Herramientas de taller, revistas antiguas, miniaturas de metal y piezas para restauracion. Un evento para los que saben buscar.",
                image_url={"cover": "https://images.unsplash.com/photo-1504148455328-c376907d081c"},
                status=EventStatus.finished, event_type=EventType.publico,
                start_time=now - timedelta(days=12, hours=-8),
                end_time=now - timedelta(days=11, hours=-15),
                start_date=now - timedelta(days=12),
                end_date=now - timedelta(days=11),
                max_capacity=70,
                exact_address="Calle de la Paz 44, 46003 Valencia, España",
                latitude=39.4731, longitude=-0.3769,
                seller_id=matia.id,
            ),
            # E3 – Mercado de Segunda Mano Sevilla – en 14 días – Sara
            Event(
                title="Mercado de Segunda Mano de Sevilla",
                description="Ropa para todos, juguetes en perfecto estado y toneladas de articulos de bebe y nino a precios increibles.",
                image_url={
                    "cover": "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d",
                    "gallery": ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64"],
                },
                status=EventStatus.active, event_type=EventType.publico,
                start_time=now + timedelta(days=14, hours=9),
                end_time=now + timedelta(days=14, hours=14),
                start_date=now + timedelta(days=14),
                end_date=now + timedelta(days=14),
                exact_address="Calle Sierpes 8, 41004 Sevilla, España",
                latitude=37.3891, longitude=-5.9945,
                seller_id=sara.id,
            ),
            # E4 – Rastro Solidario de Bilbao – mañana – Carlos
            Event(
                title="Rastro Solidario de Bilbao",
                description="Todo lo recaudado va a la asociacion local de ayuda a familias. Libros, arte, joyeria artesanal y mucho mas.",
                image_url={"cover": "https://images.unsplash.com/photo-1481627834876-b7833e8f5570"},
                status=EventStatus.active, event_type=EventType.publico,
                start_time=now + timedelta(days=1, hours=10),
                end_time=now + timedelta(days=1, hours=18),
                start_date=now + timedelta(days=1),
                end_date=now + timedelta(days=1),
                exact_address="Gran Via 22, 48001 Bilbao, España",
                latitude=43.2627, longitude=-2.9253,
                seller_id=carlos.id,
            ),
            # E5 – Feria del Libro y Arte – en 2 días – Ana
            Event(
                title="Feria del Libro y Arte de Zaragoza",
                description="Expositores de toda Aragon traen libros de segunda mano, obra grafica original, ilustracion y fotografia a precios de derribo.",
                image_url={
                    "cover": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
                    "gallery": [
                        "https://images.unsplash.com/photo-1481627834876-b7833e8f5570",
                        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c",
                    ],
                },
                status=EventStatus.active, event_type=EventType.publico,
                start_time=now + timedelta(days=2, hours=10),
                end_time=now + timedelta(days=4, hours=20),
                start_date=now + timedelta(days=2),
                end_date=now + timedelta(days=4),
                exact_address="Paseo de la Independencia 5, 50001 Zaragoza, España",
                latitude=41.6488, longitude=-0.8891,
                seller_id=ana.id,
            ),
            # E6 – Mercadillo Antigüedades Centro Madrid – HOY ACTIVO – Pepe
            Event(
                title="Mercadillo de Antiguedades del Centro",
                description="Cada primer sabado del mes en el corazon de Madrid. Muebles, joyeria de epoca, porcelana y objetos de coleccion.",
                image_url={
                    "cover": "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3",
                    "gallery": ["https://images.unsplash.com/photo-1523821741446-edb2b68bb7a0"],
                },
                status=EventStatus.active, event_type=EventType.publico,
                start_time=now - timedelta(hours=2),
                end_time=now + timedelta(hours=5),
                start_date=now - timedelta(hours=2),
                end_date=now + timedelta(hours=5),
                exact_address="Calle Mayor 21, 28013 Madrid, España",
                latitude=40.4153, longitude=-3.7074,
                seller_id=pepe.id,
            ),
            # E7 – Pop-Up Vintage Valencia – en 21 días – Lola
            Event(
                title="Pop-Up Vintage Valencia",
                description="Ropa de diseño de los 80 y 90, bolsos de cuero artesanal y calzado imposible de encontrar en otra parte.",
                image_url={"cover": "https://images.unsplash.com/photo-1523821741446-edb2b68bb7a0"},
                status=EventStatus.active, event_type=EventType.publico,
                start_time=now + timedelta(days=21, hours=11),
                end_time=now + timedelta(days=21, hours=20),
                start_date=now + timedelta(days=21),
                end_date=now + timedelta(days=21),
                exact_address="Avenida del Puerto 12, 46023 Valencia, España",
                latitude=39.4699, longitude=-0.3285,
                seller_id=lola.id,
            ),
            # E8 – Rastro Familiar de Getafe – en 5 días – Carlos
            Event(
                title="Rastro Familiar de Getafe",
                description="Evento pensado para familias. Juguetes, ropa de ninos, cuentos, bicicletas y todo tipo de articulos infantiles.",
                image_url={
                    "cover": "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d",
                    "gallery": ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64"],
                },
                status=EventStatus.active, event_type=EventType.publico,
                start_time=now + timedelta(days=5, hours=9),
                end_time=now + timedelta(days=5, hours=14),
                start_date=now + timedelta(days=5),
                end_date=now + timedelta(days=5),
                exact_address="Plaza Mayor 1, 28901 Getafe, Madrid, España",
                latitude=40.3047, longitude=-3.7137,
                seller_id=carlos.id,
            ),
            # E9 – Feria del Coleccionismo PRIVADA – en 30 días – Matia
            Event(
                title="Feria Privada del Coleccionismo",
                description="Acceso solo con reserva previa. Piezas unicas de coleccion: discos de vinilo raros, arte urbano, miniaturas y fotografia vintage.",
                image_url={"cover": "https://images.unsplash.com/photo-1582719471384-894fbb16e074"},
                status=EventStatus.active, event_type=EventType.privado,
                start_time=now + timedelta(days=30, hours=10),
                end_time=now + timedelta(days=30, hours=18),
                start_date=now + timedelta(days=30),
                end_date=now + timedelta(days=30),
                max_capacity=20,
                exact_address="Carrer de Blai 15, 08004 Barcelona, España",
                latitude=41.3751, longitude=2.1622,
                seller_id=matia.id,
            ),
            # E10 – Mercadillo de Moda Vintage Sevilla – en 10 días – Ana
            Event(
                title="Mercadillo de Moda Vintage Sevilla",
                description="La mejor seleccion de ropa de segunda mano de Sevilla. Vestidos de epoca, calzado de diseno y bolsos de autor a precios increibles.",
                image_url={"cover": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64"},
                status=EventStatus.active, event_type=EventType.publico,
                start_time=now + timedelta(days=10, hours=10),
                end_time=now + timedelta(days=10, hours=19),
                start_date=now + timedelta(days=10),
                end_date=now + timedelta(days=10),
                exact_address="Alameda de Hercules 56, 41002 Sevilla, España",
                latitude=37.3967, longitude=-5.9916,
                seller_id=ana.id,
            ),
            # E11 – Feria Retro de Videojuegos Madrid – en 6 días – Sara
            Event(
                title="Feria Retro de Videojuegos",
                description="Consolas, cartuchos, coleccionables y merchandising de videojuegos de los 80, 90 y 2000. Para nostalgicos y coleccionistas.",
                image_url={
                    "cover": "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8",
                    "gallery": [
                        "https://images.unsplash.com/photo-1550745165-9bc0b252726f",
                        "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3",
                    ],
                },
                status=EventStatus.active, event_type=EventType.publico,
                start_time=now + timedelta(days=6, hours=10),
                end_time=now + timedelta(days=6, hours=20),
                start_date=now + timedelta(days=6),
                end_date=now + timedelta(days=6),
                exact_address="Calle de Alcala 31, 28014 Madrid, España",
                latitude=40.4166, longitude=-3.6939,
                seller_id=sara.id,
            ),
            # E12 – Mercado Navideno – FINALIZADO hace 30 días – Lola
            Event(
                title="Mercado Navideno de Barcelona",
                description="El clasico mercado navideno del barrio. Decoracion artesanal, regalos originales, plantas y arte para regalar.",
                image_url={"cover": "https://images.unsplash.com/photo-1482517967863-00e15c9b44be"},
                status=EventStatus.finished, event_type=EventType.publico,
                start_time=now - timedelta(days=30, hours=-9),
                end_time=now - timedelta(days=28, hours=-20),
                start_date=now - timedelta(days=30),
                end_date=now - timedelta(days=28),
                exact_address="Placa de Catalunya 1, 08002 Barcelona, España",
                latitude=41.3870, longitude=2.1700,
                seller_id=lola.id,
            ),
        ]
        db.session.add_all(events)
        db.session.flush()

        # ── CATEGORÍAS Y TAGS POR EVENTO ──────────────────────────────────────
        print("Linking categories and tags")
        event_categories = [
            EventCategory(event_id=events[0].id,  category_id=cats[0].id),  # E0  → Rastro
            EventCategory(event_id=events[1].id,  category_id=cats[4].id),  # E1  → Vintage
            EventCategory(event_id=events[2].id,  category_id=cats[1].id),  # E2  → Feria
            EventCategory(event_id=events[3].id,  category_id=cats[2].id),  # E3  → Mercado
            EventCategory(event_id=events[4].id,  category_id=cats[0].id),  # E4  → Rastro
            EventCategory(event_id=events[5].id,  category_id=cats[1].id),  # E5  → Feria
            EventCategory(event_id=events[6].id,  category_id=cats[5].id),  # E6  → Antigüedades
            EventCategory(event_id=events[7].id,  category_id=cats[4].id),  # E7  → Vintage
            EventCategory(event_id=events[8].id,  category_id=cats[0].id),  # E8  → Rastro
            EventCategory(event_id=events[9].id,  category_id=cats[1].id),  # E9  → Feria
            EventCategory(event_id=events[10].id, category_id=cats[3].id),  # E10 → Mercadillo
            EventCategory(event_id=events[11].id, category_id=cats[1].id),  # E11 → Feria
            EventCategory(event_id=events[12].id, category_id=cats[2].id),  # E12 → Mercado
        ]
        event_tags = [
            # E0 – Rastro de Malasaña
            EventTag(event_id=events[0].id, tag_id=tags[1].id),   # Ropa
            EventTag(event_id=events[0].id, tag_id=tags[9].id),   # Calzado
            EventTag(event_id=events[0].id, tag_id=tags[10].id),  # Bolsos
            # E1 – Mercadillo Vintage Gràcia
            EventTag(event_id=events[1].id, tag_id=tags[0].id),   # Muebles
            EventTag(event_id=events[1].id, tag_id=tags[4].id),   # Decoración
            EventTag(event_id=events[1].id, tag_id=tags[12].id),  # Discos
            # E2 – Feria Herramientas (finalizado)
            EventTag(event_id=events[2].id, tag_id=tags[13].id),  # Herramientas
            EventTag(event_id=events[2].id, tag_id=tags[8].id),   # Coleccionismo
            # E3 – Mercado Segunda Mano Sevilla
            EventTag(event_id=events[3].id, tag_id=tags[1].id),   # Ropa
            EventTag(event_id=events[3].id, tag_id=tags[6].id),   # Juguetes
            EventTag(event_id=events[3].id, tag_id=tags[14].id),  # Ropa de niños
            # E4 – Rastro Solidario Bilbao
            EventTag(event_id=events[4].id, tag_id=tags[3].id),   # Libros
            EventTag(event_id=events[4].id, tag_id=tags[7].id),   # Arte
            EventTag(event_id=events[4].id, tag_id=tags[2].id),   # Joyería
            # E5 – Feria Libro y Arte Zaragoza
            EventTag(event_id=events[5].id, tag_id=tags[3].id),   # Libros
            EventTag(event_id=events[5].id, tag_id=tags[7].id),   # Arte
            # E6 – Mercadillo Antigüedades Madrid (activo hoy)
            EventTag(event_id=events[6].id, tag_id=tags[0].id),   # Muebles
            EventTag(event_id=events[6].id, tag_id=tags[2].id),   # Joyería
            EventTag(event_id=events[6].id, tag_id=tags[8].id),   # Coleccionismo
            # E7 – Pop-Up Vintage Valencia
            EventTag(event_id=events[7].id, tag_id=tags[1].id),   # Ropa
            EventTag(event_id=events[7].id, tag_id=tags[10].id),  # Bolsos
            EventTag(event_id=events[7].id, tag_id=tags[9].id),   # Calzado
            # E8 – Rastro Familiar Getafe
            EventTag(event_id=events[8].id, tag_id=tags[6].id),   # Juguetes
            EventTag(event_id=events[8].id, tag_id=tags[14].id),  # Ropa de niños
            EventTag(event_id=events[8].id, tag_id=tags[5].id),   # Electrónica
            # E9 – Feria Coleccionismo Privada
            EventTag(event_id=events[9].id, tag_id=tags[8].id),   # Coleccionismo
            EventTag(event_id=events[9].id, tag_id=tags[12].id),  # Discos
            EventTag(event_id=events[9].id, tag_id=tags[7].id),   # Arte
            # E10 – Mercadillo Moda Vintage Sevilla
            EventTag(event_id=events[10].id, tag_id=tags[1].id),  # Ropa
            EventTag(event_id=events[10].id, tag_id=tags[9].id),  # Calzado
            EventTag(event_id=events[10].id, tag_id=tags[10].id), # Bolsos
            # E11 – Feria Videojuegos Madrid
            EventTag(event_id=events[11].id, tag_id=tags[15].id), # Videojuegos
            EventTag(event_id=events[11].id, tag_id=tags[5].id),  # Electrónica
            EventTag(event_id=events[11].id, tag_id=tags[8].id),  # Coleccionismo
            # E12 – Mercado Navideño (finalizado)
            EventTag(event_id=events[12].id, tag_id=tags[4].id),  # Decoración
            EventTag(event_id=events[12].id, tag_id=tags[7].id),  # Arte
            EventTag(event_id=events[12].id, tag_id=tags[11].id), # Plantas
        ]
        db.session.add_all(event_categories + event_tags)

        # ── RESERVAS (solo eventos privados: E9) ──────────────────────────────
        print("Creating reservations")
        db.session.add_all([
            # E9 – Feria Privada del Coleccionismo (max 40) → 15 reservas = 37.5% → badge "Hot"
            Reservation(user_id=pepe.id,   event_id=events[9].id, status=ReservationStatus.confirmed),
            Reservation(user_id=lola.id,   event_id=events[9].id, status=ReservationStatus.confirmed),
            Reservation(user_id=sara.id,   event_id=events[9].id, status=ReservationStatus.confirmed),
            Reservation(user_id=carlos.id, event_id=events[9].id, status=ReservationStatus.confirmed),
            Reservation(user_id=matia.id,  event_id=events[9].id, status=ReservationStatus.confirmed),
            Reservation(user_id=luis.id,   event_id=events[9].id, status=ReservationStatus.confirmed),
            Reservation(user_id=maria.id,  event_id=events[9].id, status=ReservationStatus.confirmed),
            Reservation(user_id=ana.id,    event_id=events[9].id, status=ReservationStatus.confirmed),
        ])

        # ── FAVORITOS ─────────────────────────────────────────────────────────
        print("Creating favorites")
        db.session.add_all([
            Favorite(user_id=pepe.id,   event_id=events[1].id),
            Favorite(user_id=pepe.id,   event_id=events[4].id),
            Favorite(user_id=pepe.id,   event_id=events[9].id),
            Favorite(user_id=lola.id,   event_id=events[0].id),
            Favorite(user_id=lola.id,   event_id=events[5].id),
            Favorite(user_id=lola.id,   event_id=events[11].id),
            Favorite(user_id=matia.id,  event_id=events[1].id),
            Favorite(user_id=matia.id,  event_id=events[8].id),
            Favorite(user_id=sara.id,   event_id=events[0].id),
            Favorite(user_id=sara.id,   event_id=events[6].id),
            Favorite(user_id=sara.id,   event_id=events[11].id),
            Favorite(user_id=carlos.id, event_id=events[5].id),
            Favorite(user_id=carlos.id, event_id=events[9].id),
            Favorite(user_id=luis.id,   event_id=events[0].id),
            Favorite(user_id=luis.id,   event_id=events[3].id),
            Favorite(user_id=luis.id,   event_id=events[11].id),
            Favorite(user_id=maria.id,  event_id=events[4].id),
            Favorite(user_id=maria.id,  event_id=events[10].id),
        ])

        # ── RESEÑAS (solo sobre eventos finalizados: E2 y E12) ───────────────
        print("Creating reviews")
        db.session.add_all([
            # E2 – Feria Herramientas Valencia → reseñas a Matia
            Review(rating=4.5, comment="Gran variedad de herramientas y muy buen precio. Repetire seguro.",
                   reviewer_id=lola.id, reviewed_id=matia.id, event_id=events[2].id),
            Review(rating=4.0, comment="Bien organizado aunque algo pequeno. El coleccionismo de miniaturas es increible.",
                   reviewer_id=pepe.id, reviewed_id=matia.id, event_id=events[2].id),
            Review(rating=4.8, comment="Encontre piezas que llevaba anos buscando. Muy recomendable.",
                   reviewer_id=sara.id, reviewed_id=matia.id, event_id=events[2].id),
            # E12 – Mercado Navideño Barcelona → reseñas a Lola
            Review(rating=5.0, comment="La mejor organizacion que he visto en un mercado navideno. Todo precioso.",
                   reviewer_id=pepe.id, reviewed_id=lola.id, event_id=events[12].id),
            Review(rating=4.7, comment="Decoracion artesanal de calidad y ambiente magico. Volvere el año que viene.",
                   reviewer_id=carlos.id, reviewed_id=lola.id, event_id=events[12].id),
            Review(rating=4.5, comment="Muy buena seleccion de plantas y arte. Precios justos.",
                   reviewer_id=matia.id, reviewed_id=lola.id, event_id=events[12].id),
        ])

        db.session.commit()
        print("Test data inserted successfully: 9 usuarios (1 admin), 13 eventos, categorias, tags, reservas, favoritos y resenas.")

    @app.cli.command("seed-categories-tags")
    def seed_categories_tags():
        """Inserta categorías y tags predefinidos sin borrar datos existentes."""
        default_categories = [
            "Rastro", "Feria", "Mercado", "Mercadillo", "Vintage", "Antigüedades",
        ]
        default_tags = [
            "Muebles", "Ropa", "Joyería", "Libros", "Decoración", "Electrónica",
            "Juguetes", "Arte", "Coleccionismo", "Calzado", "Bolsos", "Plantas",
            "Discos", "Herramientas", "Ropa de niños", "Videojuegos",
        ]

        added_cats = 0
        for name in default_categories:
            exists = db.session.execute(
                db.select(Category).where(Category.name == name)
            ).scalar_one_or_none()
            if not exists:
                db.session.add(Category(name=name))
                added_cats += 1

        added_tags = 0
        for name in default_tags:
            exists = db.session.execute(
                db.select(Tag).where(Tag.name == name)
            ).scalar_one_or_none()
            if not exists:
                db.session.add(Tag(name=name))
                added_tags += 1

        db.session.commit()
        print(f"Done: {added_cats} categorías y {added_tags} tags añadidos.")