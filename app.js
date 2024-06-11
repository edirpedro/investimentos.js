import { App } from "/functions/index.js";

luxon.Settings.defaultLocale = "pt-BR";

document.addEventListener("DOMContentLoaded", () => App.run());
