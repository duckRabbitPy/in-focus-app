export const transformIfDropboxUrl = (url: string) => {
  // replace with "raw=1" which allows direct rendering in the browser.
  if (url.includes("dropbox.com")) {
    if (url.includes("dl=1")) return url.replace("dl=1", "raw=1");
    if (url.includes("dl=0")) return url.replace("dl=0", "raw=1");
    return url;
  }

  return url;
};
