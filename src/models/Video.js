import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, minlength: 1 },
  fileUrl: { type: String, required: true },
  description: { type: String, required: true, trim: true, maxlength: 150 },
  createdAt: { type: Date, required: true, default: Date.now },
  hashtags: [{ type: String, trim: true }],
  meta: {
    views: { type: Number, default: 0, required: true },
  },
  comments: [
    { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Comment" },
  ],
  //user에게 온 id를 owner로 지정하는 코드
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
});
// middleware는 무조건 model이 생성되기 전에 만들어야 한다.
//아래의 코드는schema로 function을 직접 만든것
videoSchema.static("formatHashtags", function (hashtags) {
  return hashtags
    .split(",")
    .map((word) => (word.startsWith("#") ? word : `#${word}`));
});
const movieModel = mongoose.model("Video", videoSchema);
export default movieModel;
