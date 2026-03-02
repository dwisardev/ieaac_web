const StatCard = ({ icon, value, label, cardAccent, cardBg, trend, trendUp, onClick }) => (
  <div
    className="stat-card"
    style={{ '--card-accent': cardAccent, '--card-bg': cardBg, cursor: onClick ? 'pointer' : 'default' }}
    onClick={onClick}
  >
    <div className="stat-header">
      <div className="stat-icon">
        <i className={`fas ${icon}`} />
      </div>
      {trend && (
        <span className={`stat-trend ${trendUp ? 'up' : 'down'}`}>
          <i className={`fas fa-arrow-${trendUp ? 'up' : 'down'}`} /> {trend}
        </span>
      )}
    </div>
    <div className="stat-value">{value}</div>
    <div className="stat-label">{label}</div>
  </div>
);

export default StatCard;