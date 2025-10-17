"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { disablePageScroll, enablePageScroll } from "scroll-lock";
import { CSSTransition } from "react-transition-group";
import { useHotkeys } from "react-hotkeys-hook";
import cn from "clsx";
import styles from "./modal.module.sass";
// import CloseIcon from "@/public/media/icons/close.svg";
// import { Button } from "@/components/utils";

type ModalProps = {
  className?: string;
  // closeClassName?: string;
  containerClassName?: string;
  visible: boolean;
  onClose?: () => void;
  // hideClose?: boolean;
  makeFullHeight?: boolean;
  children: React.ReactNode;
  position?: {
    vertical?: "top" | "center" | "bottom";
    horizontal?: "left" | "center" | "right";
  };
};

const Modal = ({
  className,
  containerClassName,
  // closeClassName,
  visible,
  onClose,
  // hideClose,
  children,
  makeFullHeight = false,
  position = {
    vertical: "center",
    horizontal: "center",
  },
}: ModalProps) => {
  const [loaded, setLoaded] = useState<boolean>(false);

  useHotkeys("esc", () => onClose?.());

  const initialRender = useRef(true);


  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
    } else {
      if (visible) {
        disablePageScroll();
      } else {
        enablePageScroll();
      }
    }
  }, [visible]);

  useEffect(() => setLoaded(true), []);

  const ref = useRef(null);

  return loaded
    ? createPortal(
        <CSSTransition
          classNames={"modal"}
          in={visible}
          timeout={400}
          nodeRef={ref}
          unmountOnExit
        >
          <div
            className={cn(
              "fixed inset-0 z-[990] flex w-full h-full overflow-auto bg-text-500/30  backdrop-blur-[6.5px] items-center justify-center",
              className,
              makeFullHeight && "!p-0"
            )}
            onClick={onClose}
            data-scroll-lock-scrollable
            data-scroll-lock-fill-gap
            ref={ref}
          >
            <div className={cn("modal-overlay", styles.overlay)}></div>
            <div
              className={cn(
                "modal-container",
                styles.container,
                containerClassName,
                {
                  "h-screen": makeFullHeight,
                  "top-0": position.vertical === "top",
                  "bottom-0": position.vertical === "bottom",
                  "mr-auto": position.horizontal === "left",
                  "ml-auto": position.horizontal === "right",

                }
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* {onClose && !hideClose && (
                <Button
                  className={cn(styles.close, closeClassName)}
                  onClick={onClose}
                  icon={<CloseIcon />}
                >
                  {/* <Icon name="close" /> */}
                  {/* <CloseIcon /> */}
                {/* </Button>
              )} */} 
              {children}
            </div>
          </div>
        </CSSTransition>,
        document.body
      )
    : null;
};

export default Modal;
