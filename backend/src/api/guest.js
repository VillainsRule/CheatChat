import crypto from 'crypto';

export default (app, db) => {
    app.post('/api/guestRegister', async (req, res) => {        
        if (req.session.token && req.session.userID) return res.send({
            success: true,
            error: 'You are already authorized.',
            name: req.session.name
        });

        let accountId = crypto.randomUUID();
        let accountToken = crypto.createHash('sha256').update(crypto.randomBytes(20).toString('hex')).digest('hex');

        let accountName = 'Guest' + Number(Math.random().toString(10).slice(-4)).toString();
        let nameUnique = false;
        while (!nameUnique) {
            let nameCheck = await db.all(`SELECT * FROM accounts WHERE name = ?`, [accountName]);
            if (!nameCheck.length) nameUnique = true;
        };

        await db.run('INSERT INTO accounts VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
            accountId,
            accountName,
            req.realIP,
            accountToken,
            '{}',
            '',
            0,
            ''
        ]);

        req.session.token = accountToken;
        req.session.userID = accountId;
        req.session.name = accountName;
        req.session.badges = [];
        req.session.isGuest = true;

        res.send({
            success: true,
            name: accountName,
            badges: []
        });
    });
};