const Teacher = require("../models/Teacher");

/*
  Assign / Update Teacher:
  - department
  - subject
  - years
*/

exports.assignTeacher = async (req, res) => {
  try {
    const { teacherId, department, subjectId, years } = req.body;

    /* ===== STRONG VALIDATION ===== */
    if (
      !teacherId ||
      !department ||
      !subjectId ||
      !Array.isArray(years) ||
      years.length === 0
    ) {
      return res.status(400).json({ message: "Invalid assignment data" });
    }

    /* ===== UPDATE TEACHER ===== */
    const teacher = await Teacher.findByIdAndUpdate(
      teacherId,
      {
        department,
        subject: subjectId, // string OR ObjectId (as per schema)
        years: years        // MUST be array
      },
      { new: true }
    );

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    res.json({
      message: "Teacher assigned successfully",
      teacher: {
        id: teacher._id,
        department: teacher.department,
        subject: teacher.subject,
        years: teacher.years
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Assignment failed" });
  }
};
