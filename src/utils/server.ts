export const transformIfDropboxUrl = (url: string) => {
  // Ensure that if the URL contains "dropbox.com" and modifies "dl=1" or "dl=0".
  // we replace with "raw=1" which allows direct rendering in the browser.
  const dropboxRegex = /(dropbox\.com\/[^?]+)(\?.*?)([?&]dl=[01])/;
  return url.replace(dropboxRegex, "$1$2&raw=1").replace(/[?&]dl=[01]/, "");
};
