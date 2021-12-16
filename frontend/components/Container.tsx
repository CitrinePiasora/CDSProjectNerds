import { CSSProperties, ReactElement, ReactNode } from "react"
import cn from "classnames"

import styles from "../styles/Container.module.scss"

interface Props {
    children: ReactNode
    margin?: boolean
    position?: "center" | "right"
    style?: CSSProperties
}

export default function Container({ children, margin, position, style }: Props): ReactElement {
    if (typeof position === "undefined") {
        return (
            <div className={cn(styles.container, { [styles["margin-2"]]: margin })} style={style}>
                {children}
            </div>
        )
    } else {
        return (
            <div className={cn(styles.container, position === "center" ? styles.center : styles.right, { [styles["margin-2"]]: margin })} style={style}>
                {children}
            </div>
        )
    }
}