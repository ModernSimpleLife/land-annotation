import React, { useRef, useEffect, useState } from "react";
import Map, { GeolocateControl } from "react-map-gl";

export default function AnnotatedMap() {
  return (
    <Map
      initialViewState={{
        longitude: -100,
        latitude: 40,
        zoom: 3.5,
      }}
      mapStyle="mapbox://styles/mapbox/streets-v9"
      mapboxAccessToken="pk.eyJ1IjoibGhlcm1hbi1jcyIsImEiOiJja3g1ZjF1bXoyYW82MnZxM21jODBmanJ3In0.BAJg8UuLGqwVd4WI1XFXUA"
    >
      <GeolocateControl
        positionOptions={{ enableHighAccuracy: true }}
        trackUserLocation={true}
        showUserHeading={true}
      />
    </Map>
  );
}
