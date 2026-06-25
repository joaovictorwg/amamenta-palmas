import { useTranslation } from "react-i18next";

import "./ModulePlaceholder.css";

type ModulePlaceholderProps = {
  moduleNameKey: string;
  titleKey: string;
  descriptionKey: string;
};

export default function ModulePlaceholder({
  moduleNameKey,
  titleKey,
  descriptionKey,
}: ModulePlaceholderProps) {
  const { t } = useTranslation();

  return (
    <section className="module-page">
      <header className="module-page__header">
        <div>
          <p className="module-page__eyebrow">{t(moduleNameKey)}</p>
          <h1 className="module-page__title">{t(titleKey)}</h1>
          <p className="module-page__description">{t(descriptionKey)}</p>
        </div>
      </header>

      <div className="module-page__grid">
        <article className="module-page__panel">
          <h2 className="module-page__panel-title">{t("modulePlaceholder.mainMetric")}</h2>
          <span className="module-page__metric">100</span>
          <span className="module-page__metric-label">{t("modulePlaceholder.records")}</span>
        </article>

        <article className="module-page__panel">
          <h2 className="module-page__panel-title">{t("modulePlaceholder.pendingItems")}</h2>
          <span className="module-page__metric">12</span>
          <span className="module-page__metric-label">{t("modulePlaceholder.items")}</span>
        </article>

        <article className="module-page__panel">
          <h2 className="module-page__panel-title">{t("navigation.alerts")}</h2>
          <span className="module-page__metric">4</span>
          <span className="module-page__metric-label">{t("modulePlaceholder.notices")}</span>
        </article>
      </div>
    </section>
  );
}
