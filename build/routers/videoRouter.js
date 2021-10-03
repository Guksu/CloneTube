"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

var _videoController = require("../controllers/videoController");

var _middlewares = require("../middlewares");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var videoRouter = _express["default"].Router(); // :id 는 변수를 뜻한다. :가 있어야 express는 변수라 인식한다.
//(\\d+) 는 id를 숫자로만 받기 위한 정규표현식이다


videoRouter.get("/:id([0-9a-f]{24})", _videoController.watch);
videoRouter.route("/:id([0-9a-f]{24})/edit").all(_middlewares.protecetMiddleware).get(_videoController.getEdit).post(_videoController.postEdit);
videoRouter.route("/:id([0-9a-f]{24})/delete").all(_middlewares.protecetMiddleware).get(_videoController.deleteVideo);
videoRouter.route("/upload").all(_middlewares.protecetMiddleware).get(_videoController.getUpload).post(_middlewares.videoUpload.single("video"), _videoController.postUpload);
var _default = videoRouter;
exports["default"] = _default;