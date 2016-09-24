var assert = chai.assert;
var expect = chai.expect;

describe('event', function() {

  before(function() {
    var canvas = document.createElement('canvas');
    canvas.id = 'canvas';
    document.body.appendChild(canvas);

    NoventEngine.novent('test', 'canvas', 1000, 1000);

    NoventEngine.novent('test').page(0);
  });

  describe('constructor', function() {

    it('Should throw InvalidInputException with missing page', function() {
      expect(NoventEngine.event.bind(NoventEngine.event)).to.throw(InvalidInputException);
    });

  });
});
