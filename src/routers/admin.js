const express = require("express");
const Admin = require("../model/admin");
const router = new express.Router();
const { authAdmin } = require("../middleware/auth");

//create new admin
router.post("/admin", async (req, res) => {
    const secretCode = req.body.secretCode
    if (secretCode !== process.env.ADMIN_SECRET_CODE) {
        return res.status(400).send({ error: "Wrong secret code!" });
    }

    try {
        const duplicatedAccount = await Admin.findOne({ account: req.body.account });
        if (duplicatedAccount) {
            return res.status(400).send({ error: "This account has been registered!" });
        }

        const admin = new Admin(req.body);

        const token = await admin.generateAuthToken();

        res.status(201).send({ admin, token });
    } catch (e) {
        console.log(e);
        res.status(400).send(e);
    }
});

//login user
router.post("/admin/login", async (req, res) => {
    try {
        const admin = await Admin.findByCredentials(
            req.body.account,
            req.body.password
        );

        token = await admin.generateAuthToken();

        res.send({ admin, token });
    } catch (e) {
        res.status(400).send(e);
    }
});

router.get("/admins", authAdmin, async (req, res) => {
    const listAdmin = await Admin.find({}).sort({ createdAt: req.query.createdAt})
    res.status(200).send(listAdmin)
})

module.exports = router
