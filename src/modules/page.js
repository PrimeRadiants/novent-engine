(function() {
	'use strict';

  NoventEngine.page = page;

  function page(novent, index) {
    var page = this;
    if(!novent)
      throw new InvalidInputException('novent', 'missing parameter novent');

    page.index = validateNumericValue('index', index);
    page.novent - novent;

    if(novent.pages[index])
      return novent.pages[index];

    novent.pages[index] = page;
    return novent.pages[index];

    function validateNumericValue(field, value) {
      if(value === undefined || value === '')
        throw new InvalidInputException(field, 'missing parameter ' + field);

      value = Number.parseInt(value);

      if(!Number.isInteger(value) || value < 0)
        throw new InvalidInputException(field, 'invalid pramameter ' + field + ', should be a positive integer');

      return value;
    }
  }
})();
