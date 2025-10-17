import Link from "next/link";
import { MyImage } from "../utils";

export default function Value() {
  return (
    <section className="w-full bg-gray py-15 md:py-10 lg:py-20">
      <div className="page_container">
        <div className="inner_container bg-white rounded-[0.625rem]  py-7.5 md:py-10 lg:py-20 lg:pr-0">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-gray-900 mb-7.5">
            Our Commitment to Security and Compliance
          </h2>
          <div className="flex gap-7 justify-between">
            <div className="flex flex-col gap-5 text-sm md:text-base lg:text-lg text-gray-900 w-full max-w-[calc(647rem/16)]">
              <p className="lg:text-2lg bg-[image:linear-gradient(107deg,#FD8B51_-2.13%,#469DA3_49.87%,#FD8B51_94.01%))] bg-clip-text text-transparent">
                Our reputation, platform, and integrity are built on keeping
                Koajo safe from bad actors while ensuring that our pods pay out
                reliably, and unlike traditional ajo, is non-reliant on the
                integrity of others.
              </p>
              <p>
                A strong compliance program is at the core of our business
                model. Our robust system is designed using industry-standard
                practices while incorporating a modernized approach to rotating
                savings. We prioritize both sophistication and innovation
                without compromising accessibility and functionality.
              </p>
              <p>
                We take pride in setting the highest standards for user
                protection. Trust and security are at the heart of Koajo, and
                our advanced security measures ensure that your information and
                funds remain safe. If you experience any issues verifying your
                identity, please contact us at{" "}
                <Link href="mailto:support@koajo.com" className="font-semibold">
                  support@koajo.com
                </Link>
              </p>
            </div>
            <div className="hidden lg:flex items-center w-full  max-w-[calc(556rem/16)] h-[calc(600rem/16)]">
              <MyImage
                src="iphone_zf2htm"
                width={556}
                height={600}
                className="size-full object-cover"
                isCloudinary
                alt="Koajo website showing on an iphone"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
