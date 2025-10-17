import Hero from "@/components/shared/hero";
import FaqListings from "@/components/main/faq-listings";

export default function FaqPage() {
  return (
    <>
      <Hero
        title="Frequently Asked <sapn class='text-highlight'>Questions</sapn>"
        description="Answers to all your questions regarding our platform, how it serves you and ensures integrity for all users."
      />
      <FaqListings />
    </>
  );
}
