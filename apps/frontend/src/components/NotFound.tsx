import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

export function NotFound() {
  return (
    <section className="container mx-auto px-5 py-24 text-center">
      <p className="mb-3 text-lg font-bold text-primary">404</p>
      <h1 className="mb-4 text-4xl font-extrabold">העמוד לא נמצא</h1>
      <p className="mb-8 text-muted-foreground">הכתובת אינה קיימת. אפשר לחזור לעמוד הבית ולהמשיך משם.</p>
      <Button asChild><Link to="/">חזרה לעמוד הבית</Link></Button>
    </section>
  )
}
