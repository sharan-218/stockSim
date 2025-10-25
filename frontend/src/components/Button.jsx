export default function Button({
  children,
  onClick,
 
  variant = "solid",
  className = "",
  type = "button",
  ...props
}) {
  
  let baseClasses = "btn-modern"; 
  if (variant === "outline") {
    baseClasses = "btn-modern-outline"; 
  } else if (variant === "ghost") {
    
    baseClasses = "btn-modern-ghost";
  } 
  return (
    <button
      type={type}
      onClick={onClick}
      className={`
        ${baseClasses} 
         'btn-${variant}' 
        ${className} 
      `}
      {...props}
    >
      {children}
    </button>
  );
}