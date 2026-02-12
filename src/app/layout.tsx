import "../styles/globals.css";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "Rent-A-Family",
  description: "Rent-A-Family Web3 POC",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
