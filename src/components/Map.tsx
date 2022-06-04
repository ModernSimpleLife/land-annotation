import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonModal,
} from "@ionic/react";
import Map, {
  GeolocateControl,
  Marker,
  Source,
  Layer,
  FillLayer,
} from "react-map-gl";
import { Event } from "../state";
import { Position } from "geojson";
import mapboxgl from "mapbox-gl"; // This is a dependency of react-map-gl even if you didn't explicitly install it
import { useState } from "react";

// @ts-ignore
mapboxgl.workerClass =
  // eslint-disable-next-line import/no-webpack-loader-syntax
  require("worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker").default;

function reverseLatLng(coordinates: Position[]) {
  for (const coord of coordinates) {
    const lat = coord[1];
    const lng = coord[0];
    coord[0] = lat;
    coord[1] = lng;
  }
}

const ourLand: Position[] = [
  [36.073362, -82.731789],
  [36.073362, -82.73078],
  [36.076397, -82.730677],
  [36.076268, -82.72841],
  [36.073714, -82.728609],
  [36.073779, -82.730572],
  [36.072708, -82.730685],
  [36.073189, -82.731457],
  [36.073189, -82.73179],
];
reverseLatLng(ourLand);

const land: GeoJSON.Feature<GeoJSON.Geometry> = {
  type: "Feature",
  properties: null,
  geometry: {
    type: "Polygon",
    coordinates: [ourLand],
  },
};

const layerStyle: FillLayer = {
  id: "point",
  type: "fill",
  paint: {
    "fill-color": "#007cbf",
    "fill-outline-color": "#000000",
    "fill-opacity": 0.3,
  },
};

interface EventDetailsProps {
  event: Event;
}

function EventDetails(props: EventDetailsProps) {
  return (
    <IonCard>
      <IonCardHeader className="flex flex-col items-center">
        <img
          src={props.event.image.base64}
          alt="Marker"
          className="w-64 h-64 rounded-full object-cover"
        ></img>
        <IonCardTitle>{props.event.title}</IonCardTitle>
        <IonCardSubtitle>{props.event.location.toString()}</IonCardSubtitle>
      </IonCardHeader>
      <IonCardContent>{props.event.description}</IonCardContent>
    </IonCard>
  );
}

export interface Props {
  events: Event[];
}

export default function AnnotatedMap(props: Props) {
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);

  return (
    <Map
      initialViewState={{
        longitude: -82.73179,
        latitude: 36.073211,
        zoom: 18,
      }}
      onLoad={(e) => e.target.resize()}
      mapStyle="mapbox://styles/mapbox/satellite-streets-v11"
      mapboxAccessToken="pk.eyJ1IjoibGhlcm1hbi1jcyIsImEiOiJja3g1ZjF1bXoyYW82MnZxM21jODBmanJ3In0.BAJg8UuLGqwVd4WI1XFXUA"
    >
      <GeolocateControl
        positionOptions={{ enableHighAccuracy: true }}
        trackUserLocation={true}
        showUserHeading={true}
        showAccuracyCircle={false}
      />

      {props.events.map((e, i) => (
        <Marker
          key={i}
          longitude={e.location.longitude}
          latitude={e.location.latitude}
          anchor="bottom"
        >
          <button onClick={() => setCurrentEvent(e)}>
            <img
              src={e.image.base64}
              alt={e.title}
              className="rounded-full w-16 h-16 object-cover"
            />
          </button>
        </Marker>
      ))}

      <Source id="my-data" type="geojson" data={land}>
        <Layer {...layerStyle} />
      </Source>

      <IonModal
        onDidDismiss={() => setCurrentEvent(null)}
        isOpen={!!currentEvent}
        breakpoints={[0.1, 0.5, 1]}
        initialBreakpoint={0.5}
      >
        {currentEvent && <EventDetails event={currentEvent}></EventDetails>}
      </IonModal>
    </Map>
  );
}