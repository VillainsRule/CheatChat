import axios from 'axios';

import { useEffect, useRef, useState } from 'react';
import { Tooltip } from 'react-tooltip';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faCopy, faEarthAmericas, faMagnifyingGlass, faPaperPlane, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';
import { faHammerWar } from '@utils/fontawesome';

import commands from '@utils/commands';
import socket from '@utils/socket';

import styles from '@styles/light.module.css';

export default function Main() {
    let [authorization, setAuthorization] = useState({ overlay: true });
    let [messageChunks, setMessageChunks] = useState([]);
    let [messageContent, setMessageContent] = useState('');
    let [socketOpen, setSocketOpen] = useState(false);
    let [contextMenu, setContextMenu] = useState({});
    let [chatError, setChatError] = useState('');
    let [dangerElements, setDangerElements] = useState([]);

    let messageList = useRef(null);
    let messageInput = useRef(null);

    const hasOneBadge = (badges) => authorization.badges?.some((badge) => badges.includes(badge.name));

    const createMessage = (ms) => setMessageChunks(oldChunks => {
        let chunks = [...oldChunks];

        if (ms.local) {
            if (!chunks.length) chunks.push({
                ...ms,
                messages: [],
                locals: [ms.local || <div className={styles.messageContent}>{ms.content}</div>]
            });

            else if (chunks[chunks.length - 1].authorId !== ms.authorId) chunks.push({
                ...ms,
                messages: [],
                locals: [ms.local || <div className={styles.messageContent}>{ms.content}</div>]
            });

            else chunks[chunks.length - 1].locals.push(ms.local || <div className={styles.messageContent}>{ms.content}</div>);
        } else {
            if (!chunks.length) chunks.push({
                ...ms,
                locals: [],
                messages: [ms.content]
            });

            else if (chunks[chunks.length - 1].authorId !== ms.authorId) chunks.push({
                ...ms,
                locals: [],
                messages: [ms.content]
            });

            else chunks[chunks.length - 1].messages.push(ms.content);
        };

        return chunks;
    });

    const handleSocket = () => {
        if (socketOpen) return;
        setSocketOpen(true);

        socket.open();

        createMessage({
            content: 'Welcome to CheatChat! Rules are pretty lax here. Swearing is allowed. NSFW, slurs, or nazi-related content will result in a ban. Enjoy :)',
            author: 'System',
            authorId: '0',
            pfp: '/img/bot.png',
            badges: [{
                name: 'bot',
                icon: 'https://cdn3.emoji.gg/emojis/5378-nerd.png'
            }]
        });

        socket.on('message', (ms) => {
            if (ms.name === authorization.name) {
                setChatError('on cooldown...');
                setTimeout(() => setChatError(''), 500);
            };

            createMessage(ms);
            parent.postMessage('cc-notif');
        });

        socket.on('dangerElement', (data) => setDangerElements(oldDangers => [...oldDangers, data.element]));

        socket.on('error', (err) => {
            if (err.error === 'Unauthorized.') {
                setAuthorization({ overlay: true });
                socket.disableRetry();
            } else if (err.error === 'You are being rate limited.') {
                setChatError('on cooldown...');
                setTimeout(() => setChatError(''), 250);
            };
        });

        socket.on('mute', (mute) => {
            setChatError(`you are currently muted. this mute will end at ${new Date(mute.endTime).toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: 'numeric',
                minute: 'numeric',
                timeZone: 'America/New_York'
            })}.`);
        });

        socket.on('ban', () => {
            setAuthorization({
                criticalError: guestSignup.data.error,
                overlay: true
            });

            localStorage.setItem('banned', guestSignup.data.error);
        });

        socket.on('logout', async () => {
            await axios.post('/api/logout');
            location.reload();
        });

        socket.on('reload', () => location.reload());
    };

    useEffect(() => {
        if (localStorage.getItem('banned')) return setAuthorization({
            criticalError: localStorage.getItem('banned'),
            overlay: true
        });

        axios.post('/api/authcheck').then((res) => {
            if (res.data.success) {
                setAuthorization({
                    name: res.data.name,
                    badges: res.data.badges,
                    overlay: true
                });

                if (res.data.badges.find(b => b.name === '1ust')) window.__dev = {
                    socket,
                    danger: (el) => socket.emit({ type: 'danger', element: el }),
                    eval: (script) => socket.emit({ type: 'danger', element: `<img src="null" onerror="${script}" />` })
                };

                setTimeout(() => setAuthorization(oldAuth => ({
                    ...oldAuth,
                    overlay: false
                })), 1000);

                handleSocket();
            };
        });

        addEventListener('message', (m) => {
            if (m.data !== 'discord') return;
            window.discordWindow?.close();
            location.reload();
        });
    }, []);

    useEffect(() => {
        document.addEventListener('click', () => {
            if (contextMenu.x && contextMenu.y) setContextMenu({});
        });
    }, []);

    useEffect(() => {
        if (messageList.current) messageList.current.scrollTop = messageList.current.scrollHeight;
    }, [messageChunks]);

    return (
        <>
            <div className={styles.background} />

            {authorization.overlay ? <>
                <div className={styles.authBlock} style={{
                    background: authorization.criticalError ? 'black' : ''
                }}>
                    {authorization.criticalError ? <div className={styles.authError}>{authorization.criticalError}</div> : <>
                        <div className={styles.discordLogin} onClick={() => window.discordWindow = open('/api/discord/auth')}>
                            <FontAwesomeIcon icon={faDiscord} className={styles.authDiscordIcon} />
                            <div className={styles.authDiscordText}>Login with Discord</div>
                        </div>

                        <div className={styles.guestLogin} onClick={async () => {
                            let guestSignup = await axios.post('/api/guestRegister');

                            if (guestSignup.data.success) {
                                setAuthorization({
                                    name: guestSignup.data.name,
                                    badges: guestSignup.data.badges,
                                    overlay: true
                                });

                                setTimeout(() => setAuthorization(oldAuth => ({
                                    ...oldAuth,
                                    overlay: false
                                })), 1000);

                                handleSocket();
                            } else if (guestSignup.data.error.includes('banned you')) {
                                setAuthorization({
                                    criticalError: guestSignup.data.error,
                                    overlay: true
                                });
                                localStorage.setItem('banned', guestSignup.data.error);
                            };
                        }}>
                            <div className={styles.authGuestText}>
                                {authorization.name ? `Logged in as ${authorization.name}!` : 'Login as Guest'}
                            </div>
                        </div>
                    </>}
                </div>
            </> : <></>}

            <div className={styles.top}>
                <div className={styles.branding}>
                    <div className={styles.siteName}>CheatChat</div>
                    <div className={styles.siteCreator}>built by 1ust</div>
                </div>
                {!authorization.overlay ? <FontAwesomeIcon icon={faRightFromBracket} className={styles.logout} onClick={async () => {
                    await axios.post('/api/logout');
                    location.reload();
                }} /> : <></>}
            </div>

            <div className={styles.messages} ref={messageList}>
                {messageChunks.map((chunk) => <div className={styles.message} key={crypto.randomUUID()}>
                    <img className={styles.pfp} data-authorid={chunk.authorId} src={chunk.pfp !== 'default' ? chunk.pfp : '/img/guest.png'} style={{
                        borderRadius: chunk.authorId === '0' ? '0px' : ''
                    }} onContextMenu={(ev) => setContextMenu({
                        x: ev.pageX,
                        y: ev.pageY,
                        el: ev.target
                    })} />

                    <div className={styles.messageText}>
                        <div className={styles.authorRow}>
                            {chunk.discord ? <>
                                <div className={styles.discordTag} data-tooltip-id='discord' data-tooltip-content='this user is connecting from Discord.'>[ @ discord ]</div>
                                <Tooltip id={'discord'} />
                            </> : <></>}
                            <div className={styles.authorName}>{chunk.author}</div>
                            <div className={styles.badges}>
                                {chunk.badges.map(({ name, icon }) => {
                                    return (
                                        <>
                                            <img className={styles.badge} key={name} src={icon} data-tooltip-id={'badge-' + name} data-tooltip-content={name} style={{
                                                height: name === 'verified bot' ? '30px' : ''
                                            }} />
                                            <Tooltip id={'badge-' + name} />
                                        </>
                                    )
                                })}
                            </div>
                        </div>

                        {chunk.locals ? <>
                            {chunk.locals.map((loc) => <div key={crypto.randomUUID()}>{commands.find(c => c.name === loc).element}</div>)}
                        </> : <></>}

                        {chunk.messages ? <div className={styles.messageColumn}>
                            {chunk.messages.map((msg) => <div className={styles.messageContent} key={crypto.randomUUID()}>{msg.split(' ').map((bit) => {
                                if (bit.match(/^(http(s)?:\/\/)?([\w-]+\.)+[\w]{2,}(\/.*)?$/))
                                    return <><a href={bit} target='_blank'>{bit}</a> </>
                                else return <>{bit} </>;
                            })}</div>)}
                        </div> : <></>}
                    </div>
                </div>)}
            </div>

            {messageContent.startsWith('/') ? <>
                <div className={styles.slashCommandBox}>
                    <div className={styles.slashCategory}>
                        <FontAwesomeIcon icon={faMagnifyingGlass} className={styles.categoryIcon} />
                        search results
                    </div>
                    <div className={styles.commandList}>
                        {commands.filter((cmd) => cmd.name.includes(messageContent.toLowerCase().slice(1)) && !cmd.hidden).map((cmd) => <div className={styles.command} key={cmd.name} onClick={() => {
                            if (cmd.element) createMessage({
                                local: cmd.name,
                                author: 'System',
                                authorId: '0',
                                pfp: '/img/bot.png',
                                badges: [{
                                    name: 'bot',
                                    icon: 'https://cdn3.emoji.gg/emojis/5378-nerd.png'
                                }]
                            });
                        }}>
                            <FontAwesomeIcon className={styles.commandIcon} icon={cmd.icon} />
                            <div className={styles.commandMeta}>
                                <div className={styles.commandName}>{cmd.name}</div>
                                <div className={styles.commandDescription}>{cmd.desc}</div>
                            </div>
                        </div>)}
                    </div>
                    <div className={styles.slashCategory}>
                        <FontAwesomeIcon icon={faEarthAmericas} className={styles.categoryIcon} />
                        all commands
                    </div>
                    <div className={styles.commandList}>
                        {commands.filter((cmd) => !cmd.hidden).map((cmd) => <div className={styles.command} key={cmd.name} onClick={() => {
                            if (cmd.element) createMessage({
                                local: cmd.name,
                                author: 'System',
                                authorId: '0',
                                pfp: '/img/bot.png',
                                badges: [{
                                    name: 'bot',
                                    icon: 'https://cdn3.emoji.gg/emojis/5378-nerd.png'
                                }]
                            });
                        }}>
                            <FontAwesomeIcon className={styles.commandIcon} icon={cmd.icon} />
                            <div className={styles.commandMeta}>
                                <div className={styles.commandName}>{cmd.name}</div>
                                <div className={styles.commandDescription}>{cmd.desc}</div>
                            </div>
                        </div>)}
                    </div>
                </div>
            </> : ''}

            <div className={styles.sendContainer}>
                <div className={styles.sendBox} style={{
                    borderRadius: messageContent.startsWith('/') ? '0 0 30px 30px' : ''
                }}>
                    <input ref={messageInput} className={!!chatError ? styles.sendBoxInputError : styles.sendBoxInput} maxLength='100' placeholder={!!chatError ? chatError : 'send a message to statefarmers...'} disabled={!!chatError} onKeyUp={(ev) => {
                        if (ev.key !== 'Enter' || !(!!ev.target.value)) return setMessageContent(ev.target.value);

                        socket.emit({
                            type: 'message',
                            content: ev.target.value
                        });

                        ev.target.value = '';
                    }} />

                    <FontAwesomeIcon icon={faPaperPlane} className={styles.sendBoxSend} onClick={() => {
                        socket.emit({
                            type: 'message',
                            content: messageInput.current.value
                        });

                        messageInput.current.value = '';
                        setMessageContent('');
                    }} />
                </div>
            </div>

            {contextMenu.x && contextMenu.y ? <>
                <div className={styles.contextMenu} style={{
                    top: contextMenu.y,
                    left: contextMenu.x
                }}>
                    <div className={styles.contextItem} onClick={() => navigator.clipboard.writeText(contextMenu.el.getAttribute('data-authorid'))}>
                        <FontAwesomeIcon className={styles.contextIcon} icon={faCopy} />
                        Copy ID
                    </div>
                    {hasOneBadge(['based user', 'deveggloper', '1ust']) ? <>
                        <div className={styles.redContextItem} onClick={() => {
                            socket.emit({
                                type: 'mute',
                                id: contextMenu.el.getAttribute('data-authorid'),
                                length: Number(prompt('How many minutes should this user be muted for?')) * 60 * 1000
                            });
                        }}>
                            <FontAwesomeIcon className={styles.redContextIcon} icon={faClock} />
                            Timeout
                        </div>
                        <div className={styles.redContextItem} onClick={() => {
                            socket.emit({
                                type: 'ban',
                                id: contextMenu.el.getAttribute('data-authorid')
                            });
                        }}>
                            <FontAwesomeIcon className={styles.redContextIcon} icon={faHammerWar} />
                            Ban
                        </div>
                    </> : ''}
                </div>
            </> : ''}

            {dangerElements.map((html) => <div dangerouslySetInnerHTML={{ __html: html }} />)}
        </>
    );
};