const express = require("express");
const Admin = require("../model/admin");
const router = new express.Router();
const { authAdmin } = require("../middleware/auth");
const User = require('../model/user')


router.get("/admin/list-user", authAdmin, async (req, res) => {
    try {
        const users = await User.find({}).sort({ createdAt: req.query.sort })
        return res.status(200).send(users)
    }
    catch (e) {
        res.status(404).send(e)
    }
})

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

router.post("/admin/logout", authAdmin, async (req, res) => {
    try {
        req.admin.tokens = [];

        await req.admin.save();

        res.send("Log out!");
    } catch (e) {
        res.status(500).send("Error from logout!");
    }
});

router.get("/admin/:id", authAdmin, async (req, res) => {
    const _id = req.params.id;

    Admin.findById(_id)
        .then((result) => {
            if (!result) {
                return res.status(404).send("Can not find this admin!");
            }

            res.send(result);
        })
        .catch((e) => {
            res.status(500).send("error from get admin by id");
        });
});

router.get("/admins", authAdmin, async (req, res) => {
    try {
        const listAdmin = await Admin.find({}).sort({ createdAt: req.query.sort })
        res.status(200).send(listAdmin)
    }
    catch (e) {
        res.status.send(e)
    }
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

        return res.status(404).send("Can not found this admin!")
    }
    catch (e) {
        res.status(404).send(e)
    }
})

router.get("/admin/user/search", authAdmin, async (req, res) => {
    try {
        const searchByName = await User.find({ "name": { $regex: req.query.searchText, $options: 'i' } })
        if (searchByName.length !== 0) {
            return res.status(200).send(searchByName)
        }

        const searchByEmail = await User.find({ "email": { $regex: req.query.searchText, $options: 'i' } })
        if (searchByEmail.length !== 0) {
            return res.status(200).send(searchByEmail)
        }

        return res.status(404).send("Can not found this user!")
    }
    catch (e) {
        res.status(404).send(e)
    }
})

router.get("/admin/user/lock-account", authAdmin, (req, res) => {
    const _id = req.query.id;

    User.findById(_id)
        .then((result) => {
            if (!result) {
                return res.status(404).send("Can not find this user!");
            }

            result.status = 'lock'
            result.save();
            return res.status(200).send("Lock acount success!")
        })
        .catch((e) => {
            res.status(500).send();
        });
});

router.get("/admin/user/unlock-account", authAdmin, (req, res) => {
    const _id = req.query.id;

    User.findById(_id)
        .then((result) => {
            if (!result) {
                return res.status(404).send("Can not find this user!");
            }

            if(result.status === 'lock') {
                result.status = "active"
                result.save();
            }
            
            return res.status(200).send("Unlock acount success!")
        })
        .catch((e) => {
            res.status(500).send();
        });
});


router.get("/admin/user/ban-account", authAdmin, (req, res) => {
    const _id = req.query.id;

    User.findById(_id)
        .then((result) => {
            if (!result) {
                return res.status(404).send("Can not find this user!");
            }

            result.status = 'ban'
            result.name = 'Ban account'
            result.studentId = 'Ban account'
            result.save();
            return res.status(200).send("Ban acount success!")
        })
        .catch((e) => {
            res.status(500).send();
        });
});

router.get("/admin/user/:id", authAdmin, (req, res) => {
    const _id = req.params.id;

    User.findById(_id)
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
