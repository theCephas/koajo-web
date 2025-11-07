import Link from "next/link";
import ArrowRightIcon from "@/public/media/icons/arrow-right.svg"
import SuccessIcon from "@/public/media/icons/success-check.svg"
import ErrorIcon from "@/public/media/icons/warning.svg"
import InfoIcon from "@/public/media/icons/info.svg"

interface CardAuthProps {
  children: React.ReactNode;
  title: string;
  description: string;
  goBackHref?: string;
}

interface CardAuthSuccessProps extends CardAuthProps {
  showSuccessIcon?: boolean;
}

interface CardAuthErrorProps extends CardAuthProps {
  showErrorIcon?: boolean;
}

interface CardAuthInfoProps extends CardAuthProps {
  showInfoIcon?: boolean;
}


export default function CardAuth({
  children,
  title,
  description,
  goBackHref,
  ...props
}: CardAuthSuccessProps | CardAuthErrorProps | CardAuthInfoProps) {
  return (
    <div className="flex flex-col gap-6.5 w-full max-w-[calc(480rem/16)] relative p-8 bg-white rounded-2xl shadow-lg">
      {/* Back Button */}
      {goBackHref && (
        <Link
          href={goBackHref}
          className="inline-flex items-center gap-2 text-[var(--color-text-400)] hover:text-[var(--color-text-500)] mb-6"
        >
          <ArrowRightIcon className="rotate-180 [&_path]:stroke-[#1A1C1E]" />
        </Link>
      )}

      {/* Success Icon */}
      {('showSuccessIcon' in props && props.showSuccessIcon) && (
        <div className="flex justify-center items-center w-fit mx-auto bg-tertiary-100 rounded-full p-5">
          <SuccessIcon />
        </div>
      )}

      {('showErrorIcon' in props && props.showErrorIcon) && (
        <div className="flex justify-center items-center w-fit mx-auto bg-red-100 rounded-full p-5">
          <ErrorIcon />
        </div>
      )}
      {('showInfoIcon' in props && props.showInfoIcon) && (
        <div className="flex justify-center items-center w-fit mx-auto bg-blue-100 rounded-full p-5">
          <InfoIcon />
        </div>
      )}

      {/* Heading */}
      <div className="text-center">
        <h1 className="text-2lg font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-base text-text-400">{description}</p>
      </div>

      {children}
    </div>
  );
}
