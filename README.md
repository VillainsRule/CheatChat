<div align='center'>
    <h1>cheatchat</h1>
    <h3>the unused beta chat for statefarmers to communicate.</h3>
</div>
<br>
<br>
<h2 align='center'>installation</h2>
to recreate the database, run the following statements:

```sql
CREATE TABLE accounts (
    id            TEXT    UNIQUE,
    name          TEXT    UNIQUE,
    ip            TEXT,
    token         TEXT    UNIQUE,
    discord_user  TEXT    DEFAULT '{}',
    discord_token TEXT,
    mute          INTEGER,
    ban           TEXT,
    PRIMARY KEY (
        id
    )
);

CREATE TABLE bans (
    ip     TEXT,
    banner TEXT
);

CREATE TABLE logs (
    author_id   TEXT,
    author_name TEXT,
    ip          TEXT,
    content     TEXT
);
```

you'll also have to rename `config.example.js` and fill the stuff there out.<br>
i won't provide further install instructions, because anyone intending to use this will have to code heavy modifications.

<br><br>
<h5 align="center">made with ❤️ by 1ust</h5>