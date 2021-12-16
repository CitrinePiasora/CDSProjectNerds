import { ReactElement, ReactNode } from "react"
import cn from "classnames"

import styles from "../styles/Alert.module.scss"

interface Props {
    children: ReactNode
    type: "danger" | "info" | "success" | "warning"
}

export default function Alert({ children, type }: Props): ReactElement {
    return (
        <div className={cn(styles.alert, styles[`alert-${type}`])}>
            {children}
        </div>
    )
}