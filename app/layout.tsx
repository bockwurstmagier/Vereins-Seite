import AppearanceProvider from "../components/design/AppearanceProvider";
import { APPEARANCE_BOOTSTRAP } from "../lib/appearance";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import PWARegister from "../components/PWARegister";
import AppExperience from "../components/AppExperience";
import "./globals.css";
import "./appearance.css";
import { HUJA_BRANDING } from "../lib/branding";
import AppAnalyticsTracker from "../components/analytics/AppAnalyticsTracker";
const geistSans=Geist({variable:"--font-geist-sans",subsets:["latin"]});
const geistMono=Geist_Mono({variable:"--font-geist-mono",subsets:["latin"]});
export const metadata:Metadata={title:{default:"SpVgg Middelich-Resse",template:"%s | SpVgg Middelich-Resse"},description:"HUJA – die mobile Vereins-App der SpVgg Middelich-Resse.",applicationName:"HUJA App",appleWebApp:{capable:true,statusBarStyle:"black-translucent",title:"HUJA App"},icons:{apple:"/icons/icon-192.png"}};
export const viewport:Viewport={themeColor:"#c1121f",width:"device-width",initialScale:1,viewportFit:"cover"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="de" suppressHydrationWarning data-theme="dark" data-background="stadium" data-effects="on" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}><head><script dangerouslySetInnerHTML={{ __html: APPEARANCE_BOOTSTRAP }} /></head><body className="min-h-full flex flex-col">
        <AppearanceProvider><PWARegister/><AppAnalyticsTracker/><AppExperience>{children}</AppExperience></AppearanceProvider></body></html>}
