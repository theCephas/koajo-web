"use client";
import { useState } from "react";
import cn from "clsx";
import styles from "./CreateAccount.module.sass";
import Field from "@/components2/usefull/Field";
import Description from "../Description";

type CreateAccountProps = {
    onBack: () => void;
    onLogin: () => void;
};

const CreateAccount = ({ onBack, onLogin }: CreateAccountProps) => {
    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    return (
        <Description
            title="Create New Account"
            info="Please register by filling in your personal data"
            onBack={onBack}
        >
            <form
                className={styles.form}
                action=""
                onSubmit={() => console.log("Submit")}
            >
                <Field
                    className={styles.field}
                    label="Full name"
                    placeholder="Type full name"
                    value={name}
                    onChange={(e: any) => setName(e.target.value)}
                    required
                />
                <Field
                    className={styles.field}
                    label="Email"
                    placeholder="Type email"
                    type="email"
                    value={email}
                    onChange={(e: any) => setEmail(e.target.value)}
                    required
                />
                <Field
                    className={styles.field}
                    label="Password"
                    placeholder="Type password"
                    type="password"
                    value={password}
                    onChange={(e: any) => setPassword(e.target.value)}
                    required
                />
                <button className={cn("button-wide", styles.button)}>
                    Continue
                </button>
                <div className={styles.foot}>
                    <div className={styles.text}>Already have an account?</div>
                    <button
                        type="button"
                        className={styles.link}
                        onClick={onLogin}
                    >
                        Login
                    </button>
                </div>
            </form>
        </Description>
    );
};

export default CreateAccount;
