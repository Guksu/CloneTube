import "./db";
import "./models/Video";
import "./models/User";
import app from "./server";

const PORT = 4000;

const handleListening = () =>
  console.log(`✅ Server start http://localhost:${PORT}`);

//callback은 프로그램 시작시 작동되는 함수
app.listen(PORT, handleListening);
