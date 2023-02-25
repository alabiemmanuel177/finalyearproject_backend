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

function addSocketConnectionToReq(io) {
  return async (req, res, next) => {
    req.IOconn = io;
    next();
  };
}

const routes = ({ app, io }) => {
  app.use("/", AuthRouter);
  app.use("/student", StudentRouter);
  app.use("/admin", AdminRouter);
  app.use("/lecturer", LecturerRouter);
  app.use("/course", CourseRouter);
  app.use("/department", DepartmentRouter);
  app.use("/classpost", ClassPostRouter);
  app.use(
    "/coursematerial",
    addSocketConnectionToReq(io),
    CourseMaterialRouter
  );
  app.use("/classcomment", ClassComment);
  app.use("/assignment", AssignmentRouter);
  app.use("/class", ClassRouter);
};

module.exports = { routes };
