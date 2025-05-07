function canv_mousemove(t) {
  (mouseX = t.clientX), (mouseY = t.clientY);
}
function Pixel(t, e) {
  (this.startX = t),
    (this.startY = e),
    (this.x = t),
    (this.y = Math.random() * canvasH),
    (this.xVelocity = 0),
    (this.yVelocity = 0);
}
var pixels = [],
  canv = document.getElementById("canv"),
  ctx = canv.getContext("2d"),
  wordCanv = document.createElement("canvas"),
  wordCtx = wordCanv.getContext("2d"),
  mouseX,
  mouseY,
  words = "NELSON CHANG",
  txt = words.split("\n"),
  fontSize = 110,
  defaultFont = "Kanji",
  canvasW,
  canvasH,
  resolution = 1;
Pixel.prototype.move = function () {
  var t,
    e,
    n = this.startX - this.x,
    o = this.startY - this.y,
    i = Math.sqrt(Math.pow(n, 2) + Math.pow(o, 2)),
    a = 0.01 * i,
    s = Math.atan2(o, n);
  if (mouseX >= 0) {
    var l = this.x - mouseX,
      r = this.y - mouseY,
      c = Math.pow(l, 2) + Math.pow(r, 2);
    (t = Math.min(2500 / c, 5)), (e = Math.atan2(r, l));
  } else (t = 0), (e = 0);
  (this.xVelocity += a * Math.cos(s) + t * Math.cos(e)),
    (this.yVelocity += a * Math.sin(s) + t * Math.sin(e)),
    (this.xVelocity *= 0.9),
    (this.yVelocity *= 0.9),
    (this.x += this.xVelocity),
    (this.y += this.yVelocity);
};
