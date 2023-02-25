const AdminRouter = require("./admin");
const LecturerRouter = require("./lecturer");
const StudentRouter = require("./student");
const AuthRouter = require("./auth");
const CourseRouter = require("./course");
const DepartmentRouter = require("./department");
const ClassPostRouter = require("./classpost");
const CourseMaterialRouter = require("./coursematerial");
const ClassComment = require("./classcomment");
const AssignmentRouter = require("./assignment");
const ClassRouter = require("./class");
const mainRoute = require("express").Router();

mainRoute.use("/", AuthRouter);
mainRoute.use("/student", StudentRouter);
mainRoute.use("/admin", AdminRouter);
mainRoute.use("/lecturer", LecturerRouter);
mainRoute.use("/course", CourseRouter);
mainRoute.use("/department", DepartmentRouter);
mainRoute.use("/classpost", ClassPostRouter);
mainRoute.use("/coursematerial", CourseMaterialRouter);
mainRoute.use("/classcomment", ClassComment);
mainRoute.use("/assignment", AssignmentRouter);
mainRoute.use("/class", ClassRouter);

module.exports = mainRoute;