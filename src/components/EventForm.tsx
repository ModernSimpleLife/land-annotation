import {
  IonInput,
  IonButton,
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonIcon,
  //   IonDatetime,
  //   IonPopover,
} from "@ionic/react";
import { ChangeEvent, useEffect, useState } from "react";
import { locate } from "ionicons/icons";
import { Image, Location } from "../state";

export interface FormEvent<T> {
  onSubmit: (t: T) => void;
  onCancel: () => void;
}

export default function Form(event: FormEvent<Image>) {
  const [comment, setComment] = useState("");
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
      setLocation(img.location);
      setComment(img.comment);
    }
  }

  function onSubmit() {
    if (!image) return;
    image.comment = comment;

    // downloadBase64File(image.base64);
    event.onSubmit(image);
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
          <input type="file" onChange={onImageUpload}></input>

          {image && (
            <img className="w-full h-auto" src={image.base64} alt="Annotated" />
          )}
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Comment</IonLabel>
          <IonInput
            value={comment}
            onIonChange={(e) => setComment(e.detail.value!)}
          ></IonInput>
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

        {/* <IonItem>
          <IonLabel position="stacked">01-13-22</IonLabel>
          <IonButton id="date-picker">Pick Date and Time</IonButton>
          <IonPopover trigger="date-picker">
            <IonDatetime></IonDatetime>
          </IonPopover>
        </IonItem> */}
      </IonList>

      <IonButton onClick={onSubmit}>Add</IonButton>
      <IonButton color="danger" onClick={event.onCancel}>
        Cancel
      </IonButton>
    </IonContent>
  );
}
