const express = require("express");
const Admin = require("../model/admin");
const ClassRoom = require("../model/classroom");
const router = new express.Router();
const auth = require("../middleware/auth");
const multer = require("multer");
const sharp = require("sharp");

//create new admin
router.post("/admin", auth.authAdmin, async (req, res) => {
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

//get 1 users with authorization
router.get("/admin/me", auth.authAdmin, async (req, res) => {
    res.send(req.admin);
  });

  module.exports = router
  