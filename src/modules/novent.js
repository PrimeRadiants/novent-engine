(function() {
	'use strict';

	NoventEngine.novent = novent;

  function novent(name, canvasId, height, width, init) {

		if(name && !canvasId && !height && !width) {
			if(!NoventEngine.novents || !NoventEngine.novents[name])
				throw new UnknownNoventExeption(name, 'unknown novent with name ' + name);

			return NoventEngine.novents[name];
		}
		else {
			var novent = new Novent(name, canvasId, height, width);

			if(!NoventEngine.novents)
				NoventEngine.novents = {};

			NoventEngine.novents[name] = novent;

			return novent;
		}
  }

	var Novent = function(name, canvasId, height, width, init) {
		var novent = this;

		novent.name = validateNoventName(name);
		novent.canvas = validateCanvasId(canvasId);
		novent.width = novent.canvas.width = validateNumericValue('width', width);
		novent.height = novent.canvas.height = validateNumericValue('height', height);

		novent.pages = [];
		novent.page = page;
		novent.index = 0;

		novent.scope = {};

		novent.stage = new createjs.Stage(novent.canvas);

		novent.waiting = true;

		novent.play = play;

		function validateNoventName(name) {
			if(!name || name === '')
				throw new InvalidInputException('name', 'missing parameter name');

			return name;
		}

		function validateCanvasId(canvasId) {
			if(!canvasId || canvasId === '')
				throw new InvalidInputException('canvasId', 'missing parameter canvasId');

			var canvas = document.getElementById(canvasId);

			if(!canvas)
				throw new InvalidInputException('canvasId', 'invalid canvasId, no canvas found with id ' + canvasId);

			return canvas;
		}

		function validateNumericValue(field, value) {
			if(!value || value === '')
				throw new InvalidInputException(field, 'missing parameter ' + field);

			value = Number.parseInt(value);

			if(!Number.isInteger(value) || value < 0)
				throw new InvalidInputException(field, 'invalid pramameter ' + field + ', should be a positive integer');

			return value;
		}

		function page(index, name, init, materials) {
			return NoventEngine.page(novent, index, name, init, materials);
		}

		function play() {
			if(novent.index == 0 && novent.waiting) {
				return novent.pages[novent.index].play();
			}
			if(novent.index != novent.pages.length && novent.waiting) {
				return novent.pages[novent.index].play();
			}
			else if(novent.index == novent.pages.length && novent.waiting) {
				novent.trigger("complete");
			}
		}

		function initialize() {
			createjs.Ticker.setFPS(30);
			createjs.Ticker.addEventListener("tick", novent.stage);

			if(init)
				init(novent.stage, novent);

			window.onresize = function() {
				resize(novent.canvas);
			}
			resize(novent.canvas);
		}

		initialize();
		return novent;
	}

	function resize(canvasElement) {
		canvasElement.style.position = "fixed";
		canvasElement.style.top = 0;
		canvasElement.style.left = 0;
		canvasElement.style.bottom = 0;
		canvasElement.style.right = 0;
		canvasElement.style.margin = "auto";

		var width = window.innerWidth;
    var height = window.innerHeight;

		var screenRatio = height/width;
		var canvasRatio = canvasElement.height/canvasElement.width;

		if(screenRatio <= canvasRatio) {
			width = height / canvasRatio;
		} else {
			height = width * canvasRatio;
		}

		canvasElement.style.width = width + "px";
		canvasElement.style.height = height + "px";
	}

	heir.inherit(Novent, EventEmitter);
})();
