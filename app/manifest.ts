import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
 return {name:"SpVgg Middelich-Resse",short_name:"HUJA App",description:"Die mobile Vereins-App der SpVgg Middelich-Resse.",start_url:"/",display:"standalone",background_color:"#050505",theme_color:"#c1121f",orientation:"portrait",icons:[{src:"/icons/icon-192.png",sizes:"192x192",type:"image/png"},{src:"/icons/icon-512.png",sizes:"512x512",type:"image/png"}]};
}
