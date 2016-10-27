(function() {
	'use strict';

  NoventEngine.page = page;

  function page(novent, ordinal, name, init, materials) {
    if(!novent)
      throw new InvalidInputException('novent', 'missing parameter novent');

    if(novent.pages[ordinal]) {
      return novent.pages[ordinal];
    }
    else {
      novent.pages[ordinal] = new Page(novent, ordinal, name, init, materials);
      return novent.pages[ordinal];
    }
  }

  var Page = function(novent, ordinal, name, init, materials) {
    var page = this;
    if(!novent)
      throw new InvalidInputException('novent', 'missing parameter novent');

    page.ordinal = validateNumericValue('ordinal', ordinal);
    page.novent = novent;
		page.name = name;

		page.events = [];
		page.event = event;
		page.index = 0;

		page.scope = {};

		page.container = new createjs.Container();

		page.play = play;
		page.loading = false;
		page.loadQueue = new createjs.LoadQueue(true);
		page.load = load;

		page.lib = {};

    function validateNumericValue(field, value) {
      if(value === undefined || value === '')
        throw new InvalidInputException(field, 'missing parameter ' + field);

      value = Number.parseInt(value);

      if(!Number.isInteger(value) || value < 0)
        throw new InvalidInputException(field, 'invalid pramameter ' + field + ', should be a positive integer');

      return value;
    }

		function event(ordinal, funct) {
			return NoventEngine.event(page, ordinal, funct);
		}

		function load() {
			page.loading = true;

			if(materials && Object.keys(materials).length !== 0) {
				for(var key in materials) {
					page.loadQueue.loadFile({id:key, src: materials[key]});
				}

				page.loadQueue.on("fileload", function(event) {
					page.lib[event.item.id] = event.result;
				});

				page.loadQueue.on("complete", function() {
					page.loading = false;
					page.trigger("loadComplete");
				});

				page.loadQueue.load();
			}
			else {
				page.loadQueue.progress = 1;
				page.loadQueue.dispatchEvent("progress");
				page.loadQueue.dispatchEvent("complete");
				page.loading = false;
				page.trigger("loadComplete");
			}

			if(page.ordinal != page.novent.pages.length - 1)
				page.on("loadComplete", page.novent.page(page.ordinal + 1).load);
		}

		function play() {
			if(page.index === 0) {
				if(page.loadQueue.loaded) {
					inititalize();
					return page.events[page.index].play();
				}
				else {
					page.on("loadComplete", function() {
						inititalize();
						return page.events[page.index].play();
					});

					if(!page.loading)
						page.load();
				}
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
			};

			page.container.sortChildren(sortFunction);
			page.novent.stage.addChild(page.container);
			if(page.novent.index > 0)
				page.novent.stage.removeChild(page.novent.pages[index - 1].container);
		}

		return page;
  };

	heir.inherit(Page, EventEmitter);
})();
