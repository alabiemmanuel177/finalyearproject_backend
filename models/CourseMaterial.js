const CourseMaterialSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  courseId: {
    type: Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  file: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["pdf", "word", "powerpoint"],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const CourseMaterial = mongoose.model("CourseMaterial", CourseMaterialSchema);

module.exports = CourseMaterial;
