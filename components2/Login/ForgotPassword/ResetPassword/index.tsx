"use client";
import { useState } from "react";
import cn from "clsx";
import styles from "./ResetPassword.module.sass";
import Description from "../../Description";
import Field from "@/components2/usefull/Field";

type ResetPasswordProps = {
    onBack?: () => void;
    onContinue?: () => void;
};

const ResetPassword = ({ onBack, onContinue }: ResetPasswordProps) => {
    const [email, setEmail] = useState<string>("");

    return (
        <Description
            title="Reset Your Password"
            info="Input your email address account to receive a reset link"
            onBack={onBack}
            arrow
        >
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
                    onChange={(e: any) => setEmail(e.target.value)}
                    required
                />
                <button
                    className={cn("button-wide", styles.button)}
                    onClick={onContinue}
                >
                    Continue
                </button>
            </form>
        </Description>
    );
};

export default ResetPassword;
