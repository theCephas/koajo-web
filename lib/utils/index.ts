import { Currency } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { Cloudinary } from "@cloudinary/url-gen";

export const generateUid = () => uuidv4();

export const getCurrencySymbol = (currency: Currency) => {
  switch (currency) {
    case "USD":
      return "$";
    case "GBP":
      return "£";
    case "EUR":
      return "€";
  }
};

const cld = new Cloudinary({
  cloud: { cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "" },
});

export const getCloudinaryImageUrl = (imageId: string) => {
  const image = cld.image(imageId);
  return image.toURL();
};

const log = (...args: unknown[]) => {
  if (process.env.NODE_ENV === "development") {
    console.log(...args);
  }
};

if (typeof globalThis !== "undefined") {
  globalThis.log = log;
}
