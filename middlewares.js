export const localMiddlewara = (req, res, next) => {
  // 아래의 if는 res.locals.loggedIn = Bollean(res.session.loggedIn)과 같은 의미이다
  if (req.session.loggedIn) {
    res.locals.loggedIn = true;
  }
  res.locals.siteName = "Wetube";
  res.locals.loggedInUser = req.session.user;
  next();
};
