/**
 * MV3 service worker.
 *
 * All of the extension's work happens in the popup, so there is no background
 * logic to run. This file exists because manifest.json declares a service
 * worker, and it doubles as the webpack entry point that copies the static
 * assets (manifest, popup, icons) into dist/.
 */
