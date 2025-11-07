export default function Button({ children, onClick, title, className = "" }) {
  return (
    <button onClick={onClick} title={title} className={`btn ${className}`}>
      {children}
    </button>
  );
}

