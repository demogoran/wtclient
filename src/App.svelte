<script lang="ts">
  import axios from "axios";
  import { onMount } from "svelte";
  import ProgressBar from "@okrad/svelte-progressbar";
  import { downloadFile } from "./utils/download";
  import WSLogic from "./utils/ws-logic";
  import { fileDataStore, fileListStore } from "./utils/stores";

  const { protocol, hostname } = window.location;
  const currentDomain = `${protocol}://${hostname}:3000`;
  const currentWS = `ws://${hostname}:8080`;
  let magnet =
    "magnet:?xt=urn:btih:9733EC8340BA9F30A6118B8852AB48C55F8B955E&tr=http%3A%2F%2Fbt.t-ru.org%2Fann%3Fmagnet&dn=(Classic%20Rock%2C%20Hard%20Rock)%20Queen%20-%20The%20Miracle%20%5BCollector%27s%20Edition%5D%20(2022)%2C%20MP3%2C%20320%20kbps";

  let fileList = [];
  let currentVideoSrc = "";
  let series = 0;
  let valueLabel = "0/0";
  const wsLogic = new WSLogic(currentWS);

  onMount(async () => {
    //fileList = await fetch(`${currentDomain}/files`).then((x) => x.json());
    //console.log(fileList);

    await wsLogic.init();

    wsLogic.send("getFileList", { magnetURI: magnet });
  });

  const formatBytes = (bytes, decimals = 2) => {
    if (!+bytes) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  fileListStore.subscribe((value) => {
    fileList = value;
  });

  fileDataStore.subscribe(({ downloaded, length, fileName }) => {
    console.log({ downloaded, length, fileName });
    valueLabel = `${formatBytes(downloaded)}/${formatBytes(length)}`;
  });

  const fileDL = async (file) => {
    series = 0;

    wsLogic.send("getFileData", { id: file.uid });
    if (1 === 1) return;

    const r = await axios({
      url: `${currentDomain}/file/${file.uid}`,
      method: "GET",
      responseType: "arraybuffer",
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      onDownloadProgress: (progress) => {
        series = progress.progress * 100;
        valueLabel = `${formatBytes(progress.loaded)}/${formatBytes(
          progress.total
        )}`;
        console.log(progress);
      },
    });
    console.log("r", r);

    if (1 === 1) return;
    const response = await axios({
      url: `${currentDomain}/file/${file.uid}`,
      method: "GET",
      responseType: "stream",
      onDownloadProgress: (progress) => {
        series = progress.progress * 100;
        valueLabel = `${formatBytes(progress.loaded)}/${formatBytes(
          progress.total
        )}`;
        console.log(progress);
      },
    });
    downloadFile(response, file.fileName);
  };

  const fileWatch = async (file) => {
    currentVideoSrc = `${currentDomain}/file/${file.uid}`;
  };
</script>

<main>
  <ProgressBar {series} {valueLabel} />
  <div id="output" />
</main>

<ul>
  <video src={currentVideoSrc} autoplay={true} controls />
  <input type="text" value={magnet} />
  <button on:click={() => wsLogic.send("getFileList", { magnetURI: magnet })}
    >Get files</button
  >
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
