import { createRootRoute, HeadContent, Link, Outlet } from '@tanstack/react-router'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
})

function RootLayout() {
  return (
    <>
      <HeadContent />
      <a href="#main-content" className="skip-link">דילוג לתוכן הראשי</a>
      <Header />
      <main id="main-content" tabIndex={-1} className="relative isolate flex-1">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

function NotFound() {
  return (
    <section className="container mx-auto px-5 py-24 text-center">
      <p className="mb-3 text-lg font-bold text-primary">404</p>
      <h1 className="mb-4 text-4xl font-extrabold">העמוד לא נמצא</h1>
      <p className="mb-8 text-muted-foreground">הכתובת אינה קיימת. אפשר לחזור לעמוד הבית ולהמשיך משם.</p>
      <Button asChild><Link to="/">חזרה לעמוד הבית</Link></Button>
    </section>
  )
}
