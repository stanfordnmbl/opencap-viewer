import { apiSuccess, apiError } from './ErrorMessage.js'

async function copyProfileUrlToClipboard(userId) {
    const url = window.location.origin + "/profile/" + userId;
    try {
      await navigator.clipboard.writeText(url);
      apiSuccess("Profile URL copied to clipboard!", "success");
    } catch (err) {
      apiError("Error while copying profile URL to clipboard", "error");
    }
}

export {copyProfileUrlToClipboard}