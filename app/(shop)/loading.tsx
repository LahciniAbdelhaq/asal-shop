// Affiché instantanément pendant le chargement d'une page de la boutique.
export default function ShopLoading() {
  return (
    <div className="shop-loading" aria-busy="true" aria-label="Chargement">
      <div className="honey-loader">
        <span /><span /><span />
      </div>
      <p>Chargement…</p>
    </div>
  );
}
