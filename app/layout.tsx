import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import PWARegister from "../components/PWARegister";
import AppExperience from "../components/AppExperience";
import "./globals.css";
const geistSans=Geist({variable:"--font-geist-sans",subsets:["latin"]});
const geistMono=Geist_Mono({variable:"--font-geist-mono",subsets:["latin"]});
export const metadata:Metadata={title:{default:"SpVgg Middelich-Resse",template:"%s | SpVgg Middelich-Resse"},description:"HUJA – die mobile Vereins-App der SpVgg Middelich-Resse.",applicationName:"HUJA App",appleWebApp:{capable:true,statusBarStyle:"black-translucent",title:"HUJA App"},icons:{apple:"/icons/icon-192.png"}};
export const viewport:Viewport={themeColor:"#c1121f",width:"device-width",initialScale:1,viewportFit:"cover"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="de" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}><body className="min-h-full flex flex-col"><PWARegister/><AppExperience>{children}</AppExperience></body></html>}
