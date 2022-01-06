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
        isFinal: {
            type: Boolean,
            default: false
        },
        params: [
            {
                name: String,
                point: Number,
                isFinal: {
                    type: Boolean,
                    default: false
                },
                gradeList: [
                    {
                        studentId: String,
                        grade: Number,
                        reviewId: {type: String, required: false},
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
