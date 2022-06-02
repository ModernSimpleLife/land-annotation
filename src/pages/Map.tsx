import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import "./Map.css";
import Map from "../components/Map";
import useStore from "../state";

const MapPage: React.FC = () => {
  const state = useStore((state) => state);

  return (
    <IonPage>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Map</IonTitle>
          </IonToolbar>
        </IonHeader>
        <Map events={state.events} />
      </IonContent>
    </IonPage>
  );
};

export default MapPage;
