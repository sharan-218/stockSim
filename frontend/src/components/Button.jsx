// Button.jsx

export default function Button({
  children,
  onClick,
  // Redefining variants to align with your custom classes
  variant = "solid", // Maps to btn-modern (default)
  className = "",
  type = "button",
  ...props
}) {
  
  let baseClasses = "btn-modern"; // Your default solid white button

  // Logic to apply the custom variant classes
  if (variant === "outline") {
    // Overrides the default solid style
    baseClasses = "btn-modern-outline"; 
  } else if (variant === "ghost") {
    // Overrides the default solid style
    baseClasses = "btn-modern-ghost";
  } 
  // NOTE: If variant is "solid" or anything else, it remains "btn-modern"

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