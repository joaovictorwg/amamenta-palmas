import i18next from "i18next";
import Backend from "i18next-fs-backend";
import middleware from "i18next-http-middleware";
import path from "path";

// __dirname = src/shared/i18n
const localesPath = path.join(__dirname, "../../../locales/{{lng}}/translation.json");

i18next
    .use(Backend)
    .use(middleware.LanguageDetector)
    .init({
        fallbackLng: "pt",
        preload: ["pt", "en"],
        backend: {
            loadPath: localesPath,
        },
        detection: {
            order: ["header"],
            caches: false,
        },
        debug: false,
    });

export default i18next;
export { middleware as i18nextMiddleware };
