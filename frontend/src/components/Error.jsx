import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPoo } from '@fortawesome/free-solid-svg-icons';

import styles from '@styles/error.module.css';

export default function Error({ header, message }) {
    return (
        <>
            <div className={styles.errorContainer}>
                <div className={styles.errorBox}>
                    <FontAwesomeIcon icon={faPoo} className={styles.errorBang} />

                    <div className={styles.errorHeader}>{header}</div>
                    <div className={styles.errorMessage}>{message}</div>
                </div>
            </div>
        </>
    );
};