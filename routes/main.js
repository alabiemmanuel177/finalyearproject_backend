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
  app.use("/course", addSocketConnectionToReq(io), CourseRouter);
  app.use("/department", addSocketConnectionToReq(io), DepartmentRouter);
  app.use("/classpost", addSocketConnectionToReq(io), ClassPostRouter);
  app.use(
    "/coursematerial",
    addSocketConnectionToReq(io),
    CourseMaterialRouter
  );
  app.use("/classcomment", addSocketConnectionToReq(io), ClassComment);
  app.use("/assignment", addSocketConnectionToReq(io), AssignmentRouter);
  app.use("/class", ClassRouter);
};

module.exports = { routes };
