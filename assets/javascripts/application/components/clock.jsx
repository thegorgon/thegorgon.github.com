var React = require('react');
var $ = require('jquery');

String.prototype.lpad = function(length){
  var accum = this;
  while (accum.length < length) {
    accum = '0' + accum;
  }
  return accum;
}
Number.prototype.lpad = function(length){
  return String(this).lpad(length);
}

class Clock extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      time: new Date()
    };
  }

  componentDidMount() {
    this.interval = setInterval((() => {
      this.setState({
        time:  new Date()
      })
    }).bind(this), 1);
  }

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    var canvas = this.refs.canvas;
    var ctx = canvas.getContext('2d');
    var width = canvas.width;
    var height = canvas.height;
    var r, r1, r2, theta, x, y;
    ctx.clearRect(0, 0, width, height);

    ctx.beginPath();
    ctx.fillStyle = '#333';
    ctx.arc(width * 0.5, height * 0.5, width * 0.25, 0, 2*Math.PI);
    ctx.stroke();

    for (var i = 0; i < 12; i++) {
      r1 = width * 0.20;
      r2 = width * 0.23;
      theta = i * (2 * Math.PI)/12.0 - Math.PI/2.0;
      ctx.beginPath();
      ctx.fillStyle = '#333';
      ctx.moveTo(r1 * Math.cos(theta) + width * 0.5, r1 * Math.sin(theta) + height * 0.5);
      ctx.lineTo(r2 * Math.cos(theta) + width * 0.5, r2 * Math.sin(theta) + height * 0.5);
      ctx.stroke();
    }

    // second hand
    r = width * 0.22;
    theta = (this.state.time.getSeconds() + this.state.time.getMilliseconds() * 0.001) * (2 * Math.PI)/60.0 - Math.PI/2.0;
    x = r * Math.cos(theta) + width * 0.5;
    y = r * Math.sin(theta) + height * 0.5;
    ctx.beginPath();
    ctx.fillStyle = '#333';
    ctx.moveTo(width * 0.5, height * 0.5);
    ctx.lineTo(x, y);
    ctx.stroke();

    // minute hand
    r = width * 0.20;
    theta = this.state.time.getMinutes() * (2 * Math.PI)/60.0 - Math.PI/2.0;
    x = r * Math.cos(theta) + width * 0.5;
    y = r * Math.sin(theta) + height * 0.5;
    ctx.beginPath();
    ctx.fillStyle = '#333';
    ctx.moveTo(width * 0.5, height * 0.5);
    ctx.lineTo(x, y);
    ctx.stroke();

    // hour hand
    r = width * 0.125;
    theta = (this.state.time.getHours() % 12) * (2 * Math.PI)/12.0 - Math.PI/2.0;
    x = r * Math.cos(theta) + width * 0.5;
    y = r * Math.sin(theta) + height * 0.5;
    ctx.beginPath();
    ctx.fillStyle = '#333';
    ctx.moveTo(width * 0.5, height * 0.5);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  render() {
    return (
      <div className="row clock">
        <div className="col s4 offset-s4 digital flow-text">
          <span className="hours">{this.state.time.getHours().lpad(2)}</span>
          <span className="divider">:</span>
          <span className="minutes">{this.state.time.getMinutes().lpad(2)}</span>
          <span className="divider">:</span>
          <span className="seconds">{this.state.time.getSeconds().lpad(2)}</span>
        </div>
        <canvas className="col s8 offset-s2" height="500" width="809" ref="canvas"></canvas>
      </div>
    );
  }
}

module.exports = Clock;