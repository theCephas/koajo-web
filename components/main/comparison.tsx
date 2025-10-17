"use client";

import { ResponsiveBar, BarDatum, BarItemProps } from "@nivo/bar";
import cn from "clsx";
import Image from "next/image";

const primaryColor = "#E7854D";

const data = [
  {
    company: "Traditional Company",
    value: 15,
  },
  {
    company: "Koajo",
    value: 90,
  },
];

const ComparisonSVG = () => (
  <svg
    width="71"
    height="173"
    viewBox="0 0 71 173"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      position: "absolute",
      left: "50%",
      top: 0,
      transform: "translateX(-50%)",
      pointerEvents: "none",
    }}
  >
    <g>
      <path
        opacity="0.25"
        d="M95.3635 -78.0562L-9.16101 26.4684"
        stroke="#F3F4F6"
        strokeWidth="0.387128"
        strokeLinejoin="bevel"
        strokeDasharray="1.94 1.94"
      />
      <path
        opacity="0.25"
        d="M95.3635 -71.0874L-9.16101 33.4371"
        stroke="#F3F4F6"
        strokeWidth="0.387128"
        strokeLinejoin="bevel"
        strokeDasharray="1.94 1.94"
      />
      <path
        opacity="0.25"
        d="M95.3635 -64.1196L-9.16101 40.4049"
        stroke="#F3F4F6"
        strokeWidth="0.387128"
        strokeLinejoin="bevel"
        strokeDasharray="1.94 1.94"
      />
      <path
        opacity="0.25"
        d="M95.3636 -57.1509L-9.16089 47.3737"
        stroke="#F3F4F6"
        strokeWidth="0.387128"
        strokeLinejoin="bevel"
        strokeDasharray="1.94 1.94"
      />
      <path
        opacity="0.25"
        d="M95.3635 -50.1826L-9.16101 54.3419"
        stroke="#F3F4F6"
        strokeWidth="0.387128"
        strokeLinejoin="bevel"
        strokeDasharray="1.94 1.94"
      />
      <path
        opacity="0.25"
        d="M95.3635 -43.2148L-9.16101 61.3097"
        stroke="#F3F4F6"
        strokeWidth="0.387128"
        strokeLinejoin="bevel"
        strokeDasharray="1.94 1.94"
      />
      <path
        opacity="0.25"
        d="M95.3635 -36.2461L-9.16101 68.2784"
        stroke="#F3F4F6"
        strokeWidth="0.387128"
        strokeLinejoin="bevel"
        strokeDasharray="1.94 1.94"
      />
      <path
        opacity="0.25"
        d="M95.3635 -29.2778L-9.16101 75.2467"
        stroke="#F3F4F6"
        strokeWidth="0.387128"
        strokeLinejoin="bevel"
        strokeDasharray="1.94 1.94"
      />
      <path
        opacity="0.25"
        d="M95.3636 -22.3096L-9.16089 82.215"
        stroke="#F3F4F6"
        strokeWidth="0.387128"
        strokeLinejoin="bevel"
        strokeDasharray="1.94 1.94"
      />
      <path
        opacity="0.25"
        d="M95.3635 -15.3413L-9.16101 89.1832"
        stroke="#F3F4F6"
        strokeWidth="0.387128"
        strokeLinejoin="bevel"
        strokeDasharray="1.94 1.94"
      />
      <path
        opacity="0.25"
        d="M95.3635 -8.37305L-9.16101 96.1515"
        stroke="#F3F4F6"
        strokeWidth="0.387128"
        strokeLinejoin="bevel"
        strokeDasharray="1.94 1.94"
      />
      <path
        opacity="0.25"
        d="M95.3635 -1.4043L-9.16101 103.12"
        stroke="#F3F4F6"
        strokeWidth="0.387128"
        strokeLinejoin="bevel"
        strokeDasharray="1.94 1.94"
      />
      <path
        opacity="0.25"
        d="M95.3635 5.56348L-9.16101 110.088"
        stroke="#F3F4F6"
        strokeWidth="0.387128"
        strokeLinejoin="bevel"
        strokeDasharray="1.94 1.94"
      />
      <path
        opacity="0.25"
        d="M95.3636 12.5322L-9.16089 117.057"
        stroke="#F3F4F6"
        strokeWidth="0.387128"
        strokeLinejoin="bevel"
        strokeDasharray="1.94 1.94"
      />
      <path
        opacity="0.25"
        d="M95.3635 19.5005L-9.16101 124.025"
        stroke="#F3F4F6"
        strokeWidth="0.387128"
        strokeLinejoin="bevel"
        strokeDasharray="1.94 1.94"
      />
      <path
        opacity="0.25"
        d="M95.3635 26.4683L-9.16101 130.993"
        stroke="#F3F4F6"
        strokeWidth="0.387128"
        strokeLinejoin="bevel"
        strokeDasharray="1.94 1.94"
      />
      <path
        opacity="0.25"
        d="M95.3635 33.437L-9.16101 137.962"
        stroke="#F3F4F6"
        strokeWidth="0.387128"
        strokeLinejoin="bevel"
        strokeDasharray="1.94 1.94"
      />
      <path
        opacity="0.25"
        d="M95.3635 40.4053L-9.16101 144.93"
        stroke="#F3F4F6"
        strokeWidth="0.387128"
        strokeLinejoin="bevel"
        strokeDasharray="1.94 1.94"
      />
      <path
        opacity="0.25"
        d="M95.3636 47.3735L-9.16089 151.898"
        stroke="#F3F4F6"
        strokeWidth="0.387128"
        strokeLinejoin="bevel"
        strokeDasharray="1.94 1.94"
      />
      <path
        opacity="0.25"
        d="M95.3635 54.3418L-9.16101 158.866"
        stroke="#F3F4F6"
        strokeWidth="0.387128"
        strokeLinejoin="bevel"
        strokeDasharray="1.94 1.94"
      />
      <path
        opacity="0.25"
        d="M95.3635 61.3101L-9.16101 165.835"
        stroke="#F3F4F6"
        strokeWidth="0.387128"
        strokeLinejoin="bevel"
        strokeDasharray="1.94 1.94"
      />
      <path
        opacity="0.25"
        d="M95.3636 68.2783L-9.16089 172.803"
        stroke="#F3F4F6"
        strokeWidth="0.387128"
        strokeLinejoin="bevel"
        strokeDasharray="1.94 1.94"
      />
      <path
        opacity="0.25"
        d="M95.3635 75.2466L-9.16101 179.771"
        stroke="#F3F4F6"
        strokeWidth="0.387128"
        strokeLinejoin="bevel"
        strokeDasharray="1.94 1.94"
      />
      <path
        opacity="0.25"
        d="M95.3636 82.2153L-9.16089 186.74"
        stroke="#F3F4F6"
        strokeWidth="0.387128"
        strokeLinejoin="bevel"
        strokeDasharray="1.94 1.94"
      />
      <path
        opacity="0.25"
        d="M95.3635 89.1836L-9.16101 193.708"
        stroke="#F3F4F6"
        strokeWidth="0.387128"
        strokeLinejoin="bevel"
        strokeDasharray="1.94 1.94"
      />
      <path
        opacity="0.25"
        d="M95.3635 96.1514L-9.16101 200.676"
        stroke="#F3F4F6"
        strokeWidth="0.387128"
        strokeLinejoin="bevel"
        strokeDasharray="1.94 1.94"
      />
      <path
        opacity="0.25"
        d="M95.3636 103.12L-9.16089 207.645"
        stroke="#F3F4F6"
        strokeWidth="0.387128"
        strokeLinejoin="bevel"
        strokeDasharray="1.94 1.94"
      />
      <path
        opacity="0.25"
        d="M95.3635 110.088L-9.16101 214.613"
        stroke="#F3F4F6"
        strokeWidth="0.387128"
        strokeLinejoin="bevel"
        strokeDasharray="1.94 1.94"
      />
      <path
        opacity="0.25"
        d="M95.3635 117.057L-9.16101 221.581"
        stroke="#F3F4F6"
        strokeWidth="0.387128"
        strokeLinejoin="bevel"
        strokeDasharray="1.94 1.94"
      />
      <path
        opacity="0.25"
        d="M95.3636 124.025L-9.16089 228.549"
        stroke="#F3F4F6"
        strokeWidth="0.387128"
        strokeLinejoin="bevel"
        strokeDasharray="1.94 1.94"
      />
      <path
        opacity="0.25"
        d="M95.3635 130.993L-9.16101 235.518"
        stroke="#F3F4F6"
        strokeWidth="0.387128"
        strokeLinejoin="bevel"
        strokeDasharray="1.94 1.94"
      />
      <path
        opacity="0.25"
        d="M95.3636 137.961L-9.16089 242.486"
        stroke="#F3F4F6"
        strokeWidth="0.387128"
        strokeLinejoin="bevel"
        strokeDasharray="1.94 1.94"
      />
    </g>
  </svg>
);

const tableData = [
  {
    label: "No credit check",
    koajo: true,
    "personal-loans": false,
    "credit-cards": false,
  },
  {
    label: "No hidden fees",
    koajo: true,
    "personal-loans": false,
    "credit-cards": false,
  },
  {
    label: "No late fees",
    koajo: true,
    "personal-loans": false,
    "credit-cards": false,
  },
  {
    label: "No debt",
    koajo: true,
    "personal-loans": false,
    "credit-cards": false,
  },
];

const Check = () => (
  <span aria-label="check" role="img" className="text-primary">
    ✔️
  </span>
);
const Cross = () => (
  <span aria-label="cross" role="img" className="text-gray-400">
    ✖️
  </span>
);

// Use BarItemProps from @nivo/bar for the barComponent
const ComparisonBar = (
  props: BarItemProps<{ company: string; value: number }>
) => {
  const { bar, style } = props;
  // Only customize Koajo bar
  if (bar.data.id === "Koajo") {
    return (
      <g transform={`translate(${bar.x},${bar.y})`}>
        <defs>
          <linearGradient id="koajo-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="100%" stopColor={primaryColor} />
          </linearGradient>
        </defs>
        <rect
          width={bar.width}
          height={bar.height}
          fill="url(#koajo-gradient)"
          rx={8}
        />
        <g style={{ pointerEvents: "none" }}>
          <foreignObject x={bar.width / 2 - 35} y={-10} width={71} height={173}>
            <ComparisonSVG />
          </foreignObject>
        </g>
      </g>
    );
  }
  // Default bar for others
  return (
    <rect
      x={bar.x}
      y={bar.y}
      width={bar.width}
      height={bar.height}
      fill="#B9B9B9"
      rx={8}
    />
  );
};

const Comparison = () => {
  return (
    <section className="w-full  py-15 bg-gray">
      <div className="page_container">
        {/* headings */}
        <div className="flex flex-col items-center text-center gap-5 mb-gap-6 mb-10 lg:mb-12.5">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-medium text-gray-900">
            <span className="text-highlight">Koajo</span> Vs How You used to do
            it
          </h2>
          <p className="text-sm md:text-base text-text-400">
            Unlike informal rotating savings, we are revolutionizing the way you
            experience savings
          </p>
        </div>
        <div className="flex flex-col lg:flex-row gap-5 lg:gap-7.5">
          {/* Table */}
          <div className="w-full lg:max-w-[calc(843rem/16)]">
            <table className="w-full rounded-xl lg:rounded-none overflow-hidden">
              <thead>
                <tr>
                  {Object.keys(tableData[0]).map((key: string) => (
                    <th
                      className={cn(
                        "text-text-500 text-sm md:text-base lg:text-lg font-normal px-3.5 py-5 md:py-5.5 lg:py-4 capitalize text-center vertical-align-middle",
                        key === "label"
                          ? "bg-transparent min-w-[calc(114rem/16)]"
                          : "bg-cyan-100"
                      )}
                      key={key}
                    >
                      {key !== "label" ? key.replace("-", " ") : ""}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, i) => (
                  <tr key={row.label}>
                    {Object.entries(row).map(([key, value]) => (
                      <td
                        className={cn(
                          "text-center vertical-align-middle  px-2.5 lg:px-8 py-4.5 lg:py-7.5 text-sm md:text-base lg:text-lg",
                          key === "label"
                            ? "text-white bg-teal-800"
                            : key === "credit-cards"
                            ? "text-text-500 bg-cyan-100"
                            : "text-text-500 bg-transparent"
                        )}
                        key={key}
                      >
                        {key === "label" ? (
                          value
                        ) : value === true ? (
                          <Image
                            src="/media/icons/check.svg"
                            alt="check"
                            width={18}
                            height={18}
                            className="object-contain min-w-4.5 size-4.5 lg:size-6 self-center shrink-0 justify-self-center"
                          />
                        ) : (
                          <Image
                            src="/media/icons/cross.svg"
                            alt="cross"
                            width={18}
                            height={18}
                            className="object-contain min-w-4.5 size-4.5 lg:size-6 self-center shrink-0 justify-self-center"
                          />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Disclaimer */}
            <p className="text-sm md:text-base text-text-400 p-2.5">
              The information provided is for illustrative purposes only. Koajo
              is not bank or a lender so no credit check is required to access
              our products. 
            </p>
          </div>

          {/* Chart */}
          <div className="w-full max-w-md bg-teal-800 rounded-2xl p-5 lg:px-7.5 lg:py-6.5 mt-4 lg:mt-0 flex flex-col items-center h-fit">
            <p className="text-sm md:text-base text-white mb-4 lg:mb-6">
              <span className="font-bold">Koajo</span> gives you{" "}
              <span className="font-bold">100% control</span> over your money,
              unlike traditional financial systems that set the rules for you.
              Here, your savings habits define your financial power, not a
              number.
            </p>
            <div className="w-full h-56 lg:h-[calc(246rem/16)] relative">
              <ResponsiveBar
                data={data}
                keys={["value"]}
                indexBy="company"
                enableGridX
                margin={{ top: 10, right: 20, bottom: 30, left: 30 }}
                padding={0.5}
                colors={["#B9B9B9", primaryColor]}
                enableLabel={false}
                axisLeft={{
                  tickValues: [0, 25, 50, 75, 100],
                  tickSize: 0,
                  tickPadding: 8,
                  format: (v: number) => v,
                }}
                axisBottom={{ tickSize: 0, tickPadding: 8 }}
                gridYValues={[0, 25, 50, 75, 100]}
                theme={{
                  axis: {
                    ticks: { text: { fill: "#B9B9B9", fontSize: 12 } },
                    legend: { text: { fill: "#B9B9B9", fontSize: 12 } },
                  },
                  grid: {
                    line: {
                      stroke: "#B9B9B9",
                      strokeDasharray: "2 4",
                      opacity: 0.2,
                    },
                  },
                }}
                barComponent={ComparisonBar}
                borderRadius={8}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Comparison;
