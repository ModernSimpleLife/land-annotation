import {
  IonModal,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonFab,
  IonFabButton,
  IonIcon,
} from "@ionic/react";
import { add } from "ionicons/icons";
import "./Map.css";
import Map from "../components/Map";
import EventForm from "../components/EventForm";
import useStore from "../state";
import { useState } from "react";

const MapPage: React.FC = () => {
  const state = useStore((state) => state);
  const addEvent = useStore((state) => state.addEvent);
  const [showForm, setShowForm] = useState(false);

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

      <IonFab vertical="bottom" horizontal="end" slot="fixed">
        <IonFabButton onClick={() => setShowForm(true)}>
          <IonIcon icon={add} />
        </IonFabButton>
      </IonFab>

      <IonModal
        onDidDismiss={() => setShowForm(false)}
        isOpen={showForm}
        breakpoints={[0.1, 0.5, 1]}
        initialBreakpoint={0.5}
      >
        <EventForm
          onSubmit={(e) => {
            setShowForm(false);
            addEvent(e);
          }}
          onCancel={() => setShowForm(false)}
        />
      </IonModal>
    </IonPage>
  );
};

export default MapPage;
