// Affiché instantanément pendant le chargement d'une page du back-office.
export default function AdminLoading() {
  return (
    <div className="skeleton-page" aria-busy="true" aria-label="Chargement">
      <div className="page-title">
        <div>
          <div className="sk" style={{ width: 220, height: 26 }} />
          <div className="sk" style={{ width: 320, height: 14, marginTop: 10 }} />
        </div>
        <div className="sk" style={{ width: 150, height: 38, borderRadius: 9 }} />
      </div>
      <div className="kpis">
        {[0, 1, 2, 3].map((i) => (
          <div className="card kpi" key={i}>
            <div className="sk" style={{ width: '50%', height: 12 }} />
            <div className="sk" style={{ width: '70%', height: 24, marginTop: 12 }} />
          </div>
        ))}
      </div>
      <div className="card">
        <div className="card-head"><div className="sk" style={{ width: 180, height: 16 }} /></div>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid var(--a-border)' }}>
            <div className="sk" style={{ width: 44, height: 44, borderRadius: 8 }} />
            <div style={{ flex: 1 }}>
              <div className="sk" style={{ width: `${55 - i * 4}%`, height: 14 }} />
              <div className="sk" style={{ width: '30%', height: 11, marginTop: 8 }} />
            </div>
            <div className="sk" style={{ width: 110, height: 34, borderRadius: 9 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
