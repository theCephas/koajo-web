import { Currency } from '@/types';
import { v4 as uuidv4 } from 'uuid';

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