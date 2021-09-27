import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, minlength: 1 },
  description: { type: String, required: true, trim: true, maxlength: 150 },
  createdAt: { type: Date, required: true, default: Date.now },
  hashtags: [{ type: String, trim: true }],
  meta: {
    views: { type: Number, default: 0, required: true },
    rating: { type: Number, default: 0, required: true },
  },
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
