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
  IonLoading,
} from "@ionic/react";
import { ChangeEvent, useRef, useState } from "react";
import { add, trashBin } from "ionicons/icons";
import "./Annotations.css";
import useStore, { exportState, importState } from "../state";
import EventForm from "../components/EventForm";
import EventDetails from "../components/EventDetails";
import { Image } from "../image";

const AnnotationsPage: React.FC = () => {
  const [showLoading, setShowLoading] = useState(false);
  const fileUploadRef = useRef<HTMLInputElement>(null);

  function handleImport(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setShowLoading(true);
      const fileReader = new FileReader();
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = async (e) => {
        // const json = JSON.parse(fileReader.result as string);
        await importState(fileReader.result as string);
        setShowLoading(false);
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

        <div className="flex justify-between">
          <div>
            <IonButton onClick={handleExport}>Export</IonButton>
            <IonButton
              onClick={() => fileUploadRef.current!.click()}
              color="danger"
            >
              Import
            </IonButton>
          </div>
          <div>
            <IonButton color="danger">
              <IonIcon icon={trashBin}></IonIcon>
              Clear Data
            </IonButton>
          </div>
        </div>
        <input
          className="hidden"
          type="file"
          accept=".json"
          onChange={handleImport}
          ref={fileUploadRef}
        />
        <EventsSection></EventsSection>
      </IonContent>

      <IonLoading isOpen={showLoading} message={"Importing..."}></IonLoading>
    </IonPage>
  );
};

const EventsSection: React.FC = () => {
  const events = useStore((state) => state.events);
  const addEvent = useStore((state) => state.addEvent);
  const [showForm, setShowForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Image | null>(null);

  return (
    <IonContent>
      <IonListHeader>
        <IonLabel>Events</IonLabel>
      </IonListHeader>
      <IonList>
        {events.map((e, i) => (
          <IonItem
            key={i}
            className="cursor-pointer"
            onClick={() => {
              setSelectedEvent(e);
              setShowForm(true);
            }}
          >
            {i + 1}. {e.comment}
          </IonItem>
        ))}
        <IonButton
          expand="full"
          onClick={() => {
            setSelectedEvent(null);
            setShowForm(true);
          }}
          className="my-4"
        >
          <IonIcon icon={add}></IonIcon>
        </IonButton>
      </IonList>

      <IonModal
        onDidDismiss={() => setShowForm(false)}
        isOpen={showForm}
        breakpoints={[0.1, 0.5, 1]}
        initialBreakpoint={1}
      >
        {selectedEvent ? (
          <EventDetails
            event={selectedEvent}
            onDone={() => setShowForm(false)}
          ></EventDetails>
        ) : (
          <EventForm
            onSubmit={(e) => {
              setShowForm(false);
              addEvent(e);
            }}
            onCancel={() => setShowForm(false)}
          />
        )}
      </IonModal>
    </IonContent>
  );
};

export default AnnotationsPage;
