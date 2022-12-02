import * as fs from "bro-fs";
import { downloadLink } from "./download";

/* const createFile = async (name) => {
  return fs.createWriteStream(`${path}/${name}`);
}; */

class FSLogic {
  public path = "";

  private writers = {};

  constructor(path) {
    this.path = `/tmp/${path}`;
  }

  init() {
    // @ts-ignore
    return fs.init({ type: window.TEMPORARY, bytes: 5 * 1024 * 1024 * 1024 });
  }

  createDir() {
    return fs.mkdir(this.path);
  }

  async createWriter(uid, name, length) {
    const stream = await fs.createWriteStream(`${this.path}/${name}`);
    const defaultWriter = stream.getWriter();
    await defaultWriter.ready;
    this.writers[uid] = { writer: defaultWriter, name, length, downloaded: 0 };
    return defaultWriter;
  }

  getWriter(uid) {
    return this.writers[uid]?.writer;
  }

  getWriterData(uid) {
    const writerData = this.writers[uid];
    return writerData;
  }

  async appendChunk(uid, chunk) {
    try {
      const uint8arr = Uint8Array.from(chunk);

      const writer = this.writers[uid]?.writer;
      writer.write(uint8arr.buffer);

      this.writers[uid].downloaded += uint8arr.buffer.byteLength;
    } catch (ex) {
      console.error("Append chunk error", ex);
    }
  }

  async closeWriter(uid) {
    const writer = this.writers[uid]?.writer;
    if (!writer) return;
    await writer.ready;
    await writer.close();
  }

  async downloadLocalFile(uid) {
    const { name } = this.writers[uid];
    const file = await fs.getUrl(`${this.path}/${name}`);

    downloadLink(file, name);
    delete this.writers[uid];
  }
}

export default FSLogic;
