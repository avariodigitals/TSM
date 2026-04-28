import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "red" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", fullWidth = false, className = "", children, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary:
        "bg-[#00AEEF] hover:bg-[#0099D6] text-white focus:ring-[#00AEEF] shadow-sm hover:shadow-md",
      secondary:
        "bg-[#2E3192] hover:bg-[#252880] text-white focus:ring-[#2E3192] shadow-sm hover:shadow-md",
      outline:
        "border-2 border-[#00AEEF] text-[#00AEEF] hover:bg-[#00AEEF] hover:text-white focus:ring-[#00AEEF]",
      red:
        "bg-[#ED1C24] hover:bg-[#d11920] text-white focus:ring-[#ED1C24] shadow-sm hover:shadow-md",
      ghost:
        "text-[#231F20] hover:bg-gray-100 focus:ring-gray-300",
    };

    const sizes = {
      sm: "px-4 py-2 text-sm gap-1.5",
      md: "px-6 py-3 text-base gap-2",
      lg: "px-8 py-4 text-lg gap-2.5",
    };

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
