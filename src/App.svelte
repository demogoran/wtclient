<script lang="ts">
  import axios from "axios";
  import { downloadFile } from "./utils/download";

  const currentDomain = "http://localhost:3000";

  let fileList = [];
  let currentVideoSrc = "";

  (async () => {
    fileList = await fetch(`${currentDomain}/files`).then((x) => x.json());
    console.log(fileList);
  })();

  const fileDL = async (file) => {
    const response = await axios({
      url: `${currentDomain}/file/${file.uid}`,
      method: "GET",
      responseType: "arraybuffer",
      onDownloadProgress: (progress) => console.log(progress),
    });
    downloadFile(response, file.fileName);
  };

  const fileWatch = async (file) => {
    return (currentVideoSrc = `${currentDomain}/file/${file.uid}`);
    const mediaSource = new MediaSource();
    currentVideoSrc = window.URL.createObjectURL(mediaSource);

    mediaSource.addEventListener("sourceopen", async () => {
      const response = await fetch(`${currentDomain}/file`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ torrId: fileList?.magnetURI, fileId: fileName }),
      });
      const mimeCodec = response.headers.get("Content-Type");
      console.log(mimeCodec);
      const sourceBuffer = mediaSource.addSourceBuffer(mimeCodec);

      const body = response.body;

      const reader = body.getReader();

      let streamNotDone = true;

      while (streamNotDone) {
        const { value, done } = await reader.read();

        if (done) {
          streamNotDone = false;
          break;
        }

        await new Promise((resolve) => {
          sourceBuffer.appendBuffer(value);

          sourceBuffer.onupdateend = () => {
            resolve(true);
          };
        });
      }
    });
  };
</script>

<main>
  <div id="output" />
</main>

<ul>
  <video src={currentVideoSrc} autoplay={true} controls />
  {#each fileList as file}
    <li>
      <div on:keypress={() => fileDL(file)} on:click={() => fileDL(file)}>
        {file.fileName}
      </div>
      <div on:click={() => fileWatch(file)}>Watch</div>
    </li>
  {/each}
</ul>

<style>
</style>
