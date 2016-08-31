(function() {
	'use strict';

	NoventEngine.novent = novent;

  function novent(name, canvasId, height, width) {

		if(name && !canvasId && !height && !width)
			return getter(name);
		else
			return setter(name, canvasId, height, width);


		function getter(name) {
			if(!NoventEngine.novents || !NoventEngine.novents[name])
				throw new UnknownNoventExeption(name, 'unknown novent with name ' + name);

			return NoventEngine.novents[name];
		}

		function setter(name, canvasId, height, width) {
			var novent = {};

			novent.name = validateNoventName(name);
			novent.canvas = validateCanvasId(canvasId);
			novent.width = novent.canvas.width = validateNumericValue('width', width);
			novent.height = novent.canvas.height = validateNumericValue('height', height);

			if(!NoventEngine.novents)
				NoventEngine.novents = {};

			NoventEngine.novents[name] = novent;

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
					throw new InvalidInputException(field, 'Invalid pramameter ' + field + ', should be a positive integer');

				return value;
			}

			return novent;
		}
  }
})();
