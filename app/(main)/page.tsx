import Pricing from "@/components/main/pricing";
import Hero from "@/components/main/hero-home";
import Benefits from "@/components/main/benefits";
import Steps from "@/components/main/steps";
import Solutions from "@/components/main/solutions";
import Features from "@/components/main/features";
import Marques from "@/components/main/marques";
import Comparison from "@/components/main/comparison";
import { Modal } from "@/components/utils";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Solutions />
      <Marques />
      <Steps />
      <Benefits />
      <Features />
      <Comparison />
      <Pricing />

     {/* <Modal visible={true} >Hello world!</Modal>; */}
    </>
  );
}