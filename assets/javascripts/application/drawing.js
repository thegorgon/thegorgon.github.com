var setStyleAttributes = (ctx, options) => {
  var stroke = options.stroke || { width: 1, style: '#000' }
  ctx.strokeStyle = stroke.style;
  ctx.lineWidth = stroke.width;
  ctx.font = options.font;
  var fill = options.fill || { style: '#000' }
  ctx.fillStyle = fill.style;
  var shadow = options.shadow || {
    color: '#333',
    blur: 0,
    offset: {x: 0, y: 0}
  }
  ctx.shadowColor = shadow.color;
  ctx.shadowBlur = shadow.blur;
  ctx.shadowOffsetX = shadow.offset.x;
  ctx.shadowOffsetY = shadow.offset.y;
  var rotate = (options.rotate || 0) * Math.PI/180.0;
  ctx.rotate(rotate);
};

var reset = (ctx) => {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
};

var normalizePoint = (point, ctx) => {
  var canvas = ctx.canvas;
  var normalized = {x: point.x, y: point.y};
  if (point.nX) {
    normalized.x = ctx.canvas.width * point.nX * 0.01;
  }

  if (point.nY) {
    normalized.y = ctx.canvas.height * point.nY * 0.01;
  }

  return normalized;
};

var Drawing = {
  bindDebug: ($, canvas) => {
    $(canvas).click(((event) => {
      var ctx = canvas.getContext('2d');
      var offset = $(canvas).offset();
      var relX = Math.round((event.pageX - offset.left - 10) * canvas.width/$(canvas).width() * 10.0) * 0.1;
      var relY = Math.round((event.pageY - offset.top) * canvas.height/$(canvas).height() * 10.0) * 0.1;
      var nX = Math.round(relX/(canvas.width * 0.001)) * 0.1;
      var nY = Math.round(relY/(canvas.height * 0.001)) * 0.1;
      console.log("Clicked at: { x: ", relX, ", y: ", relY, ", nX:", nX, ", nY: ", nY, " }");
    }));
  },

  text: (ctx, options) => {
    setStyleAttributes(ctx, options);
    var position = normalizePoint(options.position, ctx);
    ctx.fillText(options.text, position.x, position.y);
    reset(ctx);
  },

  line: (ctx, options) => {
    ctx.beginPath();
    setStyleAttributes(ctx, options);
    var start = normalizePoint(options.start, ctx);
    var finish = normalizePoint(options.finish, ctx);
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(finish.x, finish.y);
    ctx.stroke();
    reset(ctx);
  },

  arc: (ctx, options) => {
    ctx.beginPath();
    setStyleAttributes(ctx, options);
    var center = normalizePoint(options.center, ctx);
    var radius = options.radius;
    if (options.nRadius) { radius = ctx.canvas.width * options.nRadius/100.0; }
    ctx.arc(
      center.x,
      center.y,
      radius,
      options.start,
      options.finish
    );
    ctx.stroke();
    reset(ctx);
  },

  ring: (ctx, options) => {
    ctx.beginPath();
    setStyleAttributes(ctx, options);
    var center = normalizePoint(options.center, ctx);
    var radius = options.radius;
    if (options.nRadius) { radius = ctx.canvas.width * options.nRadius/100.0; }
    ctx.arc(
      center.x,
      center.y,
      radius,
      0,
      2 * Math.PI
    );
    ctx.stroke();
    reset(ctx);
  },

  disc: (ctx, options) => {
    ctx.beginPath();
    setStyleAttributes(ctx, options);
    var center = normalizePoint(options.center, ctx);
    var radius = options.radius;
    if (options.nRadius) { radius = ctx.canvas.width * options.nRadius/100.0; }
    ctx.arc(
      center.x,
      center.y,
      radius,
      0,
      2 * Math.PI
    );
    ctx.fill();
    reset(ctx);
  },

  circle: (ctx, options) => {
    ctx.beginPath();
    setStyleAttributes(ctx, options);
    ctx.arc(
      options.center.x,
      options.center.y,
      options.radius,
      0,
      2 * Math.PI
    );
    ctx.fill();
    ctx.stroke();
    reset(ctx);
  },

  rectangle: (ctx, options) => {
    setStyleAttributes(ctx, options);
    if (options.finish) {
      options.width = options.finish.x - options.start.x;
      options.height = options.finish.y - options.start.y;
    }
    ctx.fillRect(
      options.start.x,
      options.start.y,
      options.width,
      options.height
    );
    reset(ctx);
  },

  polygon: (ctx, options) => {
    setStyleAttributes(ctx, options);
    var points = options.points.map((point) => {
      return normalizePoint(point, ctx);
    });
    var start = points[0];
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    points.slice(1).forEach((point) => {
      ctx.lineTo(point.x, point.y);
    });
    ctx.closePath();
    ctx.fill();
    reset(ctx);
  }
}

module.exports = Drawing;
