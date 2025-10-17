import Image from "next/image";;
import Video from "next-video";
import getStarted from "/public/media/videos/get-started.mp4";

export default function Hero() {
  return (
    <section className="w-full bg-gray pt-2.5">
      <div className="page_container md:max-w-full md:pl-4 md:pr-4">
        <div className="relative flex flex-col items-center  py-15 md:py-18 lg:py-20  rounded-[0.75rem] lg:rounded-[0.875rem] bg-[image:linear-gradient(250deg,#E78D5C_1.2%,#2F8488_43.67%,#000_96.25%),linear-gradient(107deg,#672706_-2.13%,#024044_46.9%,#3A1E10_94.01%)]">
          {/* Background */}
          <div className="size-full absolute inset-0 z-0 rounded-[inherit] overflow-hidden">
            <Image
              src="/media/images/background-grid-dark.svg"
              alt="Hero Background"
              fill
              className="object-cover"
            />
          </div>

          {/* Content */}
          <div className="inner_container relative z-10 flex flex-col items-center px-page-offset-horizontal">
            <div className="w-full md:max-w-[calc(600rem/16)] lg:max-w-[calc(1056rem/16)]">
            <h2 className="text-xl md:text-3xl lg:text-5xl text-center font-semibold text-white mb-5 lg:mb-6">
              About <span className="text-highlight">Koajo</span>
            </h2>
              <div className="text-sm md:text-base lg:text-md md:text-center text-gray-200 mb-6 md:mb-8 lg:mb-10 max-w-[calc(978rem/16)] mx-auto">
                <p>
                  Koajo is revolutionizing the way people can save and build
                  wealth. By modernizing the traditional rotating savings model,
                  we provide a secure, automated, and transparent platform that
                  empowers individuals to achieve financial stability and
                  long-term growth.
                </p>
                <br />
                <p>
                  Credit and loans do not always work for your best interest,
                  and moving funds to your savings account is not always
                  sustainable, that&apos;s why many Americans have substantial
                  debts and inexistent savings, but we want to solve that
                  problem.
                </p>
              </div>

              <div className="w-full rounded-[0.625rem] overflow-hidden">
                <Video
                  src={getStarted}
                  className="w-full h-auto  rounded-[inherit]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
