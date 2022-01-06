const mongoose = require("mongoose");
const { number } = require("sharp/lib/is");

const gradeReviewSchema = new mongoose.Schema(
  {
    expectedGrade: Number,
    relatedUserIds: [
      {
          type: mongoose.Schema.Types.ObjectId,
          default: [],
      },
    ],
    comments: [
      {
        name: String,
        comment: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

gradeReviewSchema.pre("save", async function (next) {
  const classroom = this;

  console.log("update GradeReview!");

  next();
});

const GradeReview = mongoose.model("GradeReview", gradeReviewSchema);

module.exports = GradeReview;
