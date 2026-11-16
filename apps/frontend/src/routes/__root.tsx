import { createRootRoute } from "@tanstack/react-router";
import { NotFound } from "@/components/NotFound";
import { RootLayout } from "@/routes/(layout)/-RootLayout";

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
  head: () => ({
    meta: [
      { title: "פלטפורמת נתוני אנרגיה פתוחה - NZO" },
      {
        name: "description",
        content: "פלטפורמה ציבורית לחקר וניתוח נתוני אנרגיה ופליטות בישראל",
      },
      {
        name: "keywords",
        content: "אנרגיה, פליטות, CO2, אנרגיה מתחדשת, ישראל, נתונים",
      },
    ],
  }),
});
