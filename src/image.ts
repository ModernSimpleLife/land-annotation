import * as piexif from "piexifjs";
import * as _ from "lodash";
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

// given a piexifjs object, this function displays its exif tags
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
          `    - ${piexif.tags[ifd][tag]["name"]}: ${exif[ifd][tag]}`
        );
      }
    }
  }
}

export class Image {
  readonly exifObj: any;

  constructor(private _base64: string) {
    const obj = piexif.load(_base64);
    const newExif = {
      "0th": { ...obj["0th"] },
      Exif: { ...obj["Exif"] },
      GPS: { ...obj["GPS"] },
      Interop: { ...obj["Interop"] },
      "1st": { ...obj["1st"] },
      thumbnail: null,
    };
    this.exifObj = newExif;
    // debugExif(obj);
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

  commit() {
    const exifBin = piexif.dump(this.exifObj);
    this._base64 = piexif.insert(exifBin, this._base64);
  }

  getLocation() {
    // TODO add fallback
    const group = "GPS";
    const gps = this.exifObj[group];

    if (!gps) {
      return null;
    }

    const latitude = gps[piexif.GPSIFD.GPSLatitude];
    const latitudeRef = gps[piexif.GPSIFD.GPSLatitudeRef];
    const longitude = gps[piexif.GPSIFD.GPSLongitude];
    const longitudeRef = gps[piexif.GPSIFD.GPSLongitudeRef];

    if (!latitude || !latitudeRef || !longitude || !longitudeRef) {
      return null;
    }

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

  get location(): Location {
    return this.getLocation() || new Location(0, 0);
  }

  set location(loc: Location) {
    const group = "GPS";
    const gps = this.exifObj[group] || {};

    gps[piexif.GPSIFD.GPSLatitude] = piexif.GPSHelper.degToDmsRational(
      loc.latitude
    );
    gps[piexif.GPSIFD.GPSLatitudeRef] = "N";
    gps[piexif.GPSIFD.GPSLongitude] = piexif.GPSHelper.degToDmsRational(
      loc.latitude
    );
    gps[piexif.GPSIFD.GPSLongitudeRef] = "W";
  }

  get comment(): string {
    return _.get(this.exifObj, ["Exif", piexif.ExifIFD.UserComment]) || "";
  }

  set comment(newComment: string) {
    if (this.comment === newComment) return;
    _.set(this.exifObj, ["Exif", piexif.ExifIFD.UserComment], newComment);
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
