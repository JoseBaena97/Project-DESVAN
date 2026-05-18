import enum
from datetime import datetime, timezone
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, Text, Float, Enum, DateTime, Integer, ForeignKey, DECIMAL, JSON, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List




db = SQLAlchemy()




















class EventType(enum.Enum):
    publico = "publico"
    privado = "privado"




class EventStatus(enum.Enum):
    active = "active"
    finished = "finished"
    cancelled = "cancelled"








class ReservationStatus(enum.Enum):
    confirmed = "confirmed"
    cancelled = "cancelled"
    attended = "attended"




class Category (db.Model):
    __tablename__ = "categories"
    id: Mapped[int] = mapped_column(primary_key=True)
    name:  Mapped[str] = mapped_column(String(100), nullable=False)
    
    #relacion
    event_categories:Mapped[List["EventCategory"] ]= relationship(back_populates = "category", cascade= "all, delete-orphan")
    #def serialize
    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "event_categories":[eg.serialize()for eg in self.event_categories]
           
        }




#Tabla asociación eventos con categorías
class EventCategory(db.Model):
    __tablename__ = "event_categories"
    id: Mapped[int] = mapped_column(primary_key=True)
    #claves foráneas
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id"), nullable=False)
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"), nullable= False)
    #relacion
    category:Mapped["Category"] = relationship(back_populates = "event_categories")
    #relacion con evento
    event: Mapped["Event"] = relationship(back_populates = "event_categories")
    #def serialize
    def serialize(self):
        return {
            "id": self.id,
            "event_title": self.event.title,
            "category":{
                "name":self.category.name
            } if self.category else None
           
        }




class Favorite (db.Model):
    __tablename__ = "favorites"
    id: Mapped[int] = mapped_column(primary_key=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    #claves foráneas
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id"), nullable=False)
    #relación
    user: Mapped["User"] = relationship(back_populates = "favorites")
    #relación
    event: Mapped["Event"] = relationship(back_populates= "favorites")
   
    def serialize(self):
        return {
            "id": self.id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "user":{
                "id":self.user_id,
                "email":self.user.email,
                "profile_picture_url":self.user.profile_picture_url
            } if self.user else None,
            "event":{
                "id":self.event_id,
                "title": self.event.title

            }if self.event else None,
           
        }




class Event (db.Model): #ESTA TABLA DEBE IR ARRIBA?
    __tablename__ = "events"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255), nullable= False)
    description: Mapped[str] = mapped_column(Text, nullable= True)
    image_url: Mapped[dict] = mapped_column(JSON, nullable= True)
    status: Mapped[EventStatus] = mapped_column(Enum(EventStatus), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    event_type: Mapped[EventType] = mapped_column(Enum(EventType), nullable=False)  # Punto 9: publico/privado
    start_time: Mapped[datetime]  = mapped_column(DateTime(timezone=True))
    end_time: Mapped[datetime]  = mapped_column(DateTime(timezone=True))
    max_capacity: Mapped[int] = mapped_column(Integer, nullable= True)


    #columnas con respecto a ubicación
    latitude: Mapped[str] = mapped_column(String(50), nullable=False)
    longitude: Mapped[str] = mapped_column(String(50), nullable=False)
    
    exact_address: Mapped[str] = mapped_column(String(255), nullable= False)
    place: Mapped[str] = mapped_column(String(255), nullable=True)       # Punto 10: nombre del lugar
    city: Mapped[str] = mapped_column(String(100), nullable=False)       # Punto 10: ciudad
    postal_code: Mapped[str] = mapped_column(String(10), nullable=True)  # Punto 10: código postal


    #clave foránea
    seller_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)


    #1-M
    seller: Mapped["User"] = relationship(back_populates = "events")


    #relación
    reservations: Mapped[List["Reservation"]]= relationship(back_populates="event", cascade= "all, delete-orphan")


    #relación
    reviews: Mapped[List["Review"]] = relationship(back_populates="event", cascade= "all, delete-orphan")


    #relación
    favorites: Mapped[List["Favorite"]] = relationship(back_populates="event", cascade= "all, delete-orphan")


    #relación con categorías 
    event_categories: Mapped[List["EventCategory"]] = relationship(back_populates="event", cascade= "all, delete-orphan")


    #relación con tags 
    event_tags: Mapped[List["EventTag"]] = relationship(back_populates="event", cascade= "all, delete-orphan")


    # rating calculado desde las reviews en vez de columna almacenada
    @property
    def event_rating(self):
        if not self.reviews:
            return None
        return round(sum(r.rating for r in self.reviews) / len(self.reviews), 2)
    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "event_type": self.event_type.value,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "exact_address":self.exact_address,
            "place": self.place,
            "city": self.city,
            "postal_code": self.postal_code,
            "start_time":self.start_time.isoformat() if self.start_time else None,
            "end_time": self.end_time.isoformat() if self.end_time else None,
            "max_capacity":self.max_capacity,
            "status":self.status.value,
            "created_at":self.created_at.isoformat() if self.created_at else None,
            "image_url":self.image_url,
            "event_rating":self.event_rating,
            "seller":{
                "id":self.seller_id,
                "email":self.seller.email
            } if self.seller else None,
            "favorites":[favorite.serialize()for favorite in self.favorites],
            "reservations":[reservation.serialize()for reservation in self.reservations],
            "reviews":[review.serialize()for review in self.reviews],
            "event_categories":[event_category.serialize()for event_category in self.event_categories],
            "event_tags": [event_tag.serialize()for event_tag in self.event_tags],
        }




class Reservation (db.Model):
    __tablename__ = "reservations"
    id: Mapped[int] = mapped_column(primary_key=True)
    status: Mapped[ReservationStatus] = mapped_column(Enum(ReservationStatus), default=ReservationStatus.confirmed)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    #claves foráneas
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id"), nullable=False)
    #1-M
    user: Mapped["User"] = relationship(back_populates = "reservations")
    #relación
    event: Mapped["Event"] = relationship(back_populates="reservations")




    def serialize(self):
        return {
            "id": self.id,
            "status": self.status.value,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "user":{
                "id": self.user_id,
                "email":self.user.email
            } if self.user else None,
            "event":{
                "id":self.event_id,
                "title": self.event.title
            } if self.event else None
           
        }
class Review (db.Model):
    __tablename__ = "reviews"
    id: Mapped[int] = mapped_column(primary_key=True)
    rating: Mapped[float] = mapped_column(Numeric (3,2), nullable= False)
    comment: Mapped[str] = mapped_column(Text,nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))




    #claves foráneas
    reviewer_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    reviewed_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id"), nullable=False)
    #1-M
    reviewer: Mapped["User"] = relationship(back_populates = "my_written_reviews", foreign_keys=[reviewer_id])
    #relación
    reviewed: Mapped["User"]= relationship(back_populates = "my_received_reviews", foreign_keys=[reviewed_id])
    #relación
    event: Mapped["Event"] = relationship(back_populates="reviews")
    def serialize(self):
        return {
            "id": self.id,
            "rating": self.rating,
            "comment": self.comment,
            "created_at": self.created_at,
            "reviewer":{
                "id":self.reviewer_id,
                "email":self.reviewer.email
            } if self.reviewer else None,
            "reviewed":{
                "id":self.reviewed_id,
                "email":self.reviewed.email
            } if self.reviewed else None,
            "event":{
                "id":self.event_id,
                "title": self.event.title
            } if self.event else None
           
        }




class User(db.Model):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    username: Mapped[str] = mapped_column(String(80), nullable=False, unique=True)
    bio: Mapped[str] = mapped_column(Text, nullable=True)
    profile_picture_url: Mapped[str] = mapped_column(
        String(255), nullable=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    deleted_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    user_rating: Mapped[float] = mapped_column(Float, nullable=True)




    #1-1
    profile:Mapped["Profile"] = relationship(back_populates="user",cascade="all, delete-orphan")
    #1-M
    events: Mapped[List["Event"]] = relationship(back_populates = "seller",cascade="all, delete-orphan")
    #1-M
    reservations: Mapped[List["Reservation"]] = relationship(back_populates = "user",cascade="all, delete-orphan")
    #1-M
    my_written_reviews: Mapped[List["Review"]] = relationship(back_populates = "reviewer",foreign_keys= "Review.reviewer_id",cascade="all, delete-orphan")
    #1-M
    my_received_reviews:Mapped[List["Review"]] = relationship(back_populates = "reviewed",foreign_keys= "Review.reviewed_id",cascade="all, delete-orphan")
    #Relación
    favorites: Mapped[List["Favorite"]] = relationship(back_populates = "user", cascade="all, delete-orphan")




    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "username":self.username,
            "bio": self.bio,
            "profile_picture_url": self.profile_picture_url,
            "is_verified": self.is_verified,
            "is_admin": self.is_admin,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "deleted_at": self.deleted_at.isoformat() if self.deleted_at else None,
            "user_rating": self.user_rating,
            "profile": self.profile.serialize() if self.profile else None,
            "events": [event.serialize() for event in self.events] if self.events else None,
            "reservations": [reservation.serialize() for reservation in self.reservations] if self.reservations else None,
            "my_written_reviews": [my_written_reviews.serialize() for my_written_reviews in self.my_written_reviews] if self.my_written_reviews else None,
            "my_received_reviews": [my_received_reviews.serialize() for my_received_reviews in self.my_received_reviews] if self.my_received_reviews else None,
            "favorites": [favorite.serialize() for favorite in self.favorites] 
            # do not serialize the password, its a security breach
        }




class Profile (db.Model):
    __tablename__ = "profile"
    id: Mapped[int] = mapped_column(primary_key=True)
    address: Mapped[str] = mapped_column(String(255), nullable= False)
    phone: Mapped[str] = mapped_column(String(20), nullable=False)
    firstname: Mapped[str] = mapped_column(String(100), nullable=False)
    lastname: Mapped[str] = mapped_column(String(100), nullable=False)
    
    #clave foránea
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, unique=True)
   
    #1-1
    user:Mapped["User"] = relationship(back_populates="profile")
    
    @property
    def events_created_count(self):
        if not self.user or not self.user.events:
            return 0
        return len(self.user.events)

    def serialize(self):
        return {
            "id": self.id,
            "address": self.address,
            "phone": self.phone,
            "firstname": self.firstname,
            "lastname": self.lastname,
            "events_created_count": self.events_created_count,
            "user":{
                "email":self.user.email
            } if self.user else None
           
        }








# Tabla de etiquetas
class Tag(db.Model):
    __tablename__ = "tags"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)


    #relación
    event_tags: Mapped[List["EventTag"]] = relationship(back_populates="tag", cascade="all, delete-orphan")


    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "event_tags": [et.serialize() for et in self.event_tags ]
        }




# Tabla asociación eventos con etiquetas
class EventTag(db.Model):
    __tablename__ = "event_tags"
    id: Mapped[int] = mapped_column(primary_key=True)
    #claves foráneas
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id"), nullable=False)
    tag_id: Mapped[int] = mapped_column(ForeignKey("tags.id"), nullable=False)


    #relaciones
    event: Mapped["Event"] = relationship(back_populates="event_tags")
    tag: Mapped["Tag"] = relationship(back_populates="event_tags")


    def serialize(self):
        return {
            "id": self.id,
            "tag": {
                "id":self.tag_id,
                "name": self.tag.name
            } if self.tag else None,
            "event": {
                "id":self.event_id,
                "title":self.event.title
            }
        }





