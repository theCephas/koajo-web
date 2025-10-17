"use client";
import { useState } from "react";
import cn from "clsx";
import styles from "./Entry.module.sass";
import Field from "@/components2/usefull/Field";
import Checkbox from "@/components2/Checkbox";
import Description from "../Description";
import { CheckboxValue } from "@/types";

type EntryProps = {
    onForgotPassword: () => void;
    onRegister: () => void;
};

const Entry = ({ onForgotPassword, onRegister }: EntryProps) => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [remember, setRemember] = useState<CheckboxValue>("unchecked");

    return (
        <Description title="Login First to Your Account" arrow>
            <form
                className={styles.form}
                action=""
                onSubmit={() => console.log("Submit")}
            >
                <Field
                    className={styles.field}
                    label="Email"
                    placeholder="Type email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <Field
                    className={styles.field}
                    label="Password"
                    placeholder="Type password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <div className={styles.line}>
                    <Checkbox
                        className={styles.checkbox}
                        label="Remember me"
                        value={remember}
                        onChange={(e) => setRemember(e.target.checked ? "checked" : "unchecked")}
                    />
                    <button
                        type="button"
                        className={styles.link}
                        onClick={onForgotPassword}
                    >
                        Forgot Password
                    </button>
                </div>
                <button className={cn("button-wide", styles.button)}>
                    Login
                </button>
                <div className={styles.foot}>
                    <div className={styles.text}>Don’t have an account?</div>
                    <button
                        type="button"
                        className={styles.link}
                        onClick={onRegister}
                    >
                        Register Here
                    </button>
                </div>
            </form>
        </Description>
    );
};

export default Entry;
