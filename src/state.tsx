import create from "zustand";
import { persist, StateStorage } from "zustand/middleware";
// import imageCompression from "browser-image-compression";
import localForage from "localforage";
import { Image } from "./image";
export { Image, Location } from "./image";

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
