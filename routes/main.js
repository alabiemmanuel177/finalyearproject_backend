const AdminRouter = require("./admin");
const LecturerRouter = require("./lecturer");
const StudentRouter = require("./student");
const AuthRouter = require("./auth");
const CourseRouter = require("./course");
const DepartmentRouter = require("./department");
const SchoolRouter = require("./school");
const ClassPostRouter = require("./classpost");
const CourseMaterialRouter = require("./coursematerial");
const CourseMaterialFileRouter = require("./coursematerialfile");
const ClassComment = require("./classcomment");
const AssignmentRouter = require("./assignment");
const AssignmentAnswerRouter = require("./assignmentanswer");
const AssignmentAnswerFileRouter = require("./assignmentanswerfile");
const ClassRouter = require("./class");
const NoticeRouter = require("./notice");
const GroupRouter = require("./group");

/**
* @brief Adds a socket connection to req. IOconn. This is a middleware function to allow us to add an I / O connection to req
* @param io The I / O connection to add
* @return { Function } The middleware function that when called will add the I / O connection to req. IO
*/
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
  app.use("/school", addSocketConnectionToReq(io), SchoolRouter);
  app.use("/classpost", addSocketConnectionToReq(io), ClassPostRouter);
  app.use(
    "/coursematerial",
    addSocketConnectionToReq(io),
    CourseMaterialRouter
  );
  app.use(
    "/coursematerialfile",
    addSocketConnectionToReq(io),
    CourseMaterialFileRouter
  );
  app.use("/classcomment", addSocketConnectionToReq(io), ClassComment);
  app.use("/assignment", addSocketConnectionToReq(io), AssignmentRouter);
  app.use(
    "/assignment-answer",
    addSocketConnectionToReq(io),
    AssignmentAnswerRouter
  );
  app.use(
    "/assignment-answerfile",
    addSocketConnectionToReq(io),
    AssignmentAnswerFileRouter
  );
  app.use("/class", addSocketConnectionToReq(io), ClassRouter);
  app.use("/notice", addSocketConnectionToReq(io), NoticeRouter);
  app.use("/group", addSocketConnectionToReq(io), GroupRouter);
};

module.exports = { routes };
