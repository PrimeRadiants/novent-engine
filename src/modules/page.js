(function() {
	'use strict';

  NoventEngine.page = page;

  function page(novent, index, init) {
    if(!novent)
      throw new InvalidInputException('novent', 'missing parameter novent');

    if(novent.pages[index]) {
      return novent.pages[index];
    }
    else {
      novent.pages[index] = new Page(novent, index, init);
      return novent.pages[index];
    }
  }

  var Page = function(novent, index, init) {
    var page = this;
    if(!novent)
      throw new InvalidInputException('novent', 'missing parameter novent');

    page.index = validateNumericValue('index', index);
    page.novent = novent;

		page.events = [];
		page.event = event;
		page.index = 0;

		page.scope = {};

		page.container = new createjs.Container();

		page.play = play;

    function validateNumericValue(field, value) {
      if(value === undefined || value === '')
        throw new InvalidInputException(field, 'missing parameter ' + field);

      value = Number.parseInt(value);

      if(!Number.isInteger(value) || value < 0)
        throw new InvalidInputException(field, 'invalid pramameter ' + field + ', should be a positive integer');

      return value;
    }

		function event(index, funct) {
			return NoventEngine.event(page, index, funct);
		}

		function play() {
			if(page.index == 0) {
				inititalize();
				return page.events[page.index].play();
			}
			else if(page.index != page.events.length) {
				return page.events[page.index].play();
			}
		}

		function inititalize() {
			if(init)
				init(page.container, page);

			var sortFunction = function(obj1, obj2, options) {
				 if (obj1.index > obj2.index) { return 1; }
				 if (obj1.index < obj2.index) { return -1; }
				 return 0;
			}
			page.container.sortChildren(sortFunction);
			page.novent.stage.addChild(page.container);
			if(page.novent.index > 0)
				page.novent.stage.removeChild(page.novent.pages[index - 1].container);
		}

		return page;
  }
})();
