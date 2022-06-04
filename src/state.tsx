import create from "zustand";
import { persist, StateStorage } from "zustand/middleware";
// import imageCompression from "browser-image-compression";
import localForage from "localforage";
import * as piexif from "piexifjs";
import _ from "lodash";
import { createSHA256 } from "hash-wasm";

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

// Given a Piexifjs object, this function displays its Exif tags
// in a human-readable format
function debugExif(exif: any) {
  for (const ifd in exif) {
    if (ifd === "thumbnail") {
      const thumbnailData = exif[ifd] === null ? "null" : exif[ifd];
      console.log(`- thumbnail: ${thumbnailData}`);
    } else {
      console.log(`- ${ifd}`);
      for (const tag in exif[ifd]) {
        console.log(
          `    - ${piexif.TAGS[ifd][tag]["name"]}: ${exif[ifd][tag]}`
        );
      }
    }
  }
}
export class Image {
  readonly exifObj: any;

  constructor(private _base64: string) {
    const obj = piexif.load(_base64);
    this.exifObj = obj;
    debugExif(obj);
  }

  async hash(): Promise<string> {
    const h = await createSHA256();
    h.init();

    const key = `${
      this.comment
    }L${this.location.toString()}T${this.datetime.toISOString()}`;
    h.update(key);
    return `image${h.digest("hex")}`;
  }

  get base64(): string {
    return this._base64;
  }

  private update() {
    const exifBin = piexif.dump(this.exifObj);
    this._base64 = piexif.insert(exifBin, this._base64);
  }

  get location(): Location {
    const group = "GPS";
    const gps = this.exifObj[group];
    const latitude = gps[piexif.GPSIFD.GPSLatitude];
    const latitudeRef = gps[piexif.GPSIFD.GPSLatitudeRef];
    const longitude = gps[piexif.GPSIFD.GPSLongitude];
    const longitudeRef = gps[piexif.GPSIFD.GPSLongitudeRef];

    // Convert the latitude and longitude into the format that Google Maps expects
    // (decimal coordinates and +/- for north/south and east/west)
    const latitudeMultiplier = latitudeRef === "N" ? 1 : -1;
    const decimalLatitude =
      latitudeMultiplier * piexif.GPSHelper.dmsRationalToDeg(latitude);
    const longitudeMultiplier = longitudeRef === "E" ? 1 : -1;
    const decimalLongitude =
      longitudeMultiplier * piexif.GPSHelper.dmsRationalToDeg(longitude);

    return new Location(decimalLatitude, decimalLongitude);
  }

  get comment(): string {
    return _.get(this.exifObj, ["Exif", piexif.ExifIFD.UserComment]) || "";
  }

  set comment(newComment: string) {
    if (this.comment === newComment) return;
    _.set(this.exifObj, ["Exif", piexif.ExifIFD.UserComment], newComment);
    this.update();
  }

  get datetime(): Date {
    const dateStr = _.get(this.exifObj, ["0th", piexif.ImageIFD.DateTime]) as
      | string
      | null;
    if (dateStr) {
      // Convert YY:MM:DD HH:mm:SS to YY-MM-DDTHH:mm:ss
      const tokens = dateStr.trim().split(" ");
      const date = tokens[0].split(":").join("-");
      const time = tokens[1];
      const datetime = `${date}T${time}`;
      return new Date(datetime);
    } else {
      return new Date();
    }
  }

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

export interface State {
  events: Image[];
  addEvent: (e: Image) => void;
}

// class PersistentStorage implements StateStorage {
//     getItem: (name: string) => string | null | Promise<string | null> {

//     }
//     setItem: (name: string, value: string) => void | Promise<void> {

//     }

//     removeItem: (name: string) => void | Promise<void> {

//     }
// }

class Serializer {
  storedEvents: Set<string> = new Set();

  async serialize(state: State): Promise<string> {
    const hashes = [];
    const tasks = [];
    for (const event of state.events) {
      const hash = await event.hash();
      if (this.storedEvents.has(hash)) {
        continue;
      }

      this.storedEvents.add(hash);
      tasks.push(localForage.setItem(hash, event.base64));
      hashes.push(hash);
    }

    await Promise.all(tasks);
    return JSON.stringify({
      events: hashes,
    });
  }

  async deserialize(str: string): Promise<Partial<State>> {
    const stateRaw = JSON.parse(str);
    const hashes = stateRaw["events"] as string[];
    const events = await Promise.all(
      hashes.map(async (h) => {
        const img = (await localForage.getItem(h)) as string;
        return new Image(img);
      })
    );

    return {
      events,
    };
  }
}

const serializer = new Serializer();

const useStore = create(
  persist<State>(
    (set) => ({
      events: [],
      addEvent: (e: Image) => {
        set((state) => ({
          events: [...state.events, e],
        }));
      },
      import: (json: string) => {},
    }),
    {
      name: "state",
      serialize: (state) => serializer.serialize(state.state),
      deserialize: async (str) => ({
        state: await serializer.deserialize(str),
      }),
      // Force casting, localForage's setItem returns Promise<string> but can be treated as
      // Promise<void>
      getStorage: () => localForage as StateStorage,
    }
  )
);

export function importState(json: string) {
  // TODO: validate
  const stateRaw = JSON.parse(json);
  const events = (stateRaw["events"] as Record<string, string>[]).map(
    (b) => new Image(b["_base64"])
  );

  useStore.setState(
    {
      events,
    },
    true
  );
}

export function exportState(): string {
  return JSON.stringify(useStore.getState());
}

export default useStore;
