import Video from "../models/Video";

//find의 요소는 callback이므로 가장 마지막에 실행된다
//Video.find({}, (error, videos) => {});
//await는 find가 callback을 필요하지 않다고 알려준다. await는 database에서 결과값을 받을때 까지 기다린다.
//즉 await를 사용하면 코드의 흐름대로 사용 가능하다.  --> 쓰레드와 유사한 개념

export const home = async (req, res) => {
  try {
    const videos = await Video.find({}).sort({ createdAt: "desc" });
    res.render("home", { pageTitle: "Home", videos });
  } catch {
    return res.render("server-error");
  }
};

export const watch = async (req, res) => {
  const id = req.params.id;
  const video = await Video.findById(id);
  if (video === null) {
    return res.render("404", { pageTitle: "Video not found" });
  }
  return res.render("watch", { pageTitle: video.title, video: video });
};

export const getEdit = async (req, res) => {
  const id = req.params.id;
  const video = await Video.findById(id);
  if (video === null) {
    return res.render("404", { pageTitle: "Video not found" });
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
  const { title, description, hashtags } = req.body;
  //아래의 title은 java에서 constructor 생성과 같이 this.title = title과 같은 의미이다.
  //save는 promise를 return해준다. db에 저장될 때 까지 기디란다.
  //Video.create는 const video = new Video()와 await video.save();를 합친 코드이다.
  try {
    await Video.create({
      title,
      description,
      hashtags: Video.formatHashtags(hashtags),
    });
    return res.redirect("/");
  } catch (error) {
    return res.render("upload", {
      pageTitle: "Upload Video",
      errorMessage: error._message,
    });
  }
};

export const deleteVideo = async (req, res) => {
  // const { id } = req.params;  와 const id = req.params.id 와 같은 표현
  const { id } = req.params;
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
    });
  }
  return res.render("search", { pageTitle: "Search", videos });
};
