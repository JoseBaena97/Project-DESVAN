
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

        print("Creating users")
        shared_password = generate_password_hash("Pepe@123")

        pepe = User(
            email="pepe@pepe.pe",
            username="pepe",
            password=shared_password,
            bio="Organizo mercadillos de barrio y ventas de garage vintage.",
            profile_picture_url="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
            is_verified=True,
            is_admin=False,
            user_rating=4.6,
        )
        lola = User(
            email="lola@lola.lo",
            username="lola",
            password=shared_password,
            bio="Me encantan las ferias de segunda mano y la decoracion retro.",
            profile_picture_url="https://images.unsplash.com/photo-1494790108377-be9c29b29330",
            is_verified=True,
            is_admin=False,
            user_rating=4.8,
        )
        matia = User(
            email="matia@mat.ia",
            username="matia",
            password=shared_password,
            bio="Busco herramientas y articulos coleccionables en mercadillos.",
            profile_picture_url="https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
            is_verified=False,
            is_admin=False,
            user_rating=4.2,
        )

        db.session.add_all([pepe, lola, matia])
        db.session.flush()

        print("Creating profiles")
        profiles = [
            Profile(
                user_id=pepe.id,
                firstname="Pepe",
                lastname="Perez",
                address="Calle Olmo 12",
                phone="+34911000111",
            ),
            Profile(
                user_id=lola.id,
                firstname="Lola",
                lastname="Lopez",
                address="Avenida Prado 54",
                phone="+34911000112",
            ),
            Profile(
                user_id=matia.id,
                firstname="Matia",
                lastname="Martinez",
                address="Plaza Central 3",
                phone="+34911000113",
            ),
        ]
        db.session.add_all(profiles)

        print("Creating categories and tags")
        categories = [
            Category(name="Garage Sale"),
            Category(name="Mercadillo Vintage"),
            Category(name="Antiguedades"),
            Category(name="Ropa y Accesorios"),
            Category(name="Hogar y Decoracion"),
        ]
        tags = [
            Tag(name="segunda_mano"),
            Tag(name="familiar"),
            Tag(name="aire_libre"),
            Tag(name="regateo"),
            Tag(name="coleccionismo"),
        ]
        db.session.add_all(categories + tags)
        db.session.flush()

        now = datetime.now(timezone.utc)
        print("Creating events")
        events = [
            Event(
                title="Garage Sale de Primavera",
                description="Ropa, juguetes, pequenos electrodomesticos y libros usados en buen estado.",
                image_url={
                    "cover": "https://images.unsplash.com/photo-1489515217757-5fd1be406fef"
                },
                status=EventStatus.active,
                event_type=EventType.publico,
                start_time=now + timedelta(days=3),
                end_time=now + timedelta(days=3, hours=6),
                start_date=  now + timedelta(days=3),
                end_date= now + timedelta(days=3, hours=6),
                max_capacity=120,
                latitude="40.4168",
                longitude="-3.7038",
                exact_address="Calle Mayor 21",
                place="Patio Comunitario Centro",
                city="Madrid",
                postal_code="28013",
                seller_id=pepe.id,
            ),
            Event(
                title="Mercadillo Retro de Lola",
                description="Decoracion vintage, vinilos, vajilla clasica y muebles pequenos restaurados.",
                image_url={
                    "cover": "https://images.unsplash.com/photo-1511988617509-a57c8a288659"
                },
                status=EventStatus.active,
                event_type=EventType.publico,
                start_time=now + timedelta(days=7),
                end_time=now + timedelta(days=7, hours=7),
                start_date=  now + timedelta(days=7),
                end_date= now + timedelta(days=7, hours=7),
                max_capacity=90,
                latitude="41.3874",
                longitude="2.1686",
                exact_address="Carrer de Girona 88",
                place="Plaza del Mercat",
                city="Barcelona",
                postal_code="08009",
                seller_id=lola.id,
            ),
            Event(
                title="Feria de Herramientas y Coleccionismo",
                description="Herramientas de taller, revistas antiguas, miniaturas y piezas para restauracion.",
                image_url={
                    "cover": "https://images.unsplash.com/photo-1504148455328-c376907d081c"
                },
                status=EventStatus.finished,
                event_type=EventType.publico,
                start_time=now - timedelta(days=12),
                end_time=now - timedelta(days=12, hours=-5),
                start_date=  now + timedelta(days=7),
                end_date= now + timedelta(days=7, hours=7),
                max_capacity=70,
                latitude="39.4699",
                longitude="-0.3763",
                exact_address="Calle de la Paz 44",
                place="Nave Norte",
                city="Valencia",
                postal_code="46003",
                seller_id=matia.id,
            ),
        ]
        db.session.add_all(events)
        db.session.flush()

        print("Linking events with categories and tags")
        event_categories = [
            EventCategory(event_id=events[0].id, category_id=categories[0].id),
            EventCategory(event_id=events[0].id, category_id=categories[3].id),
            EventCategory(event_id=events[1].id, category_id=categories[1].id),
            EventCategory(event_id=events[1].id, category_id=categories[4].id),
            EventCategory(event_id=events[2].id, category_id=categories[2].id),
        ]
        event_tags = [
            EventTag(event_id=events[0].id, tag_id=tags[0].id),
            EventTag(event_id=events[0].id, tag_id=tags[1].id),
            EventTag(event_id=events[1].id, tag_id=tags[2].id),
            EventTag(event_id=events[1].id, tag_id=tags[3].id),
            EventTag(event_id=events[2].id, tag_id=tags[4].id),
        ]
        db.session.add_all(event_categories + event_tags)

        print("Creating reservations")
        reservations = [
            Reservation(
                user_id=lola.id,
                event_id=events[0].id,
                status=ReservationStatus.confirmed,
            ),
            Reservation(
                user_id=matia.id,
                event_id=events[0].id,
                status=ReservationStatus.attended,
            ),
            Reservation(
                user_id=pepe.id,
                event_id=events[1].id,
                status=ReservationStatus.confirmed,
            ),
            Reservation(
                user_id=lola.id,
                event_id=events[2].id,
                status=ReservationStatus.attended,
            ),
        ]
        db.session.add_all(reservations)

        print("Creating favorites")
        favorites = [
            Favorite(user_id=pepe.id, event_id=events[1].id),
            Favorite(user_id=lola.id, event_id=events[0].id),
            Favorite(user_id=matia.id, event_id=events[1].id),
        ]
        db.session.add_all(favorites)

        print("Creating reviews")
        reviews = [
            Review(
                rating=4.5,
                comment="Muy buena organizacion y variedad de productos.",
                reviewer_id=lola.id,
                reviewed_id=pepe.id,
                event_id=events[0].id,
            ),
            Review(
                rating=4.8,
                comment="El mercadillo estuvo genial y con buenos precios.",
                reviewer_id=pepe.id,
                reviewed_id=lola.id,
                event_id=events[1].id,
            ),
            Review(
                rating=4.2,
                comment="Material interesante para coleccionistas.",
                reviewer_id=lola.id,
                reviewed_id=matia.id,
                event_id=events[2].id,
            ),
        ]
        db.session.add_all(reviews)

        db.session.commit()
        print("Test data inserted successfully")