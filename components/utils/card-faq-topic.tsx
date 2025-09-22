import React from "react";
import Link from "next/link";
import { ArrowRightIcon } from "@radix-ui/react-icons";

interface CardFaqProps {
  title: string;
  description: string;
  href?: string;
  children?: React.ReactNode;
}

export default function CardFaqTopic({ title, description, href, children }: CardFaqProps) {
  return (
    <div className="bg-white rounded-[0.625rem] shadow-[0px_30px_80px_0px_rgba(0,0,0,0.06)] p-8.5 flex flex-col gap-6 min-h-[150px]">
      <h2 className="font-semibold text-2lg text-black">{title}</h2>
      {description && <p className="text-base text-text-400">{description}</p>}
      {children}
      {href && (
        <Link href={href} className="font-semibold text-base flex items-center gap-2.5 text-black hover:underline w-fit">
          Read More <ArrowRightIcon className="size-4" />
        </Link>
      )}
    </div>
  );
}
