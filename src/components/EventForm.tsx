import {
  IonInput,
  IonButton,
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  //   IonDatetime,
  //   IonPopover,
} from "@ionic/react";
import { ChangeEvent, useState } from "react";
import { Image, Location } from "../state";

export interface FormEvent<T> {
  onSubmit: (t: T) => void;
  onCancel: () => void;
}

export default function Form(event: FormEvent<Image>) {
  const [comment, setComment] = useState("");
  const [location, setLocation] = useState<Location | null>(null);
  const [image, setImage] = useState<Image | null>(null);

  // function getCurrentLocation() {
  //   navigator.geolocation.getCurrentPosition((loc) =>
  //     setLocation(new Location(loc.coords.latitude, loc.coords.longitude))
  //   );
  // }

  async function onImageUpload(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files[0]) {
      const img = await Image.fromFile(event.target.files[0]);
      setImage(img);
      setLocation(img.location);
      setComment(img.comment);
    }
  }

  function onSubmit() {
    if (!image || !location) return;
    image.comment = comment;
    image.commit();

    // downloadBase64File(image.base64);
    event.onSubmit(image);
  }

  // useEffect(() => {
  //   getCurrentLocation();
  // }, []);

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
            disabled={!image}
            onIonChange={(e) => setComment(e.detail.value!)}
          ></IonInput>
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Location</IonLabel>
          <IonInput
            disabled={true}
            value={location ? `${location.latitude},${location.longitude}` : ""}
          ></IonInput>
        </IonItem>

        {/* <IonItem>
          <IonLabel position="stacked">01-13-22</IonLabel>
          <IonButton id="date-picker">Pick Date and Time</IonButton>
          <IonPopover trigger="date-picker">
            <IonDatetime></IonDatetime>
          </IonPopover>
        </IonItem> */}
      </IonList>

      <div className="flex justify-center">
        <IonButton onClick={onSubmit}>Add</IonButton>
        <IonButton color="danger" onClick={event.onCancel}>
          Cancel
        </IonButton>
      </div>
    </IonContent>
  );
}
