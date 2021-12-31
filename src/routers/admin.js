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

router.post("/admin/:id", authAdmin, async (req, res) => {
    const _id = req.params.id;

    Admin.findById(_id)
        .then((result) => {
            if (!result) {
                return res.status(404).send("Can not find this user!");
            }

            res.send(result);
        })
        .catch((e) => {
            res.status(500).send();
        });
});

router.get("/admins", authAdmin, async (req, res) => {
    const listAdmin = await Admin.find({}).sort({ createdAt: req.query.sort })
    res.status(200).send(listAdmin)
})

router.get("/admins/search", authAdmin, async (req, res) => {
    try {
        const searchByName = await Admin.find({ "name": { $regex: req.query.searchText, $options: 'i' } })
        if (searchByName.length !== 0) {
            return res.status(200).send(searchByName)
        }

        const searchByAccount = await Admin.find({ "account": { $regex: req.query.searchText, $options: 'i' } })
        if (searchByAccount.length !== 0) {
            return res.status(200).send(searchByAccount)
        }

        return res.status(404).send("Can not found this user!")
    }
    catch (e) {
        res.status(404).send(e)
    }
})

module.exports = router
