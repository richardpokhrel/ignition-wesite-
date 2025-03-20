import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { NavigationProvider } from "@/components/NavigationContext";


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <NavigationProvider>
          <Navigation>{children}</Navigation>
        </NavigationProvider>
        

      </body>
    </html>
  );
}
