import Image from "next/image";
import vereinsLogo from "@/app/logo.png";

export default function HomeAtmosphere() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#050505_0%,#100306_16%,#050505_34%,#0b0204_52%,#050505_72%,#100306_88%,#050505_100%)]" />

      <div className="absolute -left-36 top-[5%] h-[28rem] w-[28rem] rounded-full bg-club-red/[0.13] blur-[110px]" />
      <div className="absolute -right-40 top-[31%] h-[32rem] w-[32rem] rounded-full bg-club-burgundy/25 blur-[125px]" />
      <div className="absolute -left-44 top-[59%] h-[34rem] w-[34rem] rounded-full bg-club-dark-red/[0.16] blur-[130px]" />
      <div className="absolute -right-40 bottom-[3%] h-[30rem] w-[30rem] rounded-full bg-club-red/[0.11] blur-[120px]" />

      <div className="huja-home-grid absolute inset-0 opacity-35" />
      <div className="huja-home-stripes absolute inset-0 opacity-50" />

      <div className="absolute left-1/2 top-[18%] w-[25rem] max-w-[88vw] -translate-x-1/2 opacity-[0.025] sm:w-[32rem]">
        <Image src={vereinsLogo} alt="" className="h-auto w-full grayscale" />
      </div>
      <div className="absolute left-1/2 top-[61%] w-[29rem] max-w-[96vw] -translate-x-1/2 rotate-[-8deg] opacity-[0.018] sm:w-[36rem]">
        <Image src={vereinsLogo} alt="" className="h-auto w-full grayscale" />
      </div>

      <div className="absolute inset-x-0 top-[39%] h-px bg-gradient-to-r from-transparent via-club-light-red/15 to-transparent" />
      <div className="absolute inset-x-0 top-[78%] h-px bg-gradient-to-r from-transparent via-club-light-red/10 to-transparent" />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_28%,rgba(0,0,0,0.58)_100%)]" />
    </div>
  );
}
