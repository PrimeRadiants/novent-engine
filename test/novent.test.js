var assert = chai.assert;
var expect = chai.expect;

describe('novent', function() {

  before(function() {
    var canvas = document.createElement('canvas');
    canvas.id = 'canvas';
    document.body.appendChild(canvas);
  });

  describe('constructor', function() {

    it('Should throw InvalidInputException with missing name', function() {
      expect(NoventEngine.novent.bind(NoventEngine.novent)).to.throw(InvalidInputException);
    });

    it('Should throw InvalidInputException with empty name', function() {
      expect(NoventEngine.novent.bind(NoventEngine.novent, '')).to.throw(InvalidInputException);
    });

    it('Should throw UnknownNoventExeption with unknown novent name', function() {
      expect(NoventEngine.novent.bind(NoventEngine.novent, 'invalideName')).to.throw(UnknownNoventExeption);
    });

    it('Should return the novent object given a existing novent name', function() {
      NoventEngine.novents = {};
      NoventEngine.novents.test = {name: 'test', height:16, width: 84};
      assert.equal(NoventEngine.novents.test, NoventEngine.novent("test"));
    });

    it('Should throw InvalidInputException with unknown canvasId', function() {
      expect(NoventEngine.novent.bind(NoventEngine.novent, 'test', 'canvas1', 1000, 1000)).to.throw(InvalidInputException);
    });

    it('Should throw InvalidInputException with missing width', function() {
      expect(NoventEngine.novent.bind(NoventEngine.novent, 'test', 'canvas', 1000)).to.throw(InvalidInputException);
    });

    it('Should throw InvalidInputException with missing height', function() {
      expect(NoventEngine.novent.bind(NoventEngine.novent, 'test', 'canvas')).to.throw(InvalidInputException);
    });

    it('Should throw InvalidInputException with non numerical width', function() {
      expect(NoventEngine.novent.bind(NoventEngine.novent, 'test', 'canvas', 1000, "test")).to.throw(InvalidInputException);
    });

    it('Should throw InvalidInputException with non numerical height', function() {
      expect(NoventEngine.novent.bind(NoventEngine.novent, 'test', 'canvas', "test", 1000)).to.throw(InvalidInputException);
    });

    it('Should throw InvalidInputException with negative width', function() {
      expect(NoventEngine.novent.bind(NoventEngine.novent, 'test', 'canvas', 1000, -1000)).to.throw(InvalidInputException);
    });

    it('Should throw InvalidInputException with negative height', function() {
      expect(NoventEngine.novent.bind(NoventEngine.novent, 'test', 'canvas', -1000, 1000)).to.throw(InvalidInputException);
    });

    it('Should add the new novent to the NoventEngine object', function() {
      NoventEngine.novent('test', 'canvas', 1000, 1000);
      assert.isOk(NoventEngine.novents.test);
    });

  });
});
