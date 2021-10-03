"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

var _morgan = _interopRequireDefault(require("morgan"));

var _expressSession = _interopRequireDefault(require("express-session"));

var _expressFlash = _interopRequireDefault(require("express-flash"));

var _connectMongo = _interopRequireDefault(require("connect-mongo"));

var _rootRouter = _interopRequireDefault(require("./routers/rootRouter"));

var _userRouter = _interopRequireDefault(require("./routers/userRouter"));

var _videoRouter = _interopRequireDefault(require("./routers/videoRouter"));

var _middlewares = require("./middlewares");

var _apiRouter = _interopRequireDefault(require("./routers/apiRouter"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var app = (0, _express["default"])(); //req == request obj , res == response obj

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");
app.use((0, _morgan["default"])("dev"));
app.use(_express["default"].urlencoded({
  extended: true
})); //이 코드는 express가 form의 value를 이해할 수 있게 해주는 코드다.

app.use(_express["default"].json()); // express-session을 사용하여 cookie를 서버가 저장할 수 있게 해준다
// 또한 session을 db에 저장하기 위하여 MongoStore을 사용한다.
// resave와  saveUninitialized가 true이면 서버에 접속할 때 마다 쿠키가 db에저장된다.

app.use((0, _expressSession["default"])({
  secret: process.env.COOKIE_SEC,
  resave: false,
  saveUninitialized: false,
  store: _connectMongo["default"].create({
    mongoUrl: process.env.DB_URL
  })
})); //session이 없으면 localMiddlewara가 작동하지 않는다.(locals는 session을 통해 생성되었기 때문)

app.use((0, _expressFlash["default"])());
app.use(_middlewares.localMiddlewara); //static은 browser에게 폴더를 볼 수 있게 해준다

app.use("/uploads", _express["default"]["static"]("uploads"));
app.use("/assets", _express["default"]["static"]("assets"));
app.use("/", _rootRouter["default"]);
app.use("/videos", _videoRouter["default"]);
app.use("/users", _userRouter["default"]);
app.use("/api", _apiRouter["default"]);
var _default = app;
exports["default"] = _default;