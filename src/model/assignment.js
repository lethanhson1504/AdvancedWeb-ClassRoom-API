const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    classroomId: {
      type: String,
      required: true,
    },
    total: {
      type: Number,
      default: 100
    },
    sum: {
      type: Number,      
      default: 0
    },
    params: [
      {
        code: String,
        name: String,
        point: Number,
        gradeList: [
          {
            id: Number,
            grade: Number,
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
  }
);

assignmentSchema.pre("save", async function (next) {
  const assignment = this;

  console.log("Change update assignment!");

  next();
});

const Assignment = mongoose.model("Assignment", assignmentSchema);

module.exports = Assignment;
