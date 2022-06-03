import create from "zustand";
import { persist, StateStorage } from "zustand/middleware";
import imageCompression from "browser-image-compression";
import localForage from "localforage";

export class Location {
  constructor(readonly latitude: number, readonly longitude: number) {}

  static fromString(raw: string): Location {
    const tokens = raw.split(",");
    if (tokens.length !== 2) {
      throw Error("invalid location string format");
    }

    const lat = parseFloat(tokens[0]);
    const lng = parseFloat(tokens[1]);
    return new Location(lat, lng);
  }

  toString(): string {
    return `${this.latitude},${this.longitude}`;
  }
}

export class Image {
  constructor(readonly base64: string) {}

  static async fromFile(file: File): Promise<Image> {
    // const options = {
    //   maxSizeMB: 0.1,
    //   maxWidthOrHeight: 1920,
    //   useWebWorker: true,
    // };
    // file = await imageCompression(file, options);

    return new Promise((resolve, reject) => {
      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        resolve(new Image(reader.result as string));
      };
      reader.onerror = reject;
    });
  }

  static fromString(raw: string): Image {
    return new Image(raw);
  }

  toString(): string {
    return this.base64;
  }
}

export interface Event {
  title: string;
  location: Location;
  image: Image;
  description: string;
}

export interface State {
  events: Event[];
  addEvent: (e: Event) => void;
}

const useStore = create(
  persist<State>(
    (set) => ({
      events: [],
      addEvent: (e: Event) => {
        set((state) => ({
          events: [...state.events, e],
        }));
      },
      import: (json: string) => {},
    }),
    {
      name: "state",
      // Force casting, localForage's setItem returns Promise<string> but can be treated as
      // Promise<void>
      getStorage: () => localForage as StateStorage,
    }
  )
);

export function importState(json: string) {
  // TODO: validate
  const state = JSON.parse(json) as State;

  useStore.setState(state, true);
}

export function exportState(): string {
  return JSON.stringify(useStore.getState());
}

export default useStore;
