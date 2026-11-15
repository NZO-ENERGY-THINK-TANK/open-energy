import { createRootRoute, HeadContent, Link, Outlet } from '@tanstack/react-router'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import ClientProvider from '@/legacy/components/ClientProvider'
import { ConfigProvider } from 'antd'
import { Toaster } from '@/legacy/components/ui/toaster'
import { Toaster as Sonner } from '@/legacy/components/ui/sonner'

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
  head: () => ({ meta: [{ title: 'פלטפורמת נתוני אנרגיה פתוחה - NZO' }] }),
})

function RootLayout() {
  return (
    <ClientProvider>
      <ConfigProvider direction="rtl" theme={{ token: { fontFamily: 'Heebo, Arial, sans-serif' } }}>
      <HeadContent />
      <a href="#main-content" className="skip-link">דילוג לתוכן הראשי</a>
      <Header />
      <main id="main-content" tabIndex={-1} className="relative isolate flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toaster />
      <Sonner />
      </ConfigProvider>
    </ClientProvider>
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
