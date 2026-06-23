import "./ModulePlaceholder.css";

type ModulePlaceholderProps = {
  moduleName: string;
  title: string;
  description: string;
};

export default function ModulePlaceholder({
  moduleName,
  title,
  description,
}: ModulePlaceholderProps) {
  return (
    <section className="module-page">
      <header className="module-page__header">
        <div>
          <p className="module-page__eyebrow">{moduleName}</p>
          <h1 className="module-page__title">{title}</h1>
          <p className="module-page__description">{description}</p>
        </div>
      </header>

      <div className="module-page__grid">
        <article className="module-page__panel">
          <h2 className="module-page__panel-title">Indicador principal</h2>
          <span className="module-page__metric">100</span>
          <span className="module-page__metric-label">registros</span>
        </article>

        <article className="module-page__panel">
          <h2 className="module-page__panel-title">Pendencias</h2>
          <span className="module-page__metric">12</span>
          <span className="module-page__metric-label">itens</span>
        </article>

        <article className="module-page__panel">
          <h2 className="module-page__panel-title">Alertas</h2>
          <span className="module-page__metric">4</span>
          <span className="module-page__metric-label">avisos</span>
        </article>
      </div>
    </section>
  );
}
