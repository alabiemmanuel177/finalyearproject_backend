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
const NoticeRouter = require("./notice");
const GroupRouter = require("./group");

function addSocketConnectionToReq(io) {
  return async (req, res, next) => {
    req.IOconn = io;
    next();
  };
}

const routes = ({ app, io }) => {
  app.use("/", addSocketConnectionToReq(io), AuthRouter);
  app.use("/student", addSocketConnectionToReq(io), StudentRouter);
  app.use("/admin", addSocketConnectionToReq(io), AdminRouter);
  app.use("/lecturer", addSocketConnectionToReq(io), LecturerRouter);
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
  app.use("/class", addSocketConnectionToReq(io), ClassRouter);
  app.use("/notice", addSocketConnectionToReq(io), NoticeRouter);
  app.use("/group", addSocketConnectionToReq(io), GroupRouter);
};

module.exports = { routes };
