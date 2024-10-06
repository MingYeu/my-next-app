import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Ubuntu } from "next/font/google";
import { useTranslation, appWithTranslation } from "next-i18next";

const ubuntu = Ubuntu({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-ubuntu",
});

function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default appWithTranslation(App);
