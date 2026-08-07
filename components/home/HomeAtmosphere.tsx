import Image from "next/image";

function FloodlightBank({ side }: { side: "left" | "right" }) {
  return (
    <div className={`huja-stadium-light-bank huja-stadium-light-bank-${side}`}>
      <div className="huja-stadium-light-head">
        {Array.from({ length: 12 }).map((_, index) => (
          <span key={index} className="huja-stadium-light-bulb" />
        ))}
      </div>
      <div className="huja-stadium-light-mast" />
    </div>
  );
}

export default function HomeAtmosphere() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#020202_0%,#140205_12%,#050102_27%,#0d0104_43%,#030303_62%,#120205_79%,#020202_100%)]" />

      <div className="huja-stadium-top-glow absolute inset-x-0 top-0 h-[38rem]" />
      <FloodlightBank side="left" />
      <FloodlightBank side="right" />

      <div className="huja-home-floodlight huja-home-floodlight-left" />
      <div className="huja-home-floodlight huja-home-floodlight-right" />

      <div className="absolute -left-40 top-[3%] h-[30rem] w-[30rem] rounded-full bg-club-red/[0.18] blur-[105px]" />
      <div className="absolute -right-44 top-[22%] h-[34rem] w-[34rem] rounded-full bg-club-burgundy/35 blur-[120px]" />
      <div className="absolute -left-48 top-[47%] h-[38rem] w-[38rem] rounded-full bg-club-dark-red/[0.22] blur-[125px]" />
      <div className="absolute -right-44 top-[68%] h-[34rem] w-[34rem] rounded-full bg-club-red/[0.16] blur-[118px]" />
      <div className="absolute -left-44 bottom-[1%] h-[30rem] w-[30rem] rounded-full bg-club-burgundy/25 blur-[120px]" />

      <div className="huja-home-grid absolute inset-0 opacity-25" />
      <div className="huja-home-stripes absolute inset-0 opacity-55" />
      <div className="huja-stadium-stands absolute inset-x-0 top-[7rem] h-[24rem] opacity-70" />

      <div className="huja-home-smoke huja-home-smoke-a" />
      <div className="huja-home-smoke huja-home-smoke-b" />
      <div className="huja-home-smoke huja-home-smoke-c" />
      <div className="huja-home-smoke huja-home-smoke-d" />
      <div className="huja-home-smoke huja-home-smoke-e" />

      <div className="huja-home-crest absolute left-1/2 top-[4%] w-[31rem] max-w-[112vw] -translate-x-1/2 opacity-[0.11] sm:w-[40rem]">
        <Image
          src="/branding/middelich-resse-original.png"
          alt=""
          width={1194}
          height={1166}
          className="h-auto w-full"
          priority={false}
        />
      </div>
      <div className="huja-home-crest huja-home-crest-secondary absolute left-1/2 top-[43%] w-[34rem] max-w-[116vw] -translate-x-1/2 rotate-[-5deg] opacity-[0.055] sm:w-[42rem]">
        <Image
          src="/branding/middelich-resse-original.png"
          alt=""
          width={1194}
          height={1166}
          className="h-auto w-full"
          priority={false}
        />
      </div>
      <div className="huja-home-crest huja-home-crest-tertiary absolute left-1/2 top-[78%] w-[30rem] max-w-[108vw] -translate-x-1/2 rotate-[6deg] opacity-[0.04] sm:w-[38rem]">
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
      <div className="huja-stadium-sparks absolute inset-0" />

      <div className="absolute inset-x-0 top-[19%] h-px bg-gradient-to-r from-transparent via-club-light-red/25 to-transparent" />
      <div className="absolute inset-x-0 top-[48%] h-px bg-gradient-to-r from-transparent via-club-light-red/16 to-transparent" />
      <div className="absolute inset-x-0 top-[76%] h-px bg-gradient-to-r from-transparent via-club-light-red/12 to-transparent" />

      <div className="huja-stadium-vignette absolute inset-0" />
    </div>
  );
}
