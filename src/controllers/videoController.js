import Video from "../models/Video";
import Comment from "../models/Comment";
import User from "../models/User";

//find의 요소는 callback이므로 가장 마지막에 실행된다
//Video.find({}, (error, videos) => {});
//await는 find가 callback을 필요하지 않다고 알려준다. await는 database에서 결과값을 받을때 까지 기다린다.
//즉 await를 사용하면 코드의 흐름대로 사용 가능하다.  --> 쓰레드와 유사한 개념

export const home = async (req, res) => {
  const videos = await Video.find({})
    .sort({ createdAt: "desc" })
    .populate("owner");
  return res.render("home", { pageTitle: "Home", videos });
};

export const watch = async (req, res) => {
  const id = req.params.id;
  //populate를 사용하면 해당 인자에 해당하는 것을 불러온다.
  //즉 , owner는 User schema와 연결했으므로 User의 객체를 가져온다.
  // console.log(viedo)로 확인하면 차이를 쉽게 알 수 있음
  const video = await Video.findById(id).populate("owner").populate("comments");
  if (video === null) {
    return res.status(404).render("404", { pageTitle: "Video not found" });
  }
  return res.render("watch", {
    pageTitle: video.title,
    video: video,
  });
};

export const getEdit = async (req, res) => {
  const id = req.params.id;
  const video = await Video.findById(id);
  if (video === null) {
    return res.render("404", { pageTitle: "Video not found" });
  }
  //video.owner는 object이고 req.session.user._id는 String이므로 둘의 type을 같게 해줘야한다.
  if (String(video.owner) !== String(req.session.user._id)) {
    req.flash("error", "Not authorized");
    return res.status(403).redirect("/");
  }
  return res.render("edit", {
    pageTitle: `Editing : ${video.title}`,
    video: video,
  });
};

export const postEdit = async (req, res) => {
  const id = req.params.id;
  const { title, description, hashtags } = req.body;
  //video를 찾기 위해서 Video.findById(id)를 사용하는것보다 아래의 코드를 사용하여 true,false를 확인하는것이 더 좋다
  const video = await Video.exists({ _id: id });
  if (video === null) {
    return res.render("404", { pageTitle: "Video not found" });
  }
  if (String(video.owner) !== String(req.session.user._id)) {
    return res.status(403).redirect("/");
  }

  await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: Video.formatHashtags(hashtags),
  });
  return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "Upload Video" });
};

export const postUpload = async (req, res) => {
  const {
    user: { _id },
  } = req.session;
  const file = req.file;
  const { title, description, hashtags } = req.body;
  //아래의 title은 java에서 constructor 생성과 같이 this.title = title과 같은 의미이다.
  //save는 promise를 return해준다. db에 저장될 때 까지 기디란다.
  //Video.create는 const video = new Video()와 await video.save();를 합친 코드이다.
  try {
    const newVideo = await Video.create({
      title,
      description,
      fileUrl: file.path,
      owner: _id,
      hashtags: Video.formatHashtags(hashtags),
    });
    const user = await User.findById(_id);
    user.videos.push(newVideo._id);
    user.save();
    return res.redirect("/");
  } catch (error) {
    return res.status(400).render("upload", {
      pageTitle: "Upload Video",
      errorMessage: error._message,
    });
  }
};

export const deleteVideo = async (req, res) => {
  // const { id } = req.params;  와 const id = req.params.id 와 같은 표현
  const { id } = req.params;
  const video = await Video.findById(id);
  if (String(video.owner) !== String(req.session.user._id)) {
    return res.status(403).redirect("/");
  }
  await Video.findByIdAndDelete(id);
  return res.redirect("/");
};

export const search = async (req, res) => {
  const { keyword } = req.query;
  let videos = [];
  if (keyword) {
    videos = await Video.find({
      title: {
        // 정규표현식으로 keyword를 포함한 모든것을 찾게하는 코드
        $regex: new RegExp(keyword, "i"),
      },
    }).populate("owner");
  }
  return res.render("search", { pageTitle: "Search", videos });
};

//렌더링 하는게 없는 경우 status 대신 sendStatus를 사용해야한다.
export const registerView = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404);
  }
  video.meta.views = video.meta.views + 1;
  await video.save();
  return res.sendStatus(200);
};

export const createComment = async (req, res) => {
  const {
    session: { user },
    body: { text },
    params: { id },
  } = req;
  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404);
  }
  const comment = await Comment.create({
    text,
    owner: user._id,
    video: id,
  });
  video.comments.push(comment._id);
  video.save();
  return res.sendStatus(201);
};
