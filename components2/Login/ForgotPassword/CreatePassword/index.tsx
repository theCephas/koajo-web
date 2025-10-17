"use client";
import { useState } from "react";
import cn from "clsx";
import styles from "./CreatePassword.module.sass";
import Field from "@/components2/usefull/Field";
import Description from "../../Description";

type CreatePasswordProps = {
    onBack: () => void;
    onContinue: () => void;
};

const CreatePassword = ({ onBack, onContinue }: CreatePasswordProps) => {
    const [newPassword, setNewPassword] = useState<string>("");
    const [repeatPassword, setRepeatPassword] = useState<string>("");

    const level: number = 3;

    return (
        <Description
            title="Create New Password"
            info="Send your email account to reset password & make new password"
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
                    label="New Password"
                    placeholder="Type new password"
                    type="password"
                    value={newPassword}
                    onChange={(e: any) => setNewPassword(e.target.value)}
                    required
                />
                <div className={styles.reliability}>
                    <div className={styles.note}>
                        Min 8 Characters with a combination of letters and
                        numbers
                    </div>
                    <div className={styles.line}>
                        <div
                            className={cn(styles.progress, {
                                [styles.level1]: level === 1,
                                [styles.level2]: level === 2,
                                [styles.level3]: level === 3,
                                [styles.level4]: level === 4,
                            })}
                        >
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <div className={styles.text}>
                            {level === 1
                                ? "Low"
                                : level === 2
                                ? "Meidum"
                                : level === 3
                                ? "Strong"
                                : "Maximum"}
                        </div>
                    </div>
                </div>
                <Field
                    className={styles.field}
                    label="Repeat Password"
                    placeholder="Type repeat password"
                    type="password"
                    value={repeatPassword}
                    onChange={(e: any) => setRepeatPassword(e.target.value)}
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

export default CreatePassword;
