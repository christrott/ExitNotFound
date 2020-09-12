module.exports = class Controls {
    constructor() {
      this.codes = { 37: 'left', 39: 'right', 38: 'forward', 40: 'backward' };
      this.states = { left: false, right: false, forward: false, backward: false };
      this.showMaze = false;
      document.addEventListener('keydown', this.onKey.bind(this, true), false);
      document.addEventListener('keyup', this.onKey.bind(this, false), false);
    }
  
    onKey(val, e) {
      if (e.keyCode === 77 && val) { // M keyCode
        this.showMaze = !this.showMaze;
      }
      var state = this.codes[e.keyCode];
      if (typeof state === 'undefined') {
        return;
      }
      this.states[state] = val;
      e.preventDefault && e.preventDefault();
      e.stopPropogation && e.stopPropogation();
    }
  }