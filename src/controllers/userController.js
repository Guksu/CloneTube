import User from "../models/User";
import Video from "../models/Video";
import fetch from "node-fetch";
import bcryptjs from "bcryptjs";

export const getJoin = (req, res) => res.render("join", { pageTitle: "Join" });
export const postJoin = async (req, res) => {
  const { name, username, email, password, password2, location } = req.body;

  if (password !== password2) {
    return res.status(400).render("join", {
      pageTitle: "Join",
      errorMessage: "The password is wrong",
    });
  }

  const exists = await User.exists({ $or: [{ name }, { email }] });
  if (exists) {
    // status(400)은 구글크롬에서 id가 생성되지 않아도 생성된걸로 착각하기 때문에 이를 방지하기 위한것이다.
    return res.status(400).render("join", {
      pageTitle: "Join",
      errorMessage: "This username/email is already taken.",
    });
  }

  try {
    await User.create({
      name,
      username,
      email,
      password,
      location,
    });
    return res.redirect("/login");
  } catch (error) {
    return res.status(400).render("join", {
      pageTitle: "Upload Video",
      errorMessage: error._message,
    });
  }
};
export const postLogin = async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username, socialOnly: false });
  if (!user) {
    return res.status(400).render("login", {
      pageTitle: "Login",
      errorMessage: "An account with this uername does not exists.",
    });
  }

  const ok = await bcryptjs.compare(password, user.password);
  if (!ok) {
    return res.status(400).render("login", {
      pageTitle: "Login",
      errorMessage: "Wrong password.",
    });
  }
  req.session.loggedIn = true;
  req.session.user = user;
  return res.redirect("/");
};
export const getLogin = (req, res) =>
  res.render("login", { pageTitle: "Login" });

export const startGithubLogin = (req, res) => {
  const baseUrl = "https://github.com/login/oauth/authorize";
  const config = {
    client_id: process.env.GH_CLIENT,
    allow_signup: false,
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};

export const finishGithubLogin = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();

  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;
    const apiUrl = "https://api.github.com";
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();

    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    );
    if (!emailObj) {
      return res.redirect("/login");
    }
    let user = await User.findOne({ email: emailObj.email });
    if (!user) {
      user = await User.create({
        avatarUrl: userData.avatar_Url,
        name: userData.name,
        username: userData.login,
        email: emailObj.email,
        password: "",
        socialOnly: true,
        location: userData.location,
      });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    return res.redirect("/login");
  }
};

export const logout = (req, res) => {
  req.session.destroy();
  return res.redirect("/");
};

export const getEdit = (req, res) => {
  return res.render("edit-profile", { pageTitle: "Edit Profile" });
};

export const postEdit = async (req, res) => {
  // const {
  //   user: { id },
  // } = req.session;
  // const { name, email, username, location } = req.body;
  // 위 방법과 아래는 같다.
  const {
    session: {
      user: { _id, avatarUrl },
    },
    body: { name, email, username, location },
    file,
  } = req;

  await User.findByIdAndUpdate(_id, {
    avatarUrl: file ? file.path : avatarUrl,
    name,
    email,
    username,
    location,
  });
  //...req.session.user는 user안의 내용을 밖으로 꺼내는코드 ,즉 user를 edit한 내용으로 업데이트해준다.
  req.session.user = {
    ...req.session.user,
    name,
    email,
    username,
    location,
  };
  return res.redirect("/users/edit");
};

export const getChangePassword = (req, res) => {
  if (req.session.user.socialOnly === true) {
    return res.redirect("/");
  }
  return res.render("change-password", { pageTitle: "Change Password" });
};
export const postChangePassword = async (req, res) => {
  const {
    session: {
      user: { _id, password },
    },
    body: { oldPassword, newPassword, newPasswordConfirmation },
  } = req;

  const ok = await bcryptjs.compare(oldPassword, password);
  if (!ok) {
    return res.status(404).render("change-password", {
      pageTitle: "Change Password",
      errorMessage: "OldPassowrd is wrong",
    });
  }

  if (newPassword !== newPasswordConfirmation) {
    return res.status(404).render("change-password", {
      pageTitle: "Change Password",
      errorMessage: "Passowrd confirm is wrong",
    });
  }

  if (oldPassword === newPassword) {
    return res.status(404).render("change-password", {
      pageTitle: "Change Password",
      errorMessage: "OldPassowrd and NewPassword is same",
    });
  }

  const user = await User.findById(_id);
  user.password = newPassword;
  await user.save();
  req.session.user.password = user.password;
  return res.redirect("/users/logout");
};

export const see = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).populate("videos");
  if (!user) {
    return res.status(404).render("404", { pageTitle: "User not found" });
  }

  return res.render("profile", { pageTitle: user.name, user });
};
