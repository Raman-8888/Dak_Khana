export default function QuickAction({ icon, label, onClick, color }) {
    return (
        <button className="quick-action" onClick={onClick} style={{ '--qa-color': color }}>
            <span className="quick-action__icon">{icon}</span>
            <span className="quick-action__label">{label}</span>
        </button>
    );
}
