const express = require("express");
const ClassRoom = require("../model/classroom");
const Assignment = require("../model/assignment");
const router = new express.Router();
const auth = require("../middleware/auth");
const { nanoid } = require("nanoid");
const User = require("../model/user");
const ObjectID = require("mongodb").ObjectID;

// MARK: Assignment

//get all assignments
router.get("/assignments", auth, async (req, res) => {
  try {
    const classroom = await ClassRoom.findById(req.body.classroomId);
    if (classroom) {
      code = classroom.assignments._id;
      console.log("Assignment", code);
      result = await Assignment.findById(code);

      if (result) {
        return res.status(200).send(result);
      }
      return res.status(200).send({});
    }
    return res.status(400).send("No class found!");
  } catch (e) {
    console.log(e);
    return res.status(400).send(e);
  }
});

//create new assignment
router.post("/create-assignment", auth, async (req, res) => {
  try {
    const classroom = await ClassRoom.findById(req.body.classroomId);
    if (classroom) {
      const data = req.body.assignment;
      const newAssignment = {
        name: data.name,
        point: data.point,
        gradeList: [],
      };

      const assignment = await Assignment.findById(classroom.assignments._id);

      let sum = Number(assignment.sum);
      const remain = Number(assignment.total) - sum;

      if (remain >= Number(data.point)) {
        //update Sum
        assignment.sum = sum + Number(newAssignment.point);

        assignment.params = assignment.params.concat(newAssignment);

        await assignment.save();
        return res.status(201).send(assignment);
      }
      return res
        .status(400)
        .send({
          msg: "Failed to create assignment",
          remain: remain,
          addPoint: data.point,
        });
    }
    return res.status(400).send("No class found!");
  } catch (e) {
    console.log("Create assignment failed:", req.body, e);
    return res.status(400).send(e);
  }
});

//set total point
router.post("/set-assignment-total-point", auth, async (req, res) => {
  try {
    const classroom = await ClassRoom.findById(req.body.classroomId);
    if (classroom) {
      const assignment = await Assignment.findById(classroom.assignments._id);
      if (req.body.total >= assignment.sum) {
        assignment.total = req.body.total;
        await assignment.save();
        return res.status(201).send(assignment);
      }
      return res
        .status(400)
        .send({
          msg: "Failed",
          sum: classroom.assignments.sum,
          newTotal: req.body.total,
        });
    }
    return res.status(400).send("No class found!");
  } catch (e) {
    console.log("Set total point fail:", req.body, e);
    return res.status(400).send(e);
  }
});

//reorder assignments of class
router.post("/reorder-assignments", auth, async (req, res) => {
  try {
    const classroom = await ClassRoom.findById(req.body.classroomId);
    if (classroom) {
      const assignment = await Assignment.findById(classroom.assignments._id);
      const reorderedParams = req.body.assignments;
      assignment.params = reorderedParams;

      await assignment.save();
      return res.status(201).send(assignment);
    }
    return res.status(400).send("No class found!");
  } catch (e) {
    console.log("Reorder fail:", req.body, e);
    return res.status(400).send(e);
  }
});

//update assignment of class
router.post("/update-assignment", auth, async (req, res) => {
  try {
    const classroom = await ClassRoom.findById(req.body.classroomId);
    if (classroom) {
      const assignmentCollection = await Assignment.findById(
        classroom.assignments._id
      );

      const data = req.body.assignment;
      const index = assignmentCollection.params.findIndex(
        (assignment) => assignment._id == req.body.assignmentCode
      );
      if (index === -1) {
        return res.status(400).send("No assignment found!");
      }

      let sum =
        Number(assignmentCollection.sum) -
        Number(assignmentCollection.params[index].point);

      const remain = Number(assignmentCollection.total) - sum;

      if (remain >= data.point) {
        assignmentCollection.params[index].name = data.name;
        assignmentCollection.params[index].point = data.point;
        assignmentCollection.sum = sum + Number(data.point);

        await assignmentCollection.save();
        return res.status(201).send(assignmentCollection);
      }

      return res
        .status(400)
        .send({ msg: "Failed", remain: remain, addPoint: data.point });
    }
    return res.status(400).send("No class found!");
  } catch (e) {
    console.log("Update fail:", req.body, e);
    return res.status(400).send(e);
  }
});

//delete assignment of class by id
router.post("/delete-assignment", auth, async (req, res) => {
  try {
    const classroom = await ClassRoom.findById(req.body.classroomId);
    if (classroom) {
      const assignmentCollection = await Assignment.findById(
        classroom.assignments._id
      );

      const data = req.body.assignment;

      const index = assignmentCollection.params.findIndex(
        (assignment) => assignment._id == req.body.assignmentCode
      );
        console.log(index)
      if (index === -1 || index == undefined) {
        return res.status(400).send("No assignment found!");
      }

      let sum =
        assignmentCollection.sum - assignmentCollection.params[index].point;

        assignmentCollection.params = assignmentCollection.params.slice(index, 1);
      assignmentCollection.sum = sum;

      await assignmentCollection.save();
      return res.status(201).send(assignmentCollection);
    }
    return res.status(400).send("No class found!");
  } catch (e) {
    console.log("Delete fail:", req.body, e);
    return res.status(400).send(e);
  }
});
module.exports = router;
