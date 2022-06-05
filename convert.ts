import { Image, Location } from "./src/image";
export {};
const fs = require("fs");

const data = [
  "./data/1.json",
  "./data/2.json",
  "./data/3.json",
  "./data/4.json",
].map((p) => JSON.parse(fs.readFileSync(p, "utf8")));

const events = [];

(async () => {
  for (const state of data) {
    const converted = await Promise.all(
      state.events.map(async (d) => {
        performance.mark("image-start");

        console.log(typeof d.image.base64);
        const data = d.image.base64.slice(d.image.base64.indexOf(",") + 1);
        const bin = atob(data);
        const img = new Image(bin);
        // const img = new Image(d.image.base64);
        // await img.compress();
        performance.mark("image-end");

        // performance.mark("location-start");
        console.log(d.location);
        img.location = new Location(d.location.latitude, d.location.longitude);
        // performance.mark("location-end");

        // performance.mark("comment-start");
        img.comment = `${d.title} - ${d.description}`;
        // performance.mark("comment-end");

        performance.mark("commit-start");
        img.commit();
        // global.gc();
        performance.mark("commit-end");

        // console.log(performance.measure("image", "image-start", "image-end"));
        // console.log(
        //   performance.measure("location", "location-start", "location-end")
        // );
        // console.log(performance.measure("comment", "comment-start", "comment-end"));
        console.log(
          performance.measure("commit", "commit-start", "commit-end")
        );

        /* @ts-ignore */
        img._base64 = `data:image/jpeg;base64,${btoa(img.base64)}`;
        return img;
      })
    );
    events.push(...converted);
  }

  const str = JSON.stringify({
    events,
  });
  fs.writeFileSync("converted.json", str);
})();
