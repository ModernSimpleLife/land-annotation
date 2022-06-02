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
import mapboxgl from "mapbox-gl"; // This is a dependency of react-map-gl even if you didn't explicitly install it
import { useState } from "react";

// @ts-ignore
mapboxgl.workerClass =
  // eslint-disable-next-line import/no-webpack-loader-syntax
  require("worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker").default;

const land: GeoJSON.Feature<GeoJSON.Geometry> = {
  type: "Feature",
  properties: null,
  geometry: {
    type: "Polygon",
    // These coordinates outline Maine.
    coordinates: [
      [
        [-67.13734, 45.13745],
        [-66.96466, 44.8097],
        [-68.03252, 44.3252],
        [-69.06, 43.98],
        [-70.11617, 43.68405],
        [-70.64573, 43.09008],
        [-70.75102, 43.08003],
        [-70.79761, 43.21973],
        [-70.98176, 43.36789],
        [-70.94416, 43.46633],
        [-71.08482, 45.30524],
        [-70.66002, 45.46022],
        [-70.30495, 45.91479],
        [-70.00014, 46.69317],
        [-69.23708, 47.44777],
        [-68.90478, 47.18479],
        [-68.2343, 47.35462],
        [-67.79035, 47.06624],
        [-67.79141, 45.70258],
        [-67.13734, 45.13745],
      ],
    ],
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
          className="w-64 h-64 rounded-full"
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
        longitude: -70.64573,
        latitude: 43.09008,
        zoom: 3.5,
      }}
      onLoad={(e) => e.target.resize()}
      mapStyle="mapbox://styles/mapbox/streets-v9"
      mapboxAccessToken="pk.eyJ1IjoibGhlcm1hbi1jcyIsImEiOiJja3g1ZjF1bXoyYW82MnZxM21jODBmanJ3In0.BAJg8UuLGqwVd4WI1XFXUA"
    >
      <GeolocateControl
        positionOptions={{ enableHighAccuracy: true }}
        trackUserLocation={true}
        showUserHeading={true}
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
              className="rounded-full w-16 h-16"
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
