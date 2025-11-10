"use client";
import { useState } from "react";
import cn from "clsx";
import styles from "./PhotoProfile.module.sass";
import Image from "@/components2/usefull/Image";
import Icon from "@/components2/usefull/Icon";

// type PhotoProfileProps = {};

const PhotoProfile = () => {
    const [objectURL, setObjectURL] = useState<any>("/media/images/avatar.jpg");

    const handleUpload = (e: any) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // setImage(file);
            setObjectURL(URL.createObjectURL(file));
        }
    };

    return (
        <div className={styles.photo}>
            <div className={styles.label}>Photo Profile</div>
            <div className={styles.row}>
                <div className={styles.avatar}>
                    {objectURL !== null ? (
                        <Image
                            src={objectURL}
                            fill
                            style={{ objectFit: "cover" }}
                            alt="Avatar"
                        />
                    ) : (
                        <Icon name="user" size="32" />
                    )}
                </div>
                <div className={styles.file}>
                    <input
                        className={styles.input}
                        type="file"
                        onChange={handleUpload}
                    />
                    <button className={cn("button", styles.button)}>
                        Upload image
                    </button>
                </div>
                <button
                    className={cn("button-stroke", styles.delete)}
                    onClick={() => setObjectURL(null)}
                >
                    Delete
                    <Icon name="trash-stroke" />
                </button>
            </div>
        </div>
    );
};

export default PhotoProfile;
