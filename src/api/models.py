import enum
from datetime import datetime, timezone
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, Text, Float, Enum, DateTime, Integer, ForeignKey, DECIMAL, JSON, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List

db = SQLAlchemy()





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
    #relacion hacer
    #def serialize hacer

#Tabla asociación eventos con categorías
class EventCategory(db.Model):
    __tablename__ = "event_categories"
    id: Mapped[int] = mapped_column(primary_key=True)
    #claves foráneas
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id"), nullable=False) 
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"), nullable= True) 
    #relacion poner
    #def serialize

class Favorite (db.Model):
    __tablename__ = "favorites"
    id: Mapped[int] = mapped_column(primary_key=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now(datetime.timezone.utc))
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
            "created_at": self.created_at,
            "user":{
                "email":self.user.email
            } if self.user else None,
            "event":{
                "title": self.event.title

            }if self.event else None,
            
        }

class Event (db.Model): #ESTA TABLA DEBE IR ARRIBA?
    __tablename__ = "events"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255), nullable= False)
    description: Mapped[str] = mapped_column(Text, nullable= True)
    latitude: Mapped[str] = mapped_column(String(50), nullable=False) 
    longitude: Mapped[str] = mapped_column(String(50), nullable=False)
    exact_address: Mapped[str] = mapped_column(String(255), nullable= False)
    start_time: Mapped[datetime]  = mapped_column(DateTime(timezone=True))
    end_time: Mapped[datetime]  = mapped_column(DateTime(timezone=True))
    max_capacity: Mapped[int] = mapped_column(Integer, nullable= True)
    status: Mapped[EventStatus] = mapped_column(Enum(EventStatus), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now(datetime.timezone.utc))
    image_url: Mapped[dict] = mapped_column(JSON, nullable= True) 
    event_rating: Mapped[float] = mapped_column(DECIMAL (3,2), nullable= True) #------> decimal? como se hace la relación entre el que valora y el que recibe la valoración
    #clave foránea
    seller_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    
    #1-M
    seller: Mapped["User"] = relationship(back_populates = "events")

    #relación
    reservations: Mapped["Reservation"] = relationship(back_populates="events")
    
    #relación
    reviews: Mapped["Review"] = relationship(back_populates="event")

    #relación
    favorites: Mapped [List["Favorite"]] = relationship(back_populates="event")
    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "exact_address":self.exact_address,
            "start_time":self.start_time,
            "end_time": self.end_time,
            "max_capacity":self.max_capacity,
            "status":self.status.value,
            "created_at":self.created_at.isoformat() if self.created_at else None,
            "image_url":self.image_url,
            "event_rating":self.event_rating,
            "seller":{
                "email":self.seller.email
            } if self.seller else None,
            "favorites":{
                "event":self.favorites.event
            } if self.favorites else None,
            "reservations":{
               "status":self.reservations.status
            } if self.reservations else None ,
            "reviews":{
                "comment": self.reviews.comment
            } if self.reviews else None
        }

class Reservation (db.Model):
    __tablename__ = "reservations"
    id: Mapped[int] = mapped_column(primary_key=True)
    status: Mapped[ReservationStatus] = mapped_column(Enum(ReservationStatus), default=ReservationStatus.confirmed)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now(datetime.timezone.utc))
    #claves foráneas
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id"), nullable=False)
    #1-M
    user: Mapped["User"] = relationship(back_populates = "reservations")
    #relación
    events: Mapped[List["Event"]] = relationship(back_populates="reservations")

    def serialize(self):
        return {
            "id": self.id,
            "status": self.status,
            "created_at": self.created_at,
            "user":{
                "email":self.user.email
            } if self.user else None,
            "events":{
                "title": self.events.title
            } if self.events else None
            
        }
class Review (db.Model):
    __tablename__ = "reviews"
    id: Mapped[int] = mapped_column(primary_key=True)
    rating: Mapped[DECIMAL] = mapped_column(Numeric (3,2), nullable= False) 
    comment: Mapped[str] = mapped_column(Text,nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now(datetime.timezone.utc))

    #claves foráneas
    reviewer_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    reviewed_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id"), nullable=False)
    #1-M
    reviewer: Mapped["User"] = relationship(back_populates = "my_written_reviews")#-----> esto es una lista?
    #relación
    reviewed: Mapped[List["User"]]= relationship(back_populates = "my_received_reviews")
    #relación
    event: Mapped["Event"] = relationship(back_populates="reviews")
    def serialize(self):
        return {
            "id": self.id,
            "rating": self.rating,
            "comment": self.comment,
            "created_at": self.created_at,
            "reviewer":{
                "email":self.reviewer.email
            } if self.reviewer else None,
            "reviewed":{
                "email":self.reviewed.email
            } if self.reviewed else None,
            "event":{
                "title": self.event.title
            } if self.event else None
            
        }

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
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.now(datetime.timezone.utc))
    deleted_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    user_rating: Mapped[float] = mapped_column(Float, nullable=True)

    #1-1
    profile:Mapped["Profile"] = relationship(back_populates="user")
    #1-M
    events: Mapped[List["Event"]] = relationship(back_populates = "seller")
    #1-M
    reservations: Mapped[List["Reservation"]] = relationship(back_populates = "user")
    #1-M
    my_written_reviews: Mapped[List["Review"]] = relationship(back_populates = "reviewer")
    #1-M
    my_received_reviews:Mapped[List["Review"]] = relationship(back_populates = "reviewed")
    #Relación
    favorites: Mapped[List["Favorite"]] = relationship(back_populates = "user", cascade="all, delete-orphan")

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
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
            "favorites": [favorite.serialize() for favorite in self.favorites] if self.favorites else None
            # do not serialize the password, its a security breach
        }

class Profile (db.Model):
    __tablename__ = "profile"
    id: Mapped[int] = mapped_column(primary_key=True)
    address: Mapped[str] = mapped_column(String(255), nullable= False)
    phone: Mapped[str] = mapped_column(String(20), nullable=False) 
    firstname: Mapped[str] = mapped_column(String(100), nullable=False)
    lastname: Mapped[str] = mapped_column(String(100), nullable=False)
    events_created_count: Mapped[int] =mapped_column(Integer, nullable=True)
    #clave foránea
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, unique=True)
    
    #1-1
    user:Mapped["User"] = relationship(back_populates="profile")
    
    def serialize(self):
        return {
            "id": self.id,
            "address": self.address,
            "phone": self.phone,
            "firsname": self.firstname,
            "lastname": self.lastname,
            "events_created_count": self.events_created_count,
            "user":{
                "email":self.user.email
            } if self.user else None
            
        }

     




#Relación no olvidar meter cascade(fav por ejemplo)
