export default function Card({ children, className = "" }) {
  return (
    <div className={`card card-hover bg-base-100 shadow-xl ${className}`}>
      <div className="card-body">
        {children}
      </div>
    </div>
  );
}