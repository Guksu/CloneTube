import "./db";
import express from "express";
import morgan from "morgan";
import globalRouter from "./routers/globalRouter";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";

const PORT = 4000;
const app = express();

//req == request obj , res == response obj
app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true })); //이 코드는 express가 form의 value를 이해할 수 있게 해주는 코드다.
app.use("/", globalRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);

const handleListening = () =>
  console.log(`✅ Server start http://localhost:${PORT}`);

//callback은 프로그램 시작시 작동되는 함수
app.listen(PORT, handleListening);
