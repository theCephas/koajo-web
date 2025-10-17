import { useState } from "react";
import styles from "./AddNewCard.module.sass";
import Modal from "@/components2/usefull/Modal";
import CreditCard from "@/components2/CreditCard";
import Field from "@/components2/usefull/Field";
import DatePicker from "@/components2/usefull/DatePicker";

type AddNewCardProps = {};

const AddNewCard = ({}: AddNewCardProps) => {
    const [visibleModal, setVisibleModal] = useState<boolean>(false);
    const [name, setName] = useState<string>("");
    const [number, setNumber] = useState<string>("");
    const [startDate, setStartDate] = useState<any>(new Date());
    const [code, setCode] = useState<string>("");

    const card = {
        id: "0",
        title: "Visa Card",
        type: "visa",
        number: "1231 3123 4543 3456",
        name: "Rainer Yaeger",
        date: "11/24",
        color: "#ACB5BB",
    };

    return (
        <>
            <button
                className="button-stroke button-wide"
                onClick={() => setVisibleModal(true)}
            >
                Add new card
            </button>
            <Modal
                className={styles.modal}
                closeClassName={styles.close}
                visible={visibleModal}
                onClose={() => setVisibleModal(false)}
            >
                <div className={styles.title}>Add New Card</div>
                <div className={styles.info}>
                    add a new card for your transaction
                </div>
                <CreditCard className={styles.creditCard} item={card} />
                <form
                    className={styles.form}
                    action=""
                    onSubmit={() => console.log("Submit")}
                >
                    <Field
                        className={styles.field}
                        label="Card Holder Name"
                        placeholder="Type card holder name"
                        value={name}
                        onChange={(e: any) => setName(e.target.value)}
                        required
                    />
                    <Field
                        className={styles.field}
                        label="Card Number"
                        placeholder="Type card number"
                        value={number}
                        onChange={(e: any) => setNumber(e.target.value)}
                        required
                    />
                    <div className={styles.line}>
                        <DatePicker
                            className={styles.field}
                            label="Expiry Date"
                            selected={startDate}
                            onChange={(date: any) => setStartDate(date)}
                            dateFormat="MM/dd"
                            icon
                        />
                        <Field
                            className={styles.field}
                            label="CVC/CVV"
                            placeholder="Type CVC/CVV"
                            value={code}
                            onChange={(e: any) => setCode(e.target.value)}
                            required
                        />
                    </div>
                    <button className="button-wide" type="submit">
                        Confirm
                    </button>
                </form>
            </Modal>
        </>
    );
};

export default AddNewCard;
