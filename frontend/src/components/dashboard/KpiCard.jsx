export default function KpiCard({ icon, label, value, trend, trendUp, color }) {
    return (
        <div className="kpi-card">
            <div className="kpi-card__icon" style={{ background: `${color}15`, color }}>{icon}</div>
            <div className="kpi-card__body">
                <span className="kpi-card__value">{value}</span>
                <span className="kpi-card__label">{label}</span>
            </div>
            {trend && (
                <span className={`kpi-card__trend ${trendUp ? 'up' : 'down'}`}>
                    {trendUp ? '↑' : '↓'} {trend}
                </span>
            )}
        </div>
    );
}
