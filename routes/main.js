// const helpers = require("../helpers/auth.guard");
const AdminRouter = require("./admin");
const LecturerRouter = require("./lecturer");
const StudentRouter = require("./student");
const AuthRouter = require("./auth");
const CourseRouter = require("./course");
const DepartmentRouter = require("./department");
const ClassPostRouter = require("./classpost");
const ClassComment = require("./classcomment");
const AssignmentRouter = require("./assignment");
const AssignmentAnswerRouter = require("./assignmentanswer");
const GroupRouter = require("./group");
const mainRoute = require("express").Router();

mainRoute.use("/", AuthRouter);
mainRoute.use("/student", StudentRouter);
mainRoute.use("/admin", AdminRouter);
mainRoute.use("/lecturer", LecturerRouter);
mainRoute.use("/course", CourseRouter);
mainRoute.use("/department", DepartmentRouter);
mainRoute.use("/classpost", ClassPostRouter);
mainRoute.use("/classcomment", ClassComment);
mainRoute.use("/assignment", AssignmentRouter);
mainRoute.use("/assignmentanswers", AssignmentAnswerRouter);
mainRoute.use("/group", GroupRouter);

module.exports = mainRoute;
