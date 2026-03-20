import { ThemeToggle } from "../theme-toggle";
import { ThemeProvider } from "@/lib/theme-provider";

export default function ThemeToggleExample() {
  return (
    <ThemeProvider>
      <div className="p-6 flex items-center gap-4">
        <ThemeToggle />
        <p className="text-sm text-muted-foreground">Toggle between light and dark mode</p>
      </div>
    </ThemeProvider>
  );
}
