import {
  IonInput,
  IonModal,
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonIcon,
} from "@ionic/react";
import { useState } from "react";
import { locate } from "ionicons/icons";
import "./Annotations.css";

const AnnotationsPage: React.FC = () => {
  return (
    <IonPage>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Annotations</IonTitle>
          </IonToolbar>
        </IonHeader>

        <div className="p-8 w-full h-full">
          <EventsSection></EventsSection>
        </div>
      </IonContent>
    </IonPage>
  );
};

const EventsSection: React.FC = () => {
  return (
    <IonContent>
      <IonListHeader>
        <IonLabel>Events</IonLabel>
      </IonListHeader>
      <IonList>
        <IonItem>
          <IonButton expand="full">Event 1</IonButton>
        </IonItem>
      </IonList>

      <IonModal
        isOpen={true}
        breakpoints={[0.1, 0.5, 1]}
        initialBreakpoint={0.5}
      >
        <EventForm />
      </IonModal>
    </IonContent>
  );
};

const EventForm: React.FC = () => {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState<GeolocationPosition | null>(null);

  function getCurrentLocation() {
    navigator.geolocation.getCurrentPosition(setLocation);
  }

  return (
    <IonContent>
      <IonListHeader>
        <IonLabel>Adding an event</IonLabel>
      </IonListHeader>
      <IonList>
        <IonItem>
          <IonLabel position="stacked">Title</IonLabel>
          <IonInput
            value={title}
            onIonChange={(e) => setTitle(e.detail.value!)}
          ></IonInput>
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Title</IonLabel>
          <input type="file" accept="image/*" capture="environment"></input>
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Location</IonLabel>
          <IonInput
            value={
              location
                ? `${location.coords.latitude},${location.coords.longitude}`
                : ""
            }
          >
            <IonButton color="primary" onClick={getCurrentLocation}>
              <IonIcon icon={locate}></IonIcon>
            </IonButton>
          </IonInput>
        </IonItem>
      </IonList>

      <IonButton>Add</IonButton>
      <IonButton color="danger">Cancel</IonButton>
    </IonContent>
  );
};

export default AnnotationsPage;
