let videos = [
  {
    title: "Hello",
    rating: 5,
    comments: 3,
    createdAt: "Kim",
    views: 2500,
    id: 1,
  },
  {
    title: "Movie",
    rating: 2,
    comments: 25,
    createdAt: "Min",
    views: 3000,
    id: 2,
  },
  {
    title: "Guksu",
    rating: 2,
    comments: 7,
    createdAt: "Jong",
    views: 4000,
    id: 3,
  },
  {
    title: "Noddle",
    rating: 5,
    comments: 7,
    createdAt: "Nim",
    views: 100,
    id: 4,
  },
];
export const trending = (req, res) => {
  res.render("home", { pageTitle: "Home", videos });
};
export const watch = (req, res) => {
  const id = req.params.id;
  const video = videos[id - 1];
  return res.render("watch", { pageTitle: `Watching ${video.title}`, video });
};
export const getEdit = (req, res) => {
  const id = req.params.id;
  const video = videos[id - 1];
  return res.render("edit", { pageTitle: `Editing : ${video.title}`, video });
};
export const postEdit = (req, res) => {
  const id = req.params.id;
  const title = req.body.title;
  videos[id - 1].title = title;
  return res.redirect(`/videos/${id}`);
};
export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "Upload Video" });
};
export const postUpload = (req, res) => {
  const newVideo = {
    title: req.body.title,
    rating: 0,
    comments: 0,
    createdAt: "Kim",
    views: 0,
    id: videos.length + 1,
  };
  videos.push(newVideo);
  return res.redirect("/");
};
