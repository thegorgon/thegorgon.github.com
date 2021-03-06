var React = require('react');
var $ = require('jquery');
var Drawing = require('../drawing')
var Gaussian = require('../gaussian')
var Geometry = require('../geometry')

class Kmeans extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      intervalLength: 500,
      iterationTimeout: 500,
      observations: [],
      values: [],
      clusters: [],
      mapping: [],
      running: false,
      convergence: null
    };
  }

  generateValuesAndObservations(valueCount, observationCount, error) {
    var observations = [];
    var values = [];
    for (var i = 0; i < valueCount; i++) {
      values.push({
        x: Math.round(Math.random() * this.refs.canvas.width * 0.8) + this.refs.canvas.width * 0.1,
        y: Math.round(Math.random() * this.refs.canvas.height * 0.8) + this.refs.canvas.height * 0.1,
        index: i
      });
    }

    var value, xGauss, yGauss;
    for (var i = 0; i < observationCount; i++) {
      value = values[Math.floor(Math.random() * values.length)];
      xGauss = new Gaussian(value.x, error * Math.min(value.x, this.refs.canvas.width - value.x));
      yGauss = new Gaussian(value.y, error * Math.min(value.y, this.refs.canvas.height - value.y));
      observations.push({
        x: Math.min(Math.max(xGauss.ppf(Math.random()), 0), this.refs.canvas.width),
        y: Math.min(Math.max(yGauss.ppf(Math.random()), 0), this.refs.canvas.height),
        index: i
      });
    }
    this.setState({ values: values, observations: observations, mapping: [] });
  }

  generateRandomValues(count) {
    this.setState({ values: values });
  }

  generateRandomClusters(count) {
    var clusters = [], hue, offset;
    var hues = [0, 60, 120, 180, 240, 300, 30, 90, 150, 210, 270, 330, 15, 45, 75, 105, 135, 165, 195, 225];
    for (var i = 0; i < count; i++) {
      hue = hues[i];
      clusters.push({
        x: Math.round(Math.random() * this.refs.canvas.width),
        y: Math.round(Math.random() * this.refs.canvas.height),
        index: i,
        hue: hue
      });
    }
    this.setState({ clusters: clusters, mapping: [] });
  }

  handleObservationAndValueUpdate() {
    var obsCount = $(this.refs['observation-count']).val();
    var valCount = $(this.refs['value-count']).val();
    var error = $(this.refs['error-value']).val();
    this.generateValuesAndObservations(valCount, obsCount, error);
  }

  handleErrorChange() {
    this.handleObservationAndValueUpdate();
  }

  handleObservationCountChange() {
    this.handleObservationAndValueUpdate();
  }

  handleClusterCountChange() {
    var count = $(this.refs['cluster-count']).val();
    this.generateRandomClusters(count);
  }

  handleValueCountChange() {
    this.handleObservationAndValueUpdate();
  }

  handleStart() {
    this.iterate();
    this.setState({ running: true });
    this.interval = setInterval(() => {
      this.iterate();
    }, this.state.intervalLength);
  }

  handleStop() {
    clearInterval(this.interval);
    clearTimeout(this.timeout);
    this.setState({ running: false });
  }

  handleResetAll() {
    this.handleObservationAndValueUpdate();
    this.handleClusterCountChange();
    this.setState({ convergence: null });
  }

  iterate() {
    var mapping = [], reverseMapping = [], clusters = this.state.clusters;

    this.state.observations.forEach((observation, index) => {
      // sort sorts in place, so slice(0) to clone
      // to prevent mixing up the original clusters array.
      var closestCluster = Geometry.nearest(observation, clusters);
      mapping[index] = closestCluster;
      reverseMapping[closestCluster.index] = reverseMapping[closestCluster.index] || [];
      reverseMapping[closestCluster.index].push(observation);
    });
    this.setState({ mapping: mapping, convergence: this.state.convergence || -1 });

    this.timeout = setTimeout(() => {
      var centroid, observations, distanceTraveled = 0;
      var newClusters = clusters.map((cluster, index) => {
        observations = reverseMapping[index] || [];
        centroid = Geometry.centroid(observations);
        distanceTraveled += Geometry.distanceBetween(cluster, centroid);
        return Object.assign({}, cluster, centroid);
      });

      var running = true, convergence = distanceTraveled/(1.0 * clusters.length);
      if (convergence <= 1) {
        running = false;
        clearInterval(this.interval);
      }
      this.setState({clusters: newClusters, running: running, convergence: convergence});
    }, this.state.iterationTimeout);
  }

  getSubtext() {
    if (this.state.convergence === null) {
      return null;
    } else if (this.state.convergence < 0) {
      return 'Calculating Completion...';
    } else if (this.state.convergence <= 1) {
      return 'Completed!';
    } else {
      var width = this.refs.canvas.width
      return 'Convergence: ' + Math.floor(100 * (width - this.state.convergence)/width) + '%';
    }
  }

  componentDidMount() {
    this.handleResetAll();
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  componentDidUpdate(prevProps, prevState) {
    var canvas = this.refs.canvas;
    var ctx = canvas.getContext('2d');
    Drawing.clear(ctx);

    this.state.observations.forEach((observation, index) => {
      var color = '#000';
      if (this.state.mapping[index]) {
        color = 'hsl(' + this.state.mapping[index].hue + ', 100%, 40%)';
      }
      Drawing.disc(ctx, {
        fill: { style: color },
        center: observation,
        nRadius: 0.5
      })
    });

    this.state.values.forEach((cluster) => {
      Drawing.disc(ctx, {
        fill: {
          style: 'rgba(0, 0, 0, 0.2)'
        },
        center: {x: cluster.x, y: cluster.y},
        nRadius: 2
      })
    });

    this.state.clusters.forEach((cluster, index) => {
      Drawing.disc(ctx, {
        fill: {
          style: 'hsl(' + cluster.hue + ', 100%, 40%)'
        },
        center: {x: cluster.x, y: cluster.y},
        nRadius: 1
      });
      Drawing.ring(ctx, {
        stroke: {
          style: '#333',
          width: 3
        },
        center: {x: cluster.x, y: cluster.y},
        nRadius: 1
      });
    });
  }

  render() {
    return (
      <div className='row kmeans'>
        <canvas className='col s12 l10 offset-l1' height='2000' width='3236' ref='canvas'></canvas>
        <div className='spacer subtext col s8 offset-s2 center'>{this.getSubtext()}</div>
        <div className='top-margin controls col s8 offset-s2'>
          <div className='col center-align s3'>
            <label htmlFor='observation-count'>Observations:</label>
            <select
                className='browser-default'
                name='observation-count'
                ref='observation-count'
                onChange={this.handleObservationCountChange.bind(this)}
                defaultValue='1000'
                disabled={this.state.running}>
              <option value='100'>100</option>
              <option value='1000'>1,000</option>
              <option value='5000'>5,000</option>
              <option value='10000'>10,000</option>
            </select>
          </div>
          <div className='col center-align s3'>
            <label htmlFor='cluster-count'>Clusters:</label>
            <select
                className='browser-default'
                name='cluster-count'
                ref='cluster-count'
                onChange={this.handleClusterCountChange.bind(this)}
                defaultValue='5'
                disabled={this.state.running}>
              <option value='2'>2</option>
              <option value='5'>5</option>
              <option value='10'>10</option>
              <option value='20'>20</option>
            </select>
          </div>
          <div className='col center-align s3'>
            <label htmlFor='cluster-count'>Values:</label>
            <select
                className='browser-default'
                name='value-count'
                ref='value-count'
                onChange={this.handleValueCountChange.bind(this)}
                defaultValue='5'
                disabled={this.state.running}>
              <option value='2'>2</option>
              <option value='5'>5</option>
              <option value='10'>10</option>
              <option value='20'>20</option>
            </select>
          </div>
          <div className='col center-align s3'>
            <label htmlFor='cluster-count'>Error:</label>
            <select
                className='browser-default'
                name='error-value'
                ref='error-value'
                onChange={this.handleErrorChange.bind(this)}
                defaultValue='75'
                disabled={this.state.running}>
              <option value='0'>0</option>
              <option value='10'>10</option>
              <option value='50'>50</option>
              <option value='75'>75</option>
              <option value='100'>100</option>
              <option value='200'>200</option>
            </select>
          </div>
          <div className='col center-align s6 m3'>
            <a
                className='btn-flat waves-effect form-btn'
                onClick={this.handleStart.bind(this)}
                disabled={this.state.running}>
              <i className="material-icons">play_arrow</i>
            </a>
          </div>
          <div className='col center-align s6 m3'>
            <a
                className='btn-flat waves-effect form-btn'
                onClick={this.handleClusterCountChange.bind(this)}
                disabled={this.state.running}>
              <i className="material-icons">fast_rewind</i>
            </a>
          </div>
          <div className='col center-align s6 m3'>
            <a
                className='btn-flat waves-effect form-btn'
                onClick={this.handleResetAll.bind(this)}
                disabled={this.state.running}>
              <i className="material-icons">replay</i>
            </a>
          </div>
          <div className='col center-align s6 m3'>
            <a
                className='btn-flat waves-effect form-btn'
                onClick={this.handleStop.bind(this)}
                disabled={!this.state.running}>
              <i className="material-icons">stop</i>
            </a>
          </div>
        </div>
      </div>
    )
  }
}

module.exports = Kmeans;
