(function() {
	'use strict';

  NoventEngine.event = event;

  function event(page, ordinal, funct) {
    if(!page)
      throw new InvalidInputException('page', 'missing parameter page');

    if(page.events[ordinal]) {
      return page.events[ordinal];
    }
    else {
      page.events[ordinal] = new Event(page, ordinal, funct);
      return page.events[ordinal];
    }
  }

  var Event = function(page, ordinal, funct) {
    var event = this;

    event.page = page;
		event.ordinal = ordinal;
    event.function = eventFunction;

    event.play = play;

    function play() {
			event.page.novent.trigger("eventstart");
      event.page.novent.waiting = false;
      return event.function(event.page.container, event.page)
        .then(function() {
          event.page.index++;
          event.page.novent.waiting = true;
          if(event.page.index == event.page.events.length) {
            event.page.novent.index++;
						event.page.novent.trigger("pageend");
            return event.page.novent.play();
          }
					else {
						event.page.novent.trigger("eventend");
					}
        });
    }

		function eventFunction(container, page) {
			return new Promise(function(resolve) {
				funct(resolve, container, page);
			});
		}

    return event;
  };
})();
