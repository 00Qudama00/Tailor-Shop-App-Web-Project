export default function Empty({ icon: Icon, title, text, children }) {
  return (
    <div className="empty">
      {Icon && (
        <div className="empty-icon">
          <Icon size={26} />
        </div>
      )}
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {children}
    </div>
  );
}
