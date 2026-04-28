import { ReactNode } from "react";

interface PageSectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  background?: "white" | "light" | "blue" | "dark";
}

export default function PageSection({
  children,
  className = "",
  id,
  background = "white",
}: PageSectionProps) {
  const backgrounds = {
    white: "bg-white",
    light: "bg-[#F5F7FA]",
    blue: "bg-[#2E3192]",
    dark: "bg-[#231F20]",
  };

  return (
    <section id={id} className={`${backgrounds[background]} ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}
