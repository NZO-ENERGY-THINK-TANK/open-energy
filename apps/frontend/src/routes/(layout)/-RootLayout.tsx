import { HeadContent, Outlet } from "@tanstack/react-router";
import Header from "@/routes/(layout)/-Header";
import Footer from "@/routes/(layout)/-Footer";
import { ConfigProvider } from "antd";
import ClientProvider from "@/components/provider/ClientProvider";

export function RootLayout() {
  return (
    <ClientProvider>
      <ConfigProvider
        direction="rtl"
        theme={{ token: { fontFamily: "Heebo, Arial, sans-serif" } }}
      >
        <HeadContent />
        <Header />
          <Outlet />
        <Footer />
      </ConfigProvider>
    </ClientProvider>
  );
}
