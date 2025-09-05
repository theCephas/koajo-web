"use client";
import { useState } from "react";
import cn from "clsx";
import styles from "./Transaction.module.sass";
import Checkbox from "@/components2/Checkbox";
import Image from "@/components2/usefull/Image";
import Icon from "@/components2/usefull/Icon";
import Delete from "../Delete";
import Details from "./Details";

type TransactionType = {
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

type TransactionProps = {
  item: TransactionType;
  value: any;
  onChange: any;
};

const Transaction = ({ item, value, onChange }: TransactionProps) => {
  const [visible, setVisible] = useState<boolean>(false);

  return (
    <>
      <div className={cn(styles.transaction, { [styles.active]: visible })}>
        <div className={styles.head}>
          <div className={styles.cell}>
            <div className="flex justify-center w-12">
              <Checkbox
                className={styles.checkbox}
                value={value}
                onChange={onChange}
              />
            </div>
          </div>
          <div className="flex grow justify-between items-center gap-4">
            <div className={styles.cell}>{item.invoice}</div>
            <div className={styles.cell}>
              <div className={styles.description}>
                {/* <div className={styles.logo}>
                                <Image
                                    src={item.image}
                                    width={24}
                                    height={24}
                                    alt=""
                                />
                            </div> */}
                <div className={styles.details}>
                  <div className={styles.name}>{item.name}</div>
                  {/* <div className={styles.business}>
                                    {item.business}
                                </div> */}
                </div>
              </div>
            </div>
            {/* <div className={styles.cell}>
                        <div className={styles.type}>
                            {item.typeTransaction}
                        </div>
                    </div> */}
            <div className={styles.cell}>
              <div className={styles.date}>{item.date}</div>
              <div className={styles.time}>{item.time}</div>
            </div>
            <div className={styles.cell}>{item.amount}</div>
            <div className={styles.cell}>
              <div
                className={cn(
                  {
                    [styles.success]: item.status === "Success",
                    [styles.pending]: item.status === "Pending",
                    [styles.canceled]: item.status === "Canceled",
                  },
                  styles.status
                )}
              >
                {item.status}
              </div>
            </div>
            <div className={styles.cell}>
              <div className={styles.actions}>
                <button
                  className={cn(styles.action, {
                    [styles.active]: visible,
                  })}
                  onClick={() => setVisible(!visible)}
                >
                  <Icon name="eye-fill" size="20" />
                </button>
                <Delete />
              </div>
            </div>
          </div>
        </div>
        {visible && <Details item={item} />}
      </div>
    </>
  );
};

export default Transaction;
