import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord, faGithub } from '@fortawesome/free-brands-svg-icons';
import { faFork } from '@utils/fontawesome';

import styles from '@styles/commands.module.css';

export default [
    {
        name: 'discord',
        desc: 'Want to join the StateFarm Discord server?',
        element: <div className={styles.discordButton} onClick={() => open('https://dsc.gg/sfnetwork')}>
            <FontAwesomeIcon icon={faDiscord} className={styles.buttonIcon} />
            dsc.gg/sfnetwork
        </div>,
        icon: faDiscord
    },
    {
        name: 'github',
        desc: 'View the StateFarm source on Github!',
        element: <div className={styles.githubButton} onClick={() => open('https://github.com/HydroFlame522/StateFarmClient')}>
            <FontAwesomeIcon icon={faGithub} className={styles.buttonIcon} />
            HydroFlame522/StateFarmClient
        </div>,
        icon: faGithub
    },
    {
        name: 'greasyfork',
        desc: 'View StateFarm on Greasyfork!',
        element: <div className={styles.greasyforkButton} onClick={() => open('https://greasyfork.org/scripts/482982')}>
            <FontAwesomeIcon icon={faFork} className={styles.buttonIcon} />
            StateFarm Client V3
        </div>,
        icon: faFork
    }
]