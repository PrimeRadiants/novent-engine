(function() {
	'use strict';

  function novent(name, canvasId, height, width) {
    if(name && !canvasId && !height && !width && NoventEngine.novents) {
      return NoventEngine.novents[name];
    }

    var novent = this;

    novent.name = name;
    novent.canvas = document.getElementById(canvasId);
		novent.width = novent.canvas.width = width;
		novent.height = novent.canvas.height = height;

    if(!NoventEngine.novents)
      NoventEngine.novents = new Object();

    NoventEngine.novents[name] = novent;
  }

  NoventEngine.novent = novent;
})();
