import {
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonIcon,
} from "@ionic/react";
import useStore, { Image } from "../state";
import { arrowDown, trashBin } from "ionicons/icons";

export interface EventDetailsProps {
  event: Image;
  onDone: () => void;
}

export default function EventDetails(props: EventDetailsProps) {
  const deleteEvent = useStore((state) => state.deleteEvent);

  async function downloadBase64File() {
    const downloadLink = document.createElement("a");
    downloadLink.href = props.event.base64;
    downloadLink.download = `${await props.event.hash()}.jpg`;
    downloadLink.click();
    downloadLink.remove();
  }

  return (
    <IonCard>
      <IonCardHeader className="flex flex-col items-center">
        <img
          loading="lazy"
          src={props.event.base64}
          alt="Marker"
          className="w-auto h-128 max-h-full object-cover"
        ></img>
        <IonCardTitle>{props.event.comment}</IonCardTitle>
        <IonCardSubtitle>{props.event.location.toString()}</IonCardSubtitle>
        <IonButton onClick={downloadBase64File}>
          <IonIcon icon={arrowDown}></IonIcon>
          Download
        </IonButton>
        <IonButton
          color="danger"
          onClick={() => {
            deleteEvent(props.event);
            props.onDone();
          }}
        >
          <IonIcon icon={trashBin}></IonIcon>
          Delete
        </IonButton>
      </IonCardHeader>
      {/* <IonCardContent>{props.event.description}</IonCardContent> */}
    </IonCard>
  );
}
