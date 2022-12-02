import { writable } from "svelte/store";

export const fileListStore = writable([]);
export const fileDataStore = writable({
  downloaded: 0,
  length: 0,
  fileName: "",
});
