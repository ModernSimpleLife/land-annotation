import {
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
import { ChangeEvent, useState } from "react";
import { add } from "ionicons/icons";
import "./Annotations.css";
import useStore, { exportState, importState } from "../state";
import EventForm from "../components/EventForm";

const AnnotationsPage: React.FC = () => {
  function handleImport(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const fileReader = new FileReader();
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (e) => {
        console.log(fileReader.result);
        // const json = JSON.parse(fileReader.result as string);
        importState(fileReader.result as string);
      };
    }
  }

  function handleExport() {
    const data = exportState();
    // Create a blob with the data we want to download as a file
    const blob = new Blob([data], { type: "json" });
    // Create an anchor element and dispatch a click event on it
    // to trigger a download
    const a = document.createElement("a");
    a.download = "data.json";
    a.href = window.URL.createObjectURL(blob);
    const clickEvt = new MouseEvent("click", {
      view: window,
      bubbles: true,
      cancelable: true,
    });
    a.dispatchEvent(clickEvt);
    a.remove();
  }

  return (
    <IonPage>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Annotations</IonTitle>
          </IonToolbar>
        </IonHeader>

        <div className="p-8 w-full h-full">
          <IonButton onClick={handleExport}>Export</IonButton>
          <input type="file" accept=".json" onChange={handleImport} />
          <EventsSection></EventsSection>
        </div>
      </IonContent>
    </IonPage>
  );
};

const EventsSection: React.FC = () => {
  const events = useStore((state) => state.events);
  const addEvent = useStore((state) => state.addEvent);
  const [showForm, setShowForm] = useState(false);

  return (
    <IonContent>
      <IonListHeader>
        <IonLabel>Events</IonLabel>
      </IonListHeader>
      <IonList>
        {events.map((e, i) => (
          <IonItem key={i}>
            <IonButton expand="full">
              {i + 1}. {e.comment}
            </IonButton>
          </IonItem>
        ))}
        <IonButton expand="full" onClick={() => setShowForm(true)}>
          <IonIcon icon={add}></IonIcon>
        </IonButton>
      </IonList>

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
    </IonContent>
  );
};

export default AnnotationsPage;
