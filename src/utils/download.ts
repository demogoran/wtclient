const downloadLink = (url, filename) => {
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename); //or any other extension
  document.body.appendChild(link);
  link.click();
};

const downloadFile = (response, filename) => {
  const url = window.URL.createObjectURL(new Blob([response.request.response]));
  downloadLink(url, filename);
};

export { downloadFile, downloadLink };
