import enum
import datetime
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, Text, Float, Enum, Datetime, Integer, ForeignKey, DECIMAL, JSON
from sqlalchemy.orm import Mapped, mapped_column


db = SQLAlchemy()


class UserRole(enum.Enum):
    user = "user"
    admin = "admin"


class EventStatus(enum.Enum):
    draft = "draft"
    active = "active"
    finished = "finished"
    cancelled = "cancelled"


class ReservationStatus(enum.Enum):
    confirmed = "confirmed"
    cancelled = "cancelled"
    attended = "attended"

#Tabla asociación eventos con categorías
class EventCategory(db.Model):
    __tablename__ = "event_categories"
    id: Mapped[int] = mapped_column(primary_key=True)
    #claves foráneas
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id"), nullable=True) #---> o le quito el id primero?
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"), nullable= True) #---> o le quito el id primero?

class User(db.Model):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    username: Mapped[str] = mapped_column(String(80), nullable=False)
    bio: Mapped[str] = mapped_column(Text, nullable=True)
    profile_picture_url: Mapped[str] = mapped_column(
        String(255), nullable=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    role: Mapped[enum] = mapped_column(Enum(UserRole), default=UserRole.user)
    created_at: Mapped[datetime] = mapped_column(
        Datetime, default=datetime.utcnow)
    deleted_at: Mapped[datetime] = mapped_column(
        Datetime, default=datetime.utcnow)
    user_rating: Mapped[float] = mapped_column(Float, nullable=True)

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "bio": self.bio,
            "profile_picture_url": self.profile_picture_url,
            "is_verified": self.is_verified,
            "role": self.role,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "deleted_at": self.deleted_at.isoformat() if self.deleted_at else None,
            "user_rating": self.user_rating
            # do not serialize the password, its a security breach
        }

class Profile (db.Model):
    __tablename__ = "profile"
    id: Mapped[int] = mapped_column(primary_key=True)
    address: Mapped[str] = mapped_column(String(255), nullable= False)
    phone: Mapped[int] = mapped_column(Integer, nullable=False) #---------->Preguntar si int o str
    firstname: Mapped[str] = mapped_column(String(100), nullable=False)
    lastname: Mapped[str] = mapped_column(String(100), nullable=False)
    events_created_count: Mapped[int] =mapped_column(Integer, nullable=True)
    #clave foránea
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)#-----> preguntar si así o ponerlo en el id de arriba la clave foránea

class Category (db.Model):
    __tablename__ = "categories"
    id: Mapped[int] = mapped_column(primary_key=True)
    name:  Mapped[int] = mapped_column(String(100), nullable=False)
     #clave foránea
    category_id: Mapped[int] = mapped_column(ForeignKey("category.id"), nullable=False)#----> es correcto?

class Event (db.Model):
    __tablename__ = "events"
    id: Mapped[int] = mapped_column(primary_key=True)
    tittle: Mapped[str] = mapped_column(String(255), nullable= False)
    description: Mapped[str] = mapped_column(Text, nullable= True)
    latitude: Mapped[float] = mapped_column(DECIMAL(10,7), nullable=False) #----->decimal?
    longitude: Mapped[float] = mapped_column(DECIMAL(10,7), nullable=False) #----> decimal?
    exact_address: Mapped[str] = mapped_column(String(255), nullable= False)
    start_time: Mapped[datetime]  = mapped_column(Datetime(timezone=True))
    end_time: Mapped[datetime]  = mapped_column(Datetime(timezone=True))
    max_capacity: Mapped[int] = mapped_column(Integer, nullable= True)
    status: Mapped[EventStatus] = mapped_column(Enum(EventStatus), default=EventStatus.draft)
    created_at: Mapped[datetime] = mapped_column(Datetime, default=datetime.utcnow)
    image_url: Mapped[dict] = mapped_column(JSON, nullable= True) #----> se pone así para un conjunto de fotos?
    event_rating: Mapped[float] = mapped_column(DECIMAL (3,2), nullable= True) #------> decimal? y lo dejo en tres digitos?
    #clave foránea
    seller_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)#---->pongo aquí la clave foránea?

class Favorite (db.Model):
    __tablename__ = "favorites"
    id: Mapped[int] = mapped_column(primary_key=True)
    created_at: Mapped[datetime] = mapped_column(Datetime, default=datetime.utcnow)
    #claves foráneas
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id"), nullable=False)

class Reservation (db.Model):
    __tablename__ = "reservations"
    id: Mapped[int] = mapped_column(primary_key=True)
    status: Mapped[ReservationStatus] = mapped_column(Enum(ReservationStatus), default=ReservationStatus.confirmed)
    created_at: Mapped[datetime] = mapped_column(Datetime, default=datetime.utcnow)
    #claves foráneas
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id"), nullable=False)

class Review (db.Model):
    __tablename__ = "reviews"
    id: Mapped[int] = mapped_column(primary_key=True)
    rating: Mapped[float] = mapped_column(DECIMAL (3,2), nullable= False) #------> decimal?o integer?
    comment: Mapped[str] = mapped_column(Text,nullable=True)
    created_at: Mapped[datetime] = mapped_column(Datetime, default=datetime.utcnow)

    #claves foráneas
    reviewer_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    reviewed_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id"), nullable=False)

