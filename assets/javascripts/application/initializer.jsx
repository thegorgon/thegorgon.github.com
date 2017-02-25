var Clock = require('./components/clock')
var React = require('react');
var ReactDOM = require('react-dom');

var node = document.getElementById('application');

var Initializer = {
  projects: {
    kmeans: function() {
      console.log('Initializing kmeans');
    },
    orbit: function() {
      console.log('Initializing orbit');
    },
    swarm: function() {
      console.log('Initializing swarm.');
    },
    clock: function() {
      console.log('Initializing Clock');
      ReactDOM.render(<Clock />, node);
    },
  }
};

module.exports = Initializer;
