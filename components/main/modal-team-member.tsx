"use client";

import { useState, useEffect } from "react";
import { MyImage, Button } from "@/components/utils";
import ZoomIcon from "@/public/media/icons/zoom.svg";
import Image from "next/image";
import { Modal } from "@/components/utils";
import cn from "clsx";

interface ModalPersonProps {
  person: Member;
}

export interface Member {
  name: string;
  imageId: string;
  position: string;
  bio: string | string[];
}

export default function ModalPerson({ person }: ModalPersonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeModal();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      <Button
        className="absolute bottom-0 right-0 m-3 md:m-5 !px-2.25 !py-2.25 md:px-5 rounded-sm"
        icon={
          <Image
            src="media/icons/zoom.svg"
            width={20}
            height={20}
            className="size-5 md:size-8 lg:size-9.5 object-contain"
            alt="zoom icon"
          />
        }
        onClick={openModal}
      />

      {isOpen && (
        <Modal
          visible={isOpen}
          makeFullHeight
          position={{ horizontal: "right" }}
          containerClassName="!rounded-none"
        >
          <TeamMember person={person} closeModal={closeModal} isOpen={isOpen} />
        </Modal>
      )}
    </>
  );
}

function TeamMember({
  person,
  closeModal,
  isOpen,
}: ModalPersonProps & { closeModal: () => void; isOpen: boolean }) {
  const bioJsx = (className = "") => (
    <div className="flex flex-col gap-5 overflow-y-auto h-full max-h-[30vh] md:max-h-[calc(90dvh-220rem/16)] lg:max-h-[60dvh]">
      {Array.isArray(person.bio) ? person.bio.map((bio, index) => (
        <p key={index} className={cn("text-sm lg:text-base text-gray-900", className)}>
          {bio}
        </p>
      )) : (
        <p className={cn("text-sm lg:text-base text-gray-900", className)}>
          {person.bio}
        </p>
      )}
    </div>
  );

  return (
    <div className="relative w-screen h-full max-w-[calc(1080rem/16)] mx-auto bg-white overflow-hidden p-7.5 lg:pl-[calc(145rem/16)]">
      {/* Header */}
      <div className="flex justify-between items-center gap-5 md:gap-8 lg:gap-14 mb-10 md:mb-16 lg:mb-24">
        <span className="text-sm lg:text-base text-gray-300 w-full border-b border-text-200 py-2.5">
          Profile
        </span>
        <Button
          onClick={closeModal}
          className="rounded-sm !px-1 !py-1"
          icon={
            <Image
              src="media/icons/zoom.svg"
              width={20}
              height={20}
              className={cn(
                "size-5 object-contain rotate-0 transition-transform duration-300 ease-in-out delay-200",
                isOpen && "rotate-45"
              )}
              alt="zoom icon"
            />
          }
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-col gap-10 w-full max-w-[calc(789rem/16)]">
        <div className="flex gap-5 md:gap-10 items-center md:items-start">
          <div className="w-50 h-55 md:w-40 lg:w-[calc(276rem/16)] md:h-60 lg:h-90 rounded-lg overflow-hidden flex-shrink-0">
            <MyImage
              src={person.imageId}
              alt={person.name}
              width={128}
              height={128}
              crop="thumb"
              gravity="center"
              className="w-full h-full object-cover"
              quality={100}
              isCloudinary
            />
          </div>

          <div className="flex flex-col ">
            <div className="mb-7.5">
              <h2 className="text-md md:text-lg lg:text-2lg text-text-700 font-semibold mb-1">
                {person.name}
              </h2>
              <span className="text-xs lg:text-sm text-gray-600">
                {person.position}
              </span>
            </div>
            {bioJsx("hidden md:block")}
          </div>

        </div>
          {bioJsx("block md:hidden")}
      </div>
    </div>
  );
}
