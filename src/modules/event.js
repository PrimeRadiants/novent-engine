(function() {
	'use strict';

  NoventEngine.event = event;

  function event(page, index, funct) {
    if(!page)
      throw new InvalidInputException('page', 'missing parameter page');

    if(page.events[index]) {
      return page.events[index];
    }
    else {
      page.events[index] = new Event(page, index, funct);
      return page.events[index];
    }
  }

  var Event = function(page, index, funct) {
    var event = this;

    event.page = page;
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
