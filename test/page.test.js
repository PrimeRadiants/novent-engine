var assert = chai.assert;
var expect = chai.expect;

describe('page', function() {

  before(function() {
    var canvas = document.createElement('canvas');
    canvas.id = 'canvas';
    document.body.appendChild(canvas);

    NoventEngine.novent('test', 'canvas', 1000, 1000);
  });

  describe('constructor', function() {

    it('Should throw InvalidInputException with missing novent', function() {
      expect(NoventEngine.page.bind(NoventEngine.page)).to.throw(InvalidInputException);
    });

    it('Should throw InvalidInputException with missing index', function() {
      expect(NoventEngine.novent('test').page.bind(NoventEngine.novent('test').page)).to.throw(InvalidInputException);
    });

    it('Should add a new page at the given index in novent object', function() {
      NoventEngine.novent('test').page(0);
      assert.isOk(NoventEngine.novent('test').pages[0]);
    });

  });
});
