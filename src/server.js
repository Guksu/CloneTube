import express from "express";
import morgan from "morgan";
import session from "express-session";
import flash from "express-flash";
import MongoStore from "connect-mongo";
import rootRouter from "./routers/rootRouter";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";
import { localMiddlewara } from "./middlewares";
import apiRouter from "./routers/apiRouter";

const app = express();

//req == request obj , res == response obj
app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true })); //이 코드는 express가 form의 value를 이해할 수 있게 해주는 코드다.
app.use(express.json());

// express-session을 사용하여 cookie를 서버가 저장할 수 있게 해준다
// 또한 session을 db에 저장하기 위하여 MongoStore을 사용한다.
// resave와  saveUninitialized가 true이면 서버에 접속할 때 마다 쿠키가 db에저장된다.
app.use(
  session({
    secret: process.env.COOKIE_SEC,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DB_URL }),
  })
);

//session이 없으면 localMiddlewara가 작동하지 않는다.(locals는 session을 통해 생성되었기 때문)
app.use(flash());
app.use(localMiddlewara);

//static은 browser에게 폴더를 볼 수 있게 해준다
app.use("/uploads", express.static("uploads"));
app.use("/assets", express.static("assets"));
app.use("/", rootRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);
app.use("/api", apiRouter);

export default app;
