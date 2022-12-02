const downloadFile = (response, filename) => {
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename); //or any other extension
  document.body.appendChild(link);
  link.click();
};

export { downloadFile };
