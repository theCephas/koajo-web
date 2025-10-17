import { MyImage, Button } from "@/components/utils";
import ModalPerson from "@/components/main/modal-team-member";
import type { Member } from "@/components/main/modal-team-member";

export default function Team() {
  return (
    <section className="w-full bg-white py-15 md:py-20 lg:py-25">
      <div className="page_container">
        {/* Heading */}
        <div className="flex flex-col items-center  gap-5 mb-10">
          <h2 className="text-xl md:text-3xl lg:text-4xl font-semibold text-gray-900 text-center">
            Meet the <span className="text-highlight">Team</span>
          </h2>
          <p className="text-center text-base md:text-md lg:text-lg text-gray-400">
            Unlike informal rotating savings, we are revolutionizing the way you
            experience savings
          </p>
        </div>

        {/* Members */}
        <div className="w-full flex flex-col md:flex-row gap-7 lg:gap-7.5">
          {members.map((member, idx) => (
            <div key={idx} className="w-full flex flex-col">
              <div className="relative w-full h-fit max-w-[calc(340rem/16)] md:max-w-[calc(400rem/16)] lg:max-w-[calc(621rem/16)] flex mb-5 items-center justify-center  border-2 border-primary/10 rounded-xl ">
                <MyImage
                  src={member.imageId}
                  alt={member.name}
                  width={340}
                  height={335}
                  tablet={{
                    width: 400,
                    height: (400 * 610) / 621,
                  }}
                  desktop={{
                    width: 621,
                    height: 610,
                  }}
                  crop="thumb"
                  gravity="center"
                  className="size-full h-auto object-cover rounded-sm"
                  quality={100}
                  isCloudinary
                />
                <ModalPerson person={member} />
              </div>
              <h3 className="font-semibold text-lg md:text-2lg lg:text-xl mb-2.5 md:mb-1 text-gray-900">
                {member.name}
              </h3>
              <p className="text-sm md:text-base text-gray-400">
                {member.position}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const members: Member[] = [
  {
    name: "William Ikwogo",
    imageId: "william-ikwogo-headshot_yljijs",
    position: "Co-founder / Chief Executive Officer",
    bio: ["William is a visionary entrepreneur and the driving force behind Koajo, a platform revolutionizing the traditional rotating savings model through technology and automation. With a Master’s degree in Information Science specializing in Data Science, he brings deep expertise in machine learning, data wrangling, and financial technology.", "Before launching Koajo, he honorably served in the U.S. Army, where he developed strong leadership, discipline, and problem-solving skills, qualities that now shape the foundation of Koajo’s mission. His passion for financial empowerment, inspired him to modernize the age-old rotating savings system, making it more secure, efficient, and scalable.", "Under his leadership, Koajo integrates cutting-edge data-driven solutions, ensuring a seamless, transparent, and trustworthy savings experience. His unique blend of military discipline, data science expertise, and financial innovation positions Koajo as a game-changer in the world of collective savings and wealth-building."],
  },
  {
    name: "Ama Adeniyi",
    imageId: "ama-adeniyi_axq6ew",
    position: "Co-founder / Chief Executive Officer",
    bio: ["Ama is a visionary entrepreneur and the driving force behind Koajo, a platform revolutionizing the traditional rotating savings model through technology and automation. With a Master’s degree in Information Science specializing in Data Science, he brings deep expertise in machine learning, data wrangling, and financial technology.", "Before launching Koajo, he honorably served in the U.S. Army, where he developed strong leadership, discipline, and problem-solving skills, qualities that now shape the foundation of Koajo’s mission. His passion for financial empowerment, inspired him to modernize the age-old rotating savings system, making it more secure, efficient, and scalable.", "Under his leadership, Koajo integrates cutting-edge data-driven solutions, ensuring a seamless, transparent, and trustworthy savings experience. His unique blend of military discipline, data science expertise, and financial innovation positions Koajo as a game-changer in the world of collective savings and wealth-building."],
  },
];
