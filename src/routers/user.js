const express = require("express");
const User = require("../model/user");
const Notification = require("../model/notification");
const ClassRoom = require("../model/classroom");

const router = new express.Router();
const auth = require("../middleware/auth");
const multer = require("multer");
const sharp = require("sharp");

//get 1 users with authorization
router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
});

//log out all user
router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = [];

    await req.user.save();

    res.send("Log out!");
  } catch (e) {
    res.status(500).send();
  }
});

//login user
router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );

    token = await user.generateAuthToken();

    res.send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

//login with google
router.post("/users/loginWithGoogle", async (req, res) => {
  try {
    console.log("Login with google", req.body);
    const user = await User.findByGoogleAccount(
      req.body.name,
      req.body.email,
      req.body.id
    );

    token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

//upload avatar
const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, callback) {
    if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
      return callback(new Error("Please upload an image!"));
    }

    callback(undefined, true);
  },
});

//add user avatar
router.post(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

//delete user avatar
router.delete(
  "/users/me/avatar",
  auth,
  async (req, res) => {
    req.user.avatar = undefined;

    await req.user.save();

    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

//get user by id
router.get("/users/:id", (req, res) => {
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

//create new user
router.post("/users", async (req, res) => {
  try {
    const duplicatedEmail = await User.findOne({ email: req.body.email });
    if (duplicatedEmail) {
      return res.status(400).send({ error: "This email has been registered!" });
    }

    if (req.body.studentId) {
      const duplicatedStudentId = await User.findOne({
        studentId: req.body.studentId,
      });
      if (duplicatedStudentId) {
        return res.status(400).send({ error: "Duplicated student id!" });
      }
    }

    const user = new User(req.body);

    const classrooms = await ClassRoom.find({
      unmappedStudents: { $elemMatch: { studentId: req.body.studentId } },
    });

    if (classrooms) {
      for (const classroom of classrooms) {
        classroom.students.push(user._id);        
        const index = classroom.unmappedStudents.findIndex(
          (student) => student.studentId === user.studentId
        );        
        if (index >= 0) {
          classroom.unmappedStudents.splice(index, 1);          
        }
        await classroom.save();
      }
    }

    const notif = new Notification();
    user.notifications = notif._id;
    await  notif.save()
    const token = await user.generateAuthToken();

    res.status(201).send({ user, token });
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

//edit user profile
router.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password", "studentId"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    if (req.body?.studentId && req.user.studentId !== req.body.studentId) {
      const duplicatedStudentId = await User.count({
        studentId: req.body.studentId,
      });
      if (duplicatedStudentId > 0) {
        return res.status(400).send({ error: "Duplicated student id!" });
      }
    }

    updates.forEach((update) => (req.user[update] = req.body[update]));

    await req.user.save();

    res.status(200).send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.avatar) {
      throw new Error();
    }

    res.set("Content-Type", "image/png");
    res.send(user.avatar);
  } catch (e) {
    res.status(404).send("This user don't have an avatar");
  }
});

module.exports = router;
