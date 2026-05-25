import React from "react";

export const Map = ({
    address = "",
    latitude = null,
    longitude = null,
    zoom = 15,
    className = ""
}) => {

    // Si tenemos coordenadas, usar esas; si no, usar la dirección
    let mapUrl;

    if (latitude && longitude) {
        mapUrl = `https://maps.google.com/maps?q=${latitude},${longitude}&t=&z=${zoom}&ie=UTF8&iwloc=&output=embed`;
    } else if (address) {
        const encodedAddress = encodeURIComponent(address);
        mapUrl = `https://maps.google.com/maps?q=${encodedAddress}&t=&z=${zoom}&ie=UTF8&iwloc=&output=embed`;
    } else {
        return (
            <div className="map-container">
                <p>No hay ubicación disponible</p>
            </div>
        );
    }

    return (
        <div className={`map-container ${className}`}>
            <iframe
                title="mapa"
                width="100%"
                height="100%"
                frameBorder="0"
                src={mapUrl}
                style={{
                    border: "none",
                    filter: "grayscale(0.2)"
                }}
                allowFullScreen
                loading="lazy"
            />
        </div>
    );
};
