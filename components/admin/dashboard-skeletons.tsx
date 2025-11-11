"use client";

import type { CSSProperties, ReactNode, ReactElement } from "react";
import cn from "clsx";

type SkeletonShapeProps = {
  className?: string;
  style?: CSSProperties;
};

const baseClasses =
  "animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200";

export const SkeletonBlock = ({
  className,
  style,
}: SkeletonShapeProps): ReactElement => (
  <div className={cn(baseClasses, "rounded-xl", className)} style={style} />
);

export const SkeletonLine = ({
  className,
  style,
}: SkeletonShapeProps): ReactElement => (
  <SkeletonBlock className={cn("h-3 rounded-full", className)} style={style} />
);

export const SkeletonCircle = ({
  className,
  style,
}: SkeletonShapeProps): ReactElement => (
  <SkeletonBlock className={cn("rounded-full", className)} style={style} />
);

export const SkeletonCard = ({
  className,
  headerLines = 1,
  body,
}: {
  className?: string;
  headerLines?: number;
  body?: ReactNode;
}): ReactElement => (
  <div
    className={cn(
      "rounded-3xl border border-gray-100 bg-white p-5 shadow-sm",
      className
    )}
  >
    <div className="space-y-5">
      <div className="space-y-3">
        {Array.from({ length: headerLines }).map((_, index) => (
          <SkeletonLine
            key={index}
            className={cn("w-1/2", index === 0 && "w-1/3")}
          />
        ))}
      </div>
      {body ?? (
        <div className="space-y-3">
          <SkeletonLine className="w-11/12" />
          <SkeletonLine className="w-8/12" />
          <SkeletonLine className="w-7/12" />
        </div>
      )}
    </div>
  </div>
);

export const SkeletonStatGrid = ({
  rows = 2,
}: {
  rows?: number;
}): ReactElement => (
  <div className="space-y-4">
    {Array.from({ length: rows }).map((_, index) => (
      <div key={index} className="space-y-3 rounded-2xl p-4">
        <SkeletonLine className="w-8/12" />
        <SkeletonLine className="w-5/12" />
        <SkeletonLine className="w-6/12" />
      </div>
    ))}
  </div>
);

export const SkeletonChipRow = ({
  count = 4,
}: {
  count?: number;
}): ReactElement => (
  <div className="flex flex-wrap gap-2">
    {Array.from({ length: count }).map((_, index) => (
      <SkeletonBlock key={index} className="h-6 w-20 rounded-full" />
    ))}
  </div>
);
