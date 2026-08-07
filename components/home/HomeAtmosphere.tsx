import Image from "next/image";

export default function HomeAtmosphere() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#050505_0%,#100306_16%,#050505_34%,#0b0204_52%,#050505_72%,#100306_88%,#050505_100%)]" />

      <div className="huja-home-floodlight huja-home-floodlight-left" />
      <div className="huja-home-floodlight huja-home-floodlight-right" />

      <div className="absolute -left-36 top-[5%] h-[28rem] w-[28rem] rounded-full bg-club-red/[0.13] blur-[110px]" />
      <div className="absolute -right-40 top-[31%] h-[32rem] w-[32rem] rounded-full bg-club-burgundy/25 blur-[125px]" />
      <div className="absolute -left-44 top-[59%] h-[34rem] w-[34rem] rounded-full bg-club-dark-red/[0.16] blur-[130px]" />
      <div className="absolute -right-40 bottom-[3%] h-[30rem] w-[30rem] rounded-full bg-club-red/[0.11] blur-[120px]" />

      <div className="huja-home-grid absolute inset-0 opacity-35" />
      <div className="huja-home-stripes absolute inset-0 opacity-50" />

      <div className="huja-home-smoke huja-home-smoke-a" />
      <div className="huja-home-smoke huja-home-smoke-b" />
      <div className="huja-home-smoke huja-home-smoke-c" />
      <div className="huja-home-smoke huja-home-smoke-d" />

      <div className="huja-home-crest absolute left-1/2 top-[14%] w-[28rem] max-w-[96vw] -translate-x-1/2 opacity-[0.055] sm:w-[36rem]">
        <Image
          src="/branding/middelich-resse-original.png"
          alt=""
          width={1194}
          height={1166}
          className="h-auto w-full"
          priority={false}
        />
      </div>
      <div className="huja-home-crest huja-home-crest-secondary absolute left-1/2 top-[58%] w-[31rem] max-w-[104vw] -translate-x-1/2 rotate-[-7deg] opacity-[0.032] sm:w-[40rem]">
        <Image
          src="/branding/middelich-resse-original.png"
          alt=""
          width={1194}
          height={1166}
          className="h-auto w-full"
          priority={false}
        />
      </div>

      <div className="huja-home-embers absolute inset-0" />

      <div className="absolute inset-x-0 top-[39%] h-px bg-gradient-to-r from-transparent via-club-light-red/15 to-transparent" />
      <div className="absolute inset-x-0 top-[78%] h-px bg-gradient-to-r from-transparent via-club-light-red/10 to-transparent" />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_24%,rgba(0,0,0,0.64)_100%)]" />
    </div>
  );
}
