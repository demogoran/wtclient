import FSLogic from "./fs-logic";
import { fileDataStore, fileListStore } from "./stores";

interface WSMessage {
  event: string;
  data: string;
}

class WSLogic {
  private server: string;
  private fsLogic: FSLogic;

  public socket: WebSocket;

  constructor(server: string) {
    this.server = server;
    this.socket = new WebSocket(this.server);

    this.fsLogic = new FSLogic("test");
  }

  async init() {
    return new Promise((resolve) => {
      this.socket.onopen = () => {
        console.log("Connected to", this.server);
        this.socket.onmessage = (ev: MessageEvent<string>) => {
          try {
            const message = JSON.parse(ev.data) as WSMessage;
            const action = this[`on${message?.event}`];
            if (!action) return;

            action.call(this, message?.data);
          } catch (ex) {
            console.error("Action parse error:", ex);
          }
        };
        resolve(true);
      };
    });
  }

  send(event, data) {
    this.socket.send(
      JSON.stringify({
        event,
        data,
      })
    );
  }

  async onFileList(data) {
    fileListStore.set(data);

    await this.fsLogic.init();
    const result = await this.fsLogic.createDir();
    console.log("New dir", result);
  }

  async onFileData(data) {
    switch (data?.status) {
      case "done":
        this.fsLogic.closeWriter(data.uid);

        await this.fsLogic.downloadLocalFile(data.uid);

        break;

      default:
        let writer = this.fsLogic.getWriter(data.uid);
        if (!writer)
          writer = await this.fsLogic.createWriter(
            data.uid,
            data.fileName,
            data.length
          );

        await this.fsLogic.appendChunk(data.uid, data.chunk.data);
        const info = this.fsLogic.getWriterData(data.uid);

        fileDataStore.update((store) => {
          return info;
        });
    }
  }
}
export default WSLogic;
