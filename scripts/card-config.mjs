export const VERSION_NAME = process.env.HYPNOOS_VERSION_NAME || "v2.4";
export const CARD_BASENAME = process.env.HYPNOOS_CARD_BASENAME || `催眠app二改MVU ${VERSION_NAME}.png`;
export const CARD_PATH = process.env.HYPNOOS_CARD_PATH || `public/cards/${CARD_BASENAME}`;
export const DIST_REPO = "LainXu/HypnosisAPP5-dist";
export const DIST_REPO_URL = `https://github.com/${DIST_REPO}.git`;
export const DIST_WEBVIEW_DIR = "dist/webview";
export const DIST_PHONE_DIR = "dist/phone";

export function remoteFrontendUrl(commit) {
  return `https://cdn.jsdelivr.net/gh/${DIST_REPO}@${commit}/dist/webview/st-load-inline.html`;
}

export function remotePhoneFrontendUrl(commit) {
  return `https://cdn.jsdelivr.net/gh/${DIST_REPO}@${commit}/dist/phone/st-load-inline.html`;
}

export function remoteIdentityFrontendUrl(commit) {
  return `https://cdn.jsdelivr.net/gh/${DIST_REPO}@${commit}/dist/webview/identity.html`;
}

export function remoteAssetBase(commit) {
  return `https://cdn.jsdelivr.net/gh/${DIST_REPO}@${commit}/dist/webview/assets/`;
}
