const express = require("express");
const ClassRoom = require("../model/classroom");
const Assignment = require("../model/assignment");
const router = new express.Router();
const auth = require("../middleware/auth");
const { nanoid } = require("nanoid");
const User = require("../model/user");
const sendNotif = require("../routers/notification").sendNotif;
const ObjectID = require("mongodb").ObjectID;

// MARK: Assignment

//get all assignments
router.get("/assignments/:classroomId", auth, async (req, res) => {
  try {
    const classroom = await ClassRoom.findById(req.params.classroomId);
    if (classroom) {
      code = classroom.assignments._id;
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

        await sendNotif( req.user.notifications, `Thêm bài tập ${newAssignment.name} cho lớp ${classroom.name} thành công!` )

        return res.status(201).send(assignment);
      }
      return res.status(400).send({
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
      return res.status(400).send({
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
      push

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

//set grade list for assigment
router.post("/set-grade-list", auth, async (req, res) => {
  try {
    const classroom = await ClassRoom.findById(req.body.classroomId);
    if (!classroom) {
      return res.status(400).send("No class found!");
    }

    const assignmentCollection = await Assignment.findById(
      classroom.assignments._id
    );

    const data = req.body;

    const index = assignmentCollection.params.findIndex(
      (assignment) => assignment._id == data.assignmentCode
    );

    if (index === -1 || index == undefined) {
      return res.status(400).send("No assignment found!");
    }

    // assignmentCollection.params[index].gradeList = data.gradeList;
    data.gradeList.forEach((gradeInfo) => {
      const gradeIndex = assignmentCollection.params[index].gradeList.findIndex(
        (grade) => grade.studentId == gradeInfo.studentId
      );
      if (gradeIndex === -1 || gradeIndex == undefined) {
        assignmentCollection.params[index].gradeList =
          assignmentCollection.params[index].gradeList.concat(gradeInfo);
      } else {
        assignmentCollection.params[index].gradeList[gradeIndex].grade =
          gradeInfo.grade;
      }
    });
    await assignmentCollection.save();

    const students = [];

    for (let i = 0; i < classroom.students.length; i++) {
      const user = await User.findById(classroom.students[i]);
      students.push({
        studentId: user.studentId,
        grade: -1,
      });
    }

    classroom.unmappedStudents.forEach((student) => {
      students.push({
        studentId: student.studentId,
        grade: -1,
      });
    });
    const gradeList = assignmentCollection.params[index].gradeList;

    students.sort(function (a, b) {
      return a.studentId - b.studentId;
    });
    students.forEach(function (part, stIndex) {
      const gradeIndex = gradeList.findIndex(
        (gradeInfo) => gradeInfo.studentId === part.studentId
      );
      if (gradeIndex >= 0) {
        this[stIndex].grade = gradeList[gradeIndex].grade;
      }
    }, students);

    return res.status(201).send(students);
    
  } catch (e) {
    console.log("Set grade list fail fail:", req.body, e);
    return res.status(400).send(e);
  }
});

//get grade list for assigment
router.get(
  "/grade-list/:classroomId/:assignmentCode",
  auth,
  async (req, res) => {
    try {
      const classroom = await ClassRoom.findById(req.params.classroomId);
      if (!classroom) {
        return res.status(400).send("No class found!");
      }

      const assignmentCollection = await Assignment.findById(
        classroom.assignments._id
      );

      const data = req.params;

      const index = assignmentCollection.params.findIndex(
        (assignment) => assignment._id == data.assignmentCode
      );

      if (index === -1 || index == undefined) {
        return res.status(400).send("No assignment found!");
      }

      const students = [];

      for (let i = 0; i < classroom.students.length; i++) {
        const user = await User.findById(classroom.students[i]);
        students.push({
          studentId: user.studentId,
          grade: -1,
        });
      }

      classroom.unmappedStudents.forEach((student) => {
        students.push({
          studentId: student.studentId,
          grade: -1,
        });
      });
      const gradeList = assignmentCollection.params[index].gradeList;

      students.sort(function (a, b) {
        return a.studentId - b.studentId;
      });
      students.forEach(function (part, stIndex) {
        const gradeIndex = gradeList.findIndex(
          (gradeInfo) => gradeInfo.studentId === part.studentId
        );
        if (gradeIndex >= 0) {
          this[stIndex].grade = gradeList[gradeIndex].grade;
        }
      }, students);

      return res.status(201).send(students);
    } catch (e) {
      console.log("Set grade list fail fail:", req.body, e);
      return res.status(400).send(e);
    }
  }
);

//set student list
router.post("/set-student-list", auth, async (req, res) => {
  try {
    const studentList = req.body.studentList;
    const classroom = await ClassRoom.findById(req.body.classroomId);
    if (!classroom) {
      return res.status(400).send("No class found!");
    }

    const students = [];
    for (let i = 0; i < classroom.students.length; i++) {
      const user = await User.findById(classroom.students[i]);
      students.push({
        studentId: user.studentId,
      });
    }

    const unmappedStudents = classroom.unmappedStudents;
    async function updateRealname(studentInfo) {
      const user = await User.findByStudentId(studentInfo.studentId);
      user.realName = studentInfo.name;
      await user.save();
    }

    async function findSystemUser(studentInfo) {
      const user = await User.findByStudentId(studentInfo.studentId);
      if (user !== undefined) {
        updateRealname(studentInfo);
        classroom.students.push(user._id);
        return;
      }
      unmappedStudents.push(studentInfo);
    }

    for (const studentInfo of studentList) {
      const index = students.findIndex(
        (student) => student.studentId == studentInfo.studentId
      );
      if (index === -1 || index == undefined) {
        const unmappedIndex = unmappedStudents.findIndex(
          (student) => student.studentId == studentInfo.studentId
        );
        if (unmappedIndex === -1 || unmappedIndex == undefined) {
          await findSystemUser(studentInfo);
          // unmappedStudents.push(studentInfo);
        } else {
          unmappedStudents[unmappedIndex].name = studentInfo.name;
        }
      } else {
        await updateRealname(studentInfo);
      }
    }

    classroom.unmappedStudents = unmappedStudents; //unmappedStudents;
    await classroom.save();

    return res.status(201).send(classroom);
  } catch (e) {
    console.log("Set student list fail:", req.body, e);
    return res.status(400).send(e);
  }
});

//get grade list
router.get("/get-grade-board/:classroomId", auth, async (req, res) => {
  try {
    const classroom = await ClassRoom.findById(req.params.classroomId);
    if (!classroom) {
      return res.status(400).send("No class found!");
    }

    const students = [];

    for (let i = 0; i < classroom.students.length; i++) {
      const user = await User.findById(classroom.students[i]);
      students.push({
        studentId: user.studentId,
        name: user.realName == undefined ? user.name : user.realName,
        assignmentGrade: [],
        total: 0,
      });
    }

    classroom.unmappedStudents.forEach((student) => {
      students.push({
        studentId: student.studentId,
        name: student.name,
        assignmentGrade: [],
        total: 0,
      });
    });

    students.sort(function (a, b) {
      return a.studentId - b.studentId;
    });

    const assignments = await Assignment.findById(classroom.assignments._id);

    const allGradeList = [];

    assignments.params.forEach((assignment) => {
      const gradeList = assignment.gradeList;
      allGradeList.push(gradeList);
    });

    students.forEach(function (part, index) {
      allGradeList.forEach((gradeList) => {
        const gradeIndex = gradeList.findIndex(
          (gradeInfo) => gradeInfo.studentId === part.studentId
        );
        if (gradeIndex >= 0) {
          var reviewId = null
          if (gradeList[gradeIndex].reviewId) {reviewId =  gradeList[gradeIndex].reviewId}

          this[index].assignmentGrade.push({grade: gradeList[gradeIndex].grade, reviewId: reviewId});
          this[index].total += gradeList[gradeIndex].grade;
        } else {
          this[index].assignmentGrade.push("");
        }
      });
    }, students);

    return res.status(201).send(students);
  } catch (e) {
    console.log("Get grade list fail:", req.body, e);
    return res.status(400).send(e);
  }
});

module.exports = router;
