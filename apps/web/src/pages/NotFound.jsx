import React from "react";
import { Link } from "react-router-dom";
import "./NotFound.css";
import errorImage from "../assets/img/Desvanitos error 404.png";

export const NotFound = () => {
  return (
    <div className="notfound-page">
      <img
        src={errorImage}
        alt="Caja perdida 404"
        className="notfound-background"
      />
      <div className="notfound-overlay" />
      <div className="notfound-copy">
        <p className="notfound-signal">¡UY, ERROR 404!</p>
        <h1 className="notfound-title">Página no encontrada.</h1>
        <p className="notfound-subtitle">
          ¡Perdimos la caja, tesoros extraviados!
        </p>
        <Link to="/" className="no-underline-link">
          <button className="btn-back-home">Volver al inicio</button>
        </Link>
      </div>
    </div>
  );
};
