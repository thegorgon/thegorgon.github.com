var React = require('react');
var $ = require('jquery');
var Drawing = require('../drawing')

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
    var style = window.location.search;
    if (['retro', 'basic', 'movado'].indexOf(style) === -1) {
      style = 'basic'
    }
    this.state = {
      time: new Date(),
      style: style
    };
  }

  componentDidMount() {
    this.interval = setInterval(() => {
      this.setState({
        time: new Date()
      })
    }, 1);
    Drawing.bindDebug($, this.refs.canvas);
  }

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    var canvas = this.refs.canvas;
    var seconds = this.state.time.getSeconds();
    if (this.state.style != 'retro') {
      seconds += this.state.time.getMilliseconds() * 0.001;
    }
    var minutes = this.state.time.getMinutes() + seconds/60.0;
    var hours = this.state.time.getHours() + minutes/60.0;
    var data = {
      ctx: canvas.getContext('2d'),
      width: canvas.width,
      height: canvas.height,
      hours: hours,
      minutes: minutes,
      seconds: seconds
    }
    Drawing.clear(data.ctx);

    switch (this.state.style) {
      case 'basic':
        this.renderBasicClock(data); break;
      case 'retro':
        this.renderRetroClock(data); break;
      case 'movado':
        this.renderMovadoClock(data); break;
      default:
        console.log('ERROR: INVALID STYLE ', this.state.style);
    }
  }

  renderBasicClock(data) {
    var r, r1, r2, theta, x, y;
    Drawing.ring(data.ctx, {
      stroke: { nWidth: 0.1 },
      center: { nX: 50, nY: 50 },
      nRadius: 25
    });

    for (var i = 0; i < 12; i++) {
      r1 = data.width * 0.20;
      r2 = data.width * 0.23;
      theta = i * (2 * Math.PI)/12.0 - Math.PI/2.0;
      Drawing.line(data.ctx, {
        stroke: { nWidth: 0.1 },
        start: {
          x: r1 * Math.cos(theta) + data.width * 0.5,
          y: r1 * Math.sin(theta) + data.height * 0.5
        },
        finish: {
          x: r2 * Math.cos(theta) + data.width * 0.5,
          y: r2 * Math.sin(theta) + data.height * 0.5
        }
      });
    }

    // second hand
    r = data.width * 0.22;
    theta = data.seconds * (2 * Math.PI)/60.0 - Math.PI/2.0;
    Drawing.line(data.ctx, {
      stroke: { nWidth: 0.1 },
      start: {
        x: data.width * 0.5,
        y: data.height * 0.5
      },
      finish: {
        x: r * Math.cos(theta) + data.width * 0.5,
        y: r * Math.sin(theta) + data.height * 0.5
      }
    });

    // minute hand
    r = data.width * 0.20;
    theta = data.minutes * (2 * Math.PI)/60.0 - Math.PI/2.0;
    Drawing.line(data.ctx, {
      stroke: { nWidth: 0.1 },
      start: {
        x: data.width * 0.5,
        y: data.height * 0.5
      },
      finish: {
        x: r * Math.cos(theta) + data.width * 0.5,
        y: r * Math.sin(theta) + data.height * 0.5
      }
    });

    // hour hand
    r = data.width * 0.125;
    theta = (data.hours % 12) * (2 * Math.PI)/12.0 - Math.PI/2.0;
    Drawing.line(data.ctx, {
      stroke: { nWidth: 0.1 },
      start: {
        x: data.width * 0.5,
        y: data.height * 0.5
      },
      finish: {
        x: r * Math.cos(theta) + data.width * 0.5,
        y: r * Math.sin(theta) + data.height * 0.5
      }
    });
  }

  renderRetroClock(data) {
    var r, theta, x, y;

    // Clock face
    Drawing.ring(data.ctx, {
      stroke: {
        style: '#fff',
        nWidth: 1
      },
      shadow: {
        color: '#333',
        nBlur: 0.5,
        offset: {
          nX: 0.1,
          nY: 0.1
        }
      },
      center: { nX: 50, nY: 50 },
      nRadius: 25
    });

    // Blue disc at bottom left of face
    Drawing.disc(data.ctx, {
      fill: {
        style: '#00f',
      },
      center: { nX: 42, nY: 77 },
      nRadius: 1.2
    });

    // Square to right of center of face
    Drawing.line(data.ctx, {
      stroke: {
        style: '#444',
        nWidth: 2
      },
      start: { nX: 55, nY: 52 },
      finish: { nX: 57.5, nY: 53 }
    });

    // Red line of 3 line design at bottom left of face.
    Drawing.line(data.ctx, {
      stroke: {
        style: '#f00',
        nWidth: 1.3
      },
      start: { nX: 37, nY: 63 },
      finish: { nX: 52, nY: 74 }
    });

    // Blue line of 3 line design at bottom left of face.
    Drawing.line(data.ctx, {
      stroke: {
        style: '#00f',
        nWidth: 0.7
      },
      start: { nX: 30, nY: 53 },
      finish: { nX: 50,  nY: 67.5 }
    });

    // Yellow line of 3 line design at bottom left of face.
    Drawing.line(data.ctx, {
      stroke: {
        style: '#ffdf00',
        nWidth: 1.5
      },
      start: { nX: 43.0, nY: 59 },
      finish: { nX: 39, nY: 73 }
    });

    // Red line at top of face.
    Drawing.line(data.ctx, {
      stroke: {
        style: '#f00',
        nWidth: 0.7
      },
      start: { nX: 47.5, nY: 12.5 },
      finish: { nX: 52, nY: 30 }
    });

    // 3 black dots at bottom right of face
    [ {x: 64.0, y: 70},
      {x: 64.7, y: 75},
      {x: 67.0, y: 72}
    ].map((center) => {
      Drawing.disc(data.ctx, {
        fill: {
          style: '#333'
        },
        nRadius: 0.7,
        center: {
          nX: center.x,
          nY: center.y
        }
      })
    });

    // 3 green quadrilateral to left of center of face, left to right.
    // #1
    var green = 'rgba(17, 140, 121, 1)';
    Drawing.polygon(data.ctx, {
      fill: {
        style: green
      },
      points: [
        {nX: 39.5, nY: 26.7},
        {nX: 37.4, nY: 38.2},
        {nX: 39.7, nY: 37.4},
        {nX: 41.7, nY: 27.5}
      ]
    });

    // #2
    Drawing.polygon(data.ctx, {
      fill: {
        style: green
      },
      points: [
        {nX: 43.0, nY: 28.0},
        {nX: 41.2, nY: 37.1},
        {nX: 43.6, nY: 36.1},
        {nX: 45.0, nY: 28.8}
      ]
    });

    // #3
    Drawing.polygon(data.ctx, {
      fill: {
        style: green
      },
      points: [
        {nX: 46.1, nY: 29.2},
        {nX: 45.0, nY: 35.7},
        {nX: 47.2, nY: 35.0},
        {nX: 48.0, nY: 30.1}
      ]
    });

    // Green arc
    for (var i = 0; i < 4; i++) {
      Drawing.arc(data.ctx, {
        stroke: {
          style: green,
          nWidth: 0.8
        },
        nRadius: 17,
        center: { nX: 50, nY: 50 },
        start: Math.PI/(-2) + Math.PI/16 * (i - 0.25) + Math.PI/6,
        finish: Math.PI/(-2) + Math.PI/16 * (i + 0.25) + Math.PI/6
      });
    }

    // Brand name
    Drawing.text(data.ctx, {
      fill: {
        style: 'rgba(0,0,255,0.7)'
      },
      font: '100 small-caps 36px "Trebuchet MS", Helvetica, sans-serif',
      text: 'swiss',
      position: { nX: 67.5, nY: 51.5}
    })

    // hour hand
    r = data.width * 0.13;
    theta = (data.hours % 12) * (2 * Math.PI)/12.0 - Math.PI/2.0;
    Drawing.line(data.ctx, {
      stroke: {
        style: '#ffdf00',
        nWidth: 1.2
      },
      start: {
        x: data.width * 0.5 - 0.1 * r * Math.cos(theta),
        y: data.height * 0.5 - 0.1 * r * Math.sin(theta)
      },
      finish: {
        x: r * Math.cos(theta) + data.width * 0.5,
        y: r * Math.sin(theta) + data.height * 0.5
      },
      shadow: {
        color: 'rgba(0, 0, 0, 0.5)',
        nBlur: 0.2,
        offset: {
          nX: 0.2,
          nY: 0.2
        }
      },
    });

    // minute hand
    r = data.width * 0.20;
    theta = data.minutes * (2 * Math.PI)/60.0 - Math.PI/2.0;
    Drawing.line(data.ctx, {
      stroke: {
        style: '#f00',
        nWidth: 0.8
      },
      start: {
        x: data.width * 0.5 - 0.1 * r * Math.cos(theta),
        y: data.height * 0.5 - 0.1 * r * Math.sin(theta)
      },
      finish: {
        x: r * Math.cos(theta) + data.width * 0.5,
        y: r * Math.sin(theta) + data.height * 0.5
      },
      shadow: {
        color: 'rgba(0, 0, 0, 0.5)',
        nBlur: 0.4,
        offset: {
          nX: 0.4,
          nY: 0.4
        }
      },
    });

    // second hand
    r = data.width * 0.22;
    theta = data.seconds * (2 * Math.PI)/60.0 - Math.PI/2.0;
    Drawing.line(data.ctx, {
      stroke: {
        style: '#00f',
        width: 4
      },
      start: {
        x: data.width * 0.5 - 0.1 * r * Math.cos(theta),
        y: data.height * 0.5 - 0.1 * r * Math.sin(theta)
      },
      finish: {
        x: r * Math.cos(theta) + data.width * 0.5,
        y: r * Math.sin(theta) + data.height * 0.5
      },
      shadow: {
        color: 'rgba(0, 0, 0, 0.5)',
        nBlur: 0.6,
        offset: {
          nX: 0.5,
          nY: 0.5
        }
      },
    });

    // Center pin.
    Drawing.circle(data.ctx, {
      fill: {
        style: '#eee'
      },
      stroke: {
        style: '#333',
        width: 2
      },
      center: {
        nX: 50,
        nY: 50,
      },
      nRadius: 0.6
    });
  }

  renderMovadoClock(data) {
    // Clock face
    Drawing.ring(data.ctx, {
      stroke: {
        gradient: {
          type: 'linear',
          start: { nX: 90.0, nY: 0.0 },
          finish: { nX: 100, nY: 100 },
          stops: [
            { position: 0.0, color: '#fff' },
            { position: 0.25, color: '#fff' },
            { position: 0.27, color: '#000' },
            { position: 0.4, color: '#000' },
            { position: 0.5, color: '#fff' },
            { position: 1.0, color: '#fff' }
          ]
        },
        nWidth: 2
      },
      shadow: {
        color: '#000',
        nBlur: 0.3,
      },
      center: { nX: 50, nY: 50 },
      nRadius: 25
    });

    Drawing.disc(data.ctx, {
      fill: { style: '#000' },
      center: { nX: 50, nY: 50 },
      nRadius: 25
    });

    Drawing.ring(data.ctx, {
      stroke: {
        style: '#fff',
        width: 5
      },
      shadow: {
        color: '#000',
        blur: 1,
        offset: {
          x: 0,
          y: 0
        }
      },
      center: { nX: 50, nY: 50 },
      nRadius: 24.7
    });

    Drawing.disc(data.ctx, {
      fill: {
        gradient: {
          type: 'linear',
          start: { nX: 90.0, nY: 0.0 },
          finish: { nX: 100, nY: 100 },
          stops: [
            { position: 0.0, color: 'rgba(0,0,0,0)' },
            { position: 1.0, color: 'rgba(0,0,0,0.3)' }
          ]
        },
      },
      center: { nX: 50, nY: 50 },
      nRadius: 26.5
    });

    Drawing.ring(data.ctx, {
      stroke: {
        style: '#fff',
        width: 3
      },
      center: { nX: 50, nY: 19 },
      nRadius: 2.5
    });

    Drawing.disc(data.ctx, {
      fill: {
        gradient: {
          type: 'radial',
          start: {
            center: { nX: 50.0, nY: 18.0 },
            nRadius: 2.5
          },
          finish: {
            center: { nX: 50.0, nY: 23.0 },
            nRadius: 2
          },
          stops: [
            { position: 0.0, color: '#000' },
            { position: 0.35, color: '#111' },
            { position: 0.51, color: '#999' },
            { position: 1.0, color: '#efefef' }
          ]
        },
      },
      center: { nX: 50, nY: 19 },
      nRadius: 2.5
    });

    var r, theta, h, b;
    // hour hand
    r = data.width * 0.13;
    h = data.width * 0.01;
    b = 0.2 * r;
    theta = (data.hours % 12) * (2 * Math.PI)/12.0 - Math.PI/2.0;
    Drawing.polygon(data.ctx, {
      fill: {
        style: '#aaa',
      },
      points: [
        {
          x: data.width * 0.5 - b * Math.cos(theta),
          y: data.height * 0.5 - b * Math.sin(theta)
        },
        {
          x: r * Math.cos(theta) + data.width * 0.5,
          y: r * Math.sin(theta) + data.height * 0.5
        },
        {
          x: data.width * 0.5 + h * Math.cos(Math.PI/2 + theta) ,
          y: data.height * 0.5 + h * Math.sin(Math.PI/2 + theta)
        }
      ]
    });
    Drawing.polygon(data.ctx, {
      fill: {
        style: '#efefef',
      },
      points: [
        {
          x: data.width * 0.5 - b * Math.cos(theta),
          y: data.height * 0.5 - b * Math.sin(theta)
        },
        {
          x: r * Math.cos(theta) + data.width * 0.5,
          y: r * Math.sin(theta) + data.height * 0.5
        },
        {
          x: data.width * 0.5 - h * Math.cos(Math.PI/2 + theta),
          y: data.height * 0.5 - h * Math.sin(Math.PI/2 + theta)
        }
      ]
    });
    Drawing.line(data.ctx, {
      stroke: {
        style: '#fff'
      },
      start: {
        x: data.width * 0.5,
        y: data.height * 0.5
      },
      finish: {
        x: r * Math.cos(theta) + data.width * 0.5,
        y: r * Math.sin(theta) + data.height * 0.5
      }
    });

    // minute hand
    r = data.width * 0.20;
    h = data.width * 0.015;
    b = 0.1 * r;
    theta = data.minutes * (2 * Math.PI)/60.0 - Math.PI/2.0;
    Drawing.polygon(data.ctx, {
      fill: {
        style: '#aaa',
      },
      points: [
        {
          x: data.width * 0.5 - b * Math.cos(theta),
          y: data.height * 0.5 - b * Math.sin(theta)
        },
        {
          x: r * Math.cos(theta) + data.width * 0.5,
          y: r * Math.sin(theta) + data.height * 0.5
        },
        {
          x: data.width * 0.5 + h * Math.cos(Math.PI/2 + theta) ,
          y: data.height * 0.5 + h * Math.sin(Math.PI/2 + theta)
        }
      ]
    });
    Drawing.polygon(data.ctx, {
      fill: {
        style: '#efefef',
      },
      points: [
        {
          x: data.width * 0.5 - b * Math.cos(theta),
          y: data.height * 0.5 - b * Math.sin(theta)
        },
        {
          x: r * Math.cos(theta) + data.width * 0.5,
          y: r * Math.sin(theta) + data.height * 0.5
        },
        {
          x: data.width * 0.5 - h * Math.cos(Math.PI/2 + theta),
          y: data.height * 0.5 - h * Math.sin(Math.PI/2 + theta)
        }
      ]
    });
    Drawing.line(data.ctx, {
      stroke: {
        style: '#fff'
      },
      start: {
        x: data.width * 0.5,
        y: data.height * 0.5
      },
      finish: {
        x: r * Math.cos(theta) + data.width * 0.5,
        y: r * Math.sin(theta) + data.height * 0.5
      }
    });

    Drawing.disc(data.ctx, {
      fill: {
        gradient: {
          type: 'linear',
          start: { nX: 50, nY: 49 },
          finish: { nX: 50, nY: 51 },
          stops: [
            { position: 0.0, color: '#9f9f9f' },
            { position: 0.5, color: '#999' },
            { position: 1.0, color: '#333' }
          ]
        },
      },
      center: { nX: 50, nY: 50 },
      nRadius: 0.3
    });
  }


  setStyleHandler(style) {
    return (() => {
      this.setState({
        style: style
      });
    }).bind(this);
  }

  render() {
    return (
      <div className='row clock'>
        <div className='col s4 offset-s4 digital flow-text'>
          <span className='hours'>{this.state.time.getHours().lpad(2)}</span>
          <span className='divider'>:</span>
          <span className='minutes'>{this.state.time.getMinutes().lpad(2)}</span>
          <span className='divider'>:</span>
          <span className='seconds'>{this.state.time.getSeconds().lpad(2)}</span>
        </div>
        <canvas className='col s12 l10 offset-l1' height='2000' width='3236' ref='canvas'></canvas>
        <div className='controls col s12'>
          <div className='toggle col s12'>
            <div className='title'>style</div>
            <div className={'col s4 btn-flat waves-effect ' + (this.state.style == 'basic' ? 'active' : 'inactive')}
                onClick={this.setStyleHandler('basic')}>
                basic
            </div>
            <div className={'col s4 btn-flat waves-effect ' + (this.state.style == 'retro' ? 'active' : 'inactive')}
                onClick={this.setStyleHandler('retro')}>
                retro
            </div>
            <div className={'col s4 btn-flat waves-effect ' + (this.state.style == 'movado' ? 'active' : 'inactive')}
                onClick={this.setStyleHandler('movado')}>
                movado
            </div>
          </div>
        </div>
      </div>
    );
  }
}

module.exports = Clock;
