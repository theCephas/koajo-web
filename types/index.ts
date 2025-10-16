/**
 * Creates a union type of numbers from 0 to N (inclusive)
 * This is a generic and declarative approach to create bounded number types
 */
type Enumerate<N extends number, Acc extends number[] = []> = Acc['length'] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc['length']]>;

/**
 * Creates a range type from F to T (inclusive)
 */
export type Range<F extends number, T extends number> = Exclude<Enumerate<T>, Enumerate<F>> | T;


export type HTMLTag =
  | "strong"
  | "i"
  | "u"
  | "s"
  | "code"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "p"
  | "ul"
  | "ol"
  | "li"
  | "blockquote"
  | "figure"
  | "figcaption"
  | "img"
  | "a"
  | "table"
  | "thead"
  | "tbody"
  | "tr"
  | "td"
  | "th"
  | "caption"
  | "hr"
  | "br"
  | "video"
  | "audio"
  | "iframe"
  | "canvas"
  | "svg"
  | "path"
  | "rect"
  | "circle"
  | "line"
  | "polyline"
  | "polygon"
  | "text"
  | "tspan"
  | "g"
  | "use"
  | "defs"
  | "linearGradient"
  | "radialGradient"
  | "stop"
  | "defs"
  | "clipPath"
  | "mask"
  | "pattern"
  | "symbol"
  | "use"
  | "title"
  | "desc"
  | "metadata"
  | "script"
  | "style"
  | "noscript"
  | "template"
  | "slot"
  | "slot";

  export type NotificationsType = {
    id: string;
    type: string;
    title: string;
    time: string;
    info: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    new: boolean;
};

export type Currency = "USD" | "GBP" | "EUR"

export type TransactionType = {
    id: string;
    invoice: string;
    name: string;
    image: string;
    business: string;
    typeTransaction: string;
    date: string;
    time: string;
    amount: string;
    status: string;
    paidBy: string;
    accountType: string;
    transferSend: string;
    transferReceive: string;
    accountNumber: string;
    transactionId: string;
  };
  

export type CheckboxValue = "checked" | "unchecked";