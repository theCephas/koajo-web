import Marquee from "react-fast-marquee";

export default function Marques() {
  return (
    <section className="w-full bg-gray py-15">
      <div className="page_container flex flex-col gap-4.5 px-0">
        <Marquee
          speed={70}
          className="relative z-10 flex items-center gap-2.5 -rotate-2 h-12.5 md:h-14 lg:h-17 bg-black py-1.5 lg:py-2.5 text-xl md:text-2xl lg:text-3xl font-semibold text-white"
        >
          Ajo Esusu Tandas Kye Susu Tandas Njangi Mikado Poro Lughu Vumi
          Harambee
        </Marquee>
        <Marquee
          speed={70}
          direction="right"
          className="relative z-0 flex items-center rotate-1"
        >
          {labels.map((label) => (
            <Badge key={label} text={label} />
          ))}
        </Marquee>
      </div>
    </section>
  );
}

function Badge({ text }: { text: string }) {
  return (
    <div className="flex items-center py-2.5 md:py-3.5 lg:py-4 px-5.5 md:px-7.5 lg:px-10 text-lg md:text-xl lg:text-2xl font-medium text-gray-600 rounded-full border border-text-300 mr-1.5">
      {text}
    </div>
  );
}

const labels = [
  "Savings to Security",
  "Join a Pod",
  "Reach Your Goals",
  "Take Charge",
  "Designed for YOU",
  "For the Freedom-Builders",
  "For the Money-Movers",
  "For the the wealth creators",
  "Safety Net",
  "Financial Freedom",
];
