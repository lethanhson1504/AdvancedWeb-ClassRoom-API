const express = require("express");
const ClassRoom = require("../model/classroom");
const Assignment = require("../model/assignment");
const Notification = require("../model/notification");
const GradeReview = require("../model/gradeReview");
const router = new express.Router();
const { auth } = require("../middleware/auth");
const {nanoid} = require("nanoid");
const User = require("../model/user");
const ObjectID = require("mongodb").ObjectID;
const sendNotif = require("../routers/notification").sendNotif;

router.get("/grade-review-comment/:reviewId", auth, async (req, res) => {

    try {
        const gradeReview = await GradeReview.findById(req.params.reviewId);
        if (gradeReview) {
            return res.status(200).send(gradeReview);
        }
        return res.status(400).send("Cant not found gradereview");
    } catch (e) {
        console.log(e);
        return res.status(400).send(e);
    }
});

router.post("/grade-review-create", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
        const classroom = await ClassRoom.findById(req.body.classroomId);
        const assignmentCollection = await Assignment.findById(
            classroom.assignments._id
        );
        const index = assignmentCollection.params.findIndex(
            (assignment) => assignment._id == req.body.assignmentCode
        );

        if (index === -1) {
            return res.status(400).send("Failed to create grade review cant find assingment id");
        }
        const assignment = assignmentCollection.params[index];
        const gradeIndex = assignment.gradeList.findIndex(
            (gradeInfo) => gradeInfo.studentId === user.studentId
        );
        if (gradeIndex < 0) {
            return res.status(400).send("Failed to create grade review");
        }
        const gradeReview = new GradeReview()
        classroom.teachers.forEach((teacher) => {
            gradeReview.relatedUserIds.push(teacher);
        })

        gradeReview.expectedGrade = req.body.component.expectedGrade
        gradeReview.comments.push({name: user.name, comment: req.body.component.comment})
        await sendNotif( req.user.notifications, `Bạn vừa yêu cầu phúc khảo cho bài tập ${assignment.name}!` )

        for (const id of gradeReview.relatedUserIds) {
            const notifUser = await User.findById(id)
            await sendNotif( notifUser.notifications, `${user.name} vừa bình luận vào phiếu phúc khảo` )
        }
        gradeReview.relatedUserIds.push(req.user._id);
        assignmentCollection.params[index].gradeList[gradeIndex].reviewId = gradeReview._id

        await gradeReview.save()
        await assignmentCollection.save()
        return res.status(200).send(gradeReview);
    } catch (e) {
        console.log(e);
        return res.status(400).send(e);
    }
});

router.post("/add-grade-review-comment", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
        const gradeReview = await GradeReview.findById(req.body.reviewId)
        if (gradeReview) {
            gradeReview.comments.push({name: user.name, comment: req.body.comment})
            await gradeReview.save()
            for (const id of gradeReview.relatedUserIds) {
                const notifUser = await User.findById(id)
                await sendNotif( notifUser.notifications, `${user.name} vừa bình luận vào phiếu phúc khảo` )
            }
            return res.status(200).send(gradeReview);
        }

        return res.status(400).send("Could no find gread review");
    } catch (e) {
        console.log(e);
        return res.status(400).send(e);
    }
});


module.exports = router;