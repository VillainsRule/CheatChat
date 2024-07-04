export default (app, db) => {
    app.post('/api/authcheck', async (req, res) => {
        if (req.session.token && req.session.userID) return res.send({
            success: true,
            name: req.session.name,
            badges: req.session.badges
        });

        else return res.send({ success: false, error: 'You are not logged in.' });
    });

    app.post('/api/logout', async (req, res) => {
        req.session.destroy();
        res.send({ success: true });
    });
};