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
import { ChangeEvent, useEffect, useState } from "react";
import { locate, add } from "ionicons/icons";
import "./Annotations.css";
import useStore, {
  Image,
  Event,
  Location,
  exportState,
  importState,
} from "../state";

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
          <input type="file" onChange={handleImport} />
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
              {i + 1}. {e.title}
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

interface FormEvent<T> {
  onSubmit: (t: T) => void;
  onCancel: () => void;
}

const EventForm: React.FC<FormEvent<Event>> = (event) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState<Location | null>(null);
  const [image, setImage] = useState<Image | null>(null);

  function getCurrentLocation() {
    navigator.geolocation.getCurrentPosition((loc) =>
      setLocation(new Location(loc.coords.latitude, loc.coords.longitude))
    );
  }

  async function onImageUpload(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files[0]) {
      const img = await Image.fromFile(event.target.files[0]);
      setImage(img);
    }
  }

  function onSubmit() {
    if (title.length === 0 || !location || !image) {
      // TODO: validate
      throw Error("invalid inputs");
    }

    event.onSubmit({
      title,
      location,
      image,
      description,
    });
  }

  useEffect(() => {
    getCurrentLocation();
  }, []);

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
          <IonLabel position="stacked">Description</IonLabel>
          <IonInput
            value={description}
            onIonChange={(e) => setDescription(e.detail.value!)}
          ></IonInput>
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Image</IonLabel>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={onImageUpload}
          ></input>

          {image && (
            <img className="w-full h-auto" src={image.base64} alt="Annotated" />
          )}
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Location</IonLabel>
          <IonInput
            value={location ? `${location.latitude},${location.longitude}` : ""}
          >
            <IonButton color="primary" onClick={getCurrentLocation}>
              <IonIcon icon={locate}></IonIcon>
            </IonButton>
          </IonInput>
        </IonItem>
      </IonList>

      <IonButton onClick={onSubmit}>Add</IonButton>
      <IonButton color="danger" onClick={event.onCancel}>
        Cancel
      </IonButton>
    </IonContent>
  );
};

export default AnnotationsPage;
