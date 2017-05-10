/**
 * Created on 2016-04-20.
 */
'use strict';

const should = require('should/as-function');
const describe = require('mocha/lib/mocha.js').describe;
const it = require('mocha/lib/mocha.js').it;
const path = require('path');

describe('Valcheck ', function() {
  const Check = require('../src/Valcheck');
  const check = new Check(error => error);

  /**
   * @param {function} fn
   * @param {string} errMessage The exact error message
   */
  function shouldFail(fn, errMessage) {
    const er = fn();
    //try { fn() } catch(e) { er = e; }
    should.exist(er, 'Expected an error message');

    //noinspection JSUnresolvedVariable
    should(er).equal(errMessage);
  }

  /**
   * @param {function} fn
   */
  function shouldSucceed(fn) {
    const er = fn();
    //try { fn() } catch(e) { er = e; }
    should.not.exist(er);
  }

  it('Should throwing on error by default', function(done) {
    let ex = {};
    try {
      const c = new Check();
      c.number('n', 'abc');
    } catch(e) {
      ex = e;
    }
    should.exist(ex);
    should(ex.message).equal('"n" must be a number.');
    done();
  });

  it('Should check for null or undefined', function(done) {
    shouldFail(() => check.exist('exist', undefined), '"exist" must not be undefined.');
    shouldFail(() => check.exist('exist', null), '"exist" must not be null.');

    shouldSucceed(() => check.exist('exist', Number.NaN));
    shouldSucceed(() => check.exist('exist', Math.PI));
    shouldSucceed(() => check.exist('exist', Infinity));
    shouldSucceed(() => check.exist('exist', -Infinity));
    shouldSucceed(() => check.exist('exist', 1));
    shouldSucceed(() => check.exist('exist', false));
    shouldSucceed(() => check.exist('exist', []));
    shouldSucceed(() => check.exist('exist', /a/));
    shouldSucceed(() => check.exist('exist', [1]));
    shouldSucceed(() => check.exist('exist', ['a']));
    shouldSucceed(() => check.exist('exist', new Date));
    shouldSucceed(() => check.exist('exist', function() {}));
    done();
  });

  it('Should check numbers', function(done) {
    const numberMsg = '"number" must be a number.';
    shouldFail(() => check.number('number', 'a'), numberMsg);
    shouldFail(() => check.number('number', undefined), numberMsg);
    shouldFail(() => check.number('number', null), numberMsg);
    shouldFail(() => check.number('number', []), numberMsg);
    shouldFail(() => check.number('number', [1, 2]), numberMsg);
    shouldFail(() => check.number('number', /ab/), numberMsg);
    shouldFail(() => check.number('number', '1'), numberMsg);
    shouldFail(() => check.number('number', new Date), numberMsg);
    shouldFail(() => check.number('number', Number.NaN), numberMsg);
    shouldFail(() => check.number('number', NaN), numberMsg);
    shouldFail(() => check.number('number', function() {}), numberMsg);
    shouldFail(() => check.number('number', Infinity), '"number" must be a finite number.');
    shouldFail(() => check.number('number', -Infinity), '"number" must be a finite number.');
    shouldFail(() => check.number('number', 12, 40), '"number" must be at least 40.');
    shouldFail(() => check.number('number', -12, 0), '"number" must be positive.');
    shouldFail(() => check.number('number', 12, 10, 11), '"number" must be between 10 and 11.');
    shouldFail(() => check.number('number', 12, undefined, 11), '"number" must be at most 11.');

    shouldSucceed(() => check.number('number', 71));
    shouldSucceed(() => check.number('number', 1.2));
    shouldSucceed(() => check.number('number', -1.456));
    shouldSucceed(() => check.number('number', -30));
    shouldSucceed(() => check.number('number', Math.PI));
    shouldSucceed(() => check.number('number', 12, 0));
    shouldSucceed(() => check.number('number', 12, 10));
    shouldSucceed(() => check.number('number', 12, 12));
    shouldSucceed(() => check.number('number', 12, 12, 12));
    shouldSucceed(() => check.number('number', 12, 11, 12));
    shouldSucceed(() => check.number('number', 12, 11, 13));
    done();
  });

  it('Should check positive integers', function(done) {
    const numberMsg = '"posInt" must be a number.';
    shouldFail(() => check.posInt('posInt', 'a'), numberMsg);
    shouldFail(() => check.posInt('posInt', /a/), numberMsg);
    shouldFail(() => check.posInt('posInt', []), numberMsg);
    shouldFail(() => check.posInt('posInt', [1]), numberMsg);
    shouldFail(() => check.posInt('posInt', [1, 2]), numberMsg);
    shouldFail(() => check.posInt('posInt', ['a']), numberMsg);
    shouldFail(() => check.posInt('posInt', new Date), numberMsg);
    shouldFail(() => check.posInt('posInt', undefined), numberMsg);
    shouldFail(() => check.posInt('posInt', null), numberMsg);
    shouldFail(() => check.posInt('posInt', -1), '"posInt" must be positive.');
    shouldFail(() => check.posInt('posInt', -1.5), '"posInt" must be positive.');
    shouldFail(() => check.posInt('posInt', 1.5), '"posInt" must be an integer.');
    shouldFail(() => check.posInt('posInt', Number.NaN), numberMsg);
    shouldFail(() => check.posInt('posInt', NaN), numberMsg);
    shouldFail(() => check.posInt('posInt', Math.PI), '"posInt" must be an integer.');
    shouldFail(() => check.posInt('posInt', Infinity), '"posInt" must be a finite number.');
    shouldFail(() => check.posInt('posInt', -Infinity), '"posInt" must be a finite number.');
    shouldFail(() => check.posInt('posInt', function() {}), numberMsg);

    shouldSucceed(() => check.posInt('posInt', -0));
    shouldSucceed(() => check.posInt('posInt', 0));
    shouldSucceed(() => check.posInt('posInt', 1));
    shouldSucceed(() => check.posInt('posInt', 2));
    done();
  });

  it('Should check arrays', function(done) {
    const msg = '"array" must be an array.';
    shouldFail(() => check.array('array', 'a'), msg);
    shouldFail(() => check.array('array', undefined), msg);
    shouldFail(() => check.array('array', null), msg);
    shouldFail(() => check.array('array', /ab/), msg);
    shouldFail(() => check.array('array', '1'), msg);
    shouldFail(() => check.array('array', 1), msg);
    shouldFail(() => check.array('array', new Date), msg);
    shouldFail(() => check.array('array', Number.NaN), msg);
    shouldFail(() => check.array('array', NaN), msg);

    shouldSucceed(() => check.array('array', []));
    shouldSucceed(() => check.array('array', [1, 2]));

    shouldFail(() => check.array('array', [1, 2], 1, 1), '"array" length must be 1.');
    shouldFail(() => check.array('array', [1, 2], 0, 1), '"array" length must be between 0 and 1.');
    shouldFail(() => check.array('array', [1, 2], 3), '"array" length must be at least 3.');
    shouldSucceed(() => check.array('array', [1, 2], 2));
    done();
  });

  it('Should check enums', function(done) {
    /// usage error
    //noinspection JSCheckFunctionSignatures
    shouldFail(() => check.values('enum', 'a', ''),
      'Library usage error: values must be a non-empty array.'
    );
    shouldFail(() => check.values('enum', 'a', []),
      'Library usage error: values must be a non-empty array.'
    );

    shouldFail(() => check.values('enum', 'a', ['b', 'c']), '"enum" must be one of: "b", "c".'
    );
    shouldFail(() => check.values('enum', 1, ['1', '2']), '"enum" must be one of: "1", "2".');
    shouldFail(() => check.values('enum', 1, ['1', '2'], true),
      '"enum" must be one of: "1", "2" (was 1).'
    );

    shouldSucceed(() => check.values('enum', 'b', ['a', 'b']));
    shouldSucceed(() => check.values('enum', 2, [1, 2]));
    shouldSucceed(() => check.values('enum', null, [1, null]));
    shouldSucceed(() => check.values('enum', undefined, ['a', undefined]));
    shouldSucceed(() => check.values('enum', Number.NaN, ['a', Number.NaN]));
    done();
  });

  it('Should check strings', function(done) {
    const msg = '"string" must be a string.';
    shouldFail(() => check.string('string', null), msg);
    shouldFail(() => check.string('string', undefined), msg);
    shouldFail(() => check.string('string', 0), msg);
    shouldFail(() => check.string('string', 1), msg);
    shouldFail(() => check.string('string', -1), msg);
    shouldFail(() => check.string('string', /ab/), msg);
    shouldFail(() => check.string('string', new Date), msg);
    shouldFail(() => check.string('string', []), msg);
    shouldFail(() => check.string('string', ['a']), msg);
    shouldFail(() => check.string('string', [1]), msg);
    shouldFail(() => check.string('string', Number.NaN), msg);
    shouldFail(() => check.string('string', Infinity), msg);
    shouldFail(() => check.string('string', '', true), '"string" must be a non-empty string.');
    shouldFail(
      () => check.string('string', 'a b', false, true),
      '"string" must not contain spaces.'
    );
    shouldFail(
      () => check.string('string', '123', false, false, 4, Infinity),
      '"string" length must be at least 4.'
    );
    shouldFail(
      () => check.string('string', '123456', false, false, 4, 5),
      '"string" length must be between 4 and 5.'
    );
    shouldSucceed(() => check.string('string', ''));
    shouldSucceed(() => check.string('string', '1'));
    shouldSucceed(() => check.string('string', 'a'));
    shouldSucceed(() => check.string('string', '/'));
    shouldSucceed(() => check.string('string', ' '));
    shouldSucceed(() => check.string('string', 'ab', true));
    shouldSucceed(() => check.string('string', 'ab', false, true));
    shouldSucceed(() => check.string('string', '', false, false, 0));
    shouldSucceed(() => check.string('string', '1', false, false, 1));
    shouldSucceed(() => check.string('string', '1', false, false, 1, 5));
    shouldSucceed(() => check.string('string', '12', false, false, 1, 4));
    shouldSucceed(() => check.string('string', '123', false, false, 1, 4));
    shouldSucceed(() => check.string('string', '1234', false, false, 1, 4));
    done();
  });

  it('Should check non-empty strings', function(done) {
    shouldFail(() => check.nonEmpty('s', undefined), '"s" must be a string.');
    shouldFail(() => check.nonEmpty('s', null), '"s" must be a string.');
    shouldFail(() => check.nonEmpty('s', ''), '"s" must be a non-empty string.');

    shouldSucceed(() => check.nonEmpty('s', ' '));
    shouldSucceed(() => check.nonEmpty('s', '\n'));
    shouldSucceed(() => check.nonEmpty('s', '\t'));
    done();
  });

  it('Should check intArray', function(done) {
    shouldFail(() => check.intArray('inta', 123), '"inta" must be an array.');
    shouldFail(() => check.intArray('inta', ['a']), '"inta[0]" must be a number.');
    shouldFail(() => check.intArray('inta', [1, 'b']), '"inta[1]" must be a number.');
    shouldFail(() => check.intArray('inta', [1, new Date()]), '"inta[1]" must be a number.');

    shouldSucceed(() => check.intArray('inta', []));
    shouldSucceed(() => check.intArray('inta', [0]));
    shouldSucceed(() => check.intArray('inta', [0, 1]));
    shouldSucceed(() => check.intArray('inta', [0, 1]));
    shouldSucceed(() => check.intArray('inta', [-0, 1]));
    shouldSucceed(() => check.intArray('inta', [-0, -1]));
    done();
  });

  it('Should check startsWith', done => {
    shouldSucceed(() => check.startsWith('ps', 'abcde', ''));
    shouldSucceed(() => check.startsWith('ps', 'abcde', 'a'));
    shouldSucceed(() => check.startsWith('ps', 'abcde', 'ab'));
    shouldSucceed(() => check.startsWith('ps', 'abcde', 'abc'));
    shouldSucceed(() => check.startsWith('ps', 'abc abc', 'abc'));

    shouldFail(() => check.startsWith('ps', 123, 'a'), '"ps" must be a string.');
    shouldFail(() => check.startsWith('ps', '', ' '), '"ps" must start with " ".');
    shouldFail(() => check.startsWith('ps', 'abc', 'bc'), '"ps" must start with "bc".');

    // startWith prefixed
    shouldFail(() => check.startsWith('ps', 'abc', 'abc'), '"ps" must be longer than "abc".');
    shouldSucceed(() => check.startsWith('ps', 'abc', 'abc', false));
    shouldFail(() => check.startsWith('ps', '', ''), '"ps" must be longer than "".');
    shouldSucceed(() => check.startsWith('ps', '', '', false));
    done();
  });

  it('Should check hexColors', done => {
    shouldSucceed(() => check.hexColor('hex', '#abcdef'));
    shouldSucceed(() => check.hexColor('hex', '#aabbcc'));
    shouldSucceed(() => check.hexColor('hex', '#111111'));
    shouldSucceed(() => check.hexColor('hex', '#123456'));
    shouldSucceed(() => check.hexColor('hex', '#ffffff'));
    shouldSucceed(() => check.hexColor('hex', '#000000'));
    shouldSucceed(() => check.hexColor('hex', '#0F0F0F'));
    shouldSucceed(() => check.hexColor('hex', '#FFF'));
    shouldSucceed(() => check.hexColor('hex', '#fff'));
    shouldSucceed(() => check.hexColor('hex', '#aaa'));
    shouldSucceed(() => check.hexColor('hex', '#000'));
    shouldSucceed(() => check.hexColor('hex', '#999'));

    // wrong string size
    shouldFail(() => check.hexColor('hex', ''), '"hex" must be a non-empty string.');

    // wrong type
    shouldFail(() => check.hexColor('hex', null), '"hex" must be a string.');
    shouldFail(() => check.hexColor('hex', undefined), '"hex" must be a string.');
    shouldFail(() => check.hexColor('hex', new Date(123456)), '"hex" must be a string.');

    // wrong pattern (long or short)
    const msg = '"hex" must be an hexadecimal color (e.g., #aa00f8 or #a1f).';
    shouldFail(() => check.hexColor('hex', '123456'), msg);
    shouldFail(() => check.hexColor('hex', 'abcdef'), msg);
    shouldFail(() => check.hexColor('hex', '#12345g'), msg);
    shouldFail(() => check.hexColor('hex', '#ggg', true), msg);

    // wrong pattern (long only)
    const msg2 = '"hex" must be an hexadecimal color (e.g., #aa00f8).';
    shouldFail(() => check.hexColor('hex', '#ff', false), msg2);
    shouldFail(() => check.hexColor('hex', '#fff', false), msg2);
    shouldFail(() => check.hexColor('hex', '#ffff', false), msg2);
    shouldFail(() => check.hexColor('hex', '#fffff', false), msg2);
    shouldFail(() => check.hexColor('hex', '#fffffz', false), msg2);
    shouldFail(() => check.hexColor('hex', '#000', false), msg2);
    shouldFail(() => check.hexColor('hex', '#000', false), msg2);
    done();
  });

  it('Should check rgb/rgba colors', done => {
    shouldSucceed(() => check.rgbColor('color', 'rgb(0,0,0)'));
    shouldSucceed(() => check.rgbColor('color', 'rgb( 0 , 0 , 0 )'));
    shouldSucceed(() => check.rgbColor('color', 'rgb( 0 , 0 , 0 )'));
    shouldSucceed(() => check.rgbColor('color', 'rgba( 0 , 0 , 0, 0)'));
    shouldSucceed(() => check.rgbColor('color', 'rgba( 0 , 0 , 0, 0.2 )'));
    shouldSucceed(() => check.rgbColor('color', 'rgba( 0 , 0 , 0, 0.256 )'));
    shouldSucceed(() => check.rgbColor('color', 'rgba( 0 , 0 , 0, .299)'));
    shouldSucceed(() => check.rgbColor('color', 'rgba( 0 , 0 , 0, .0)'));
    shouldSucceed(() => check.rgbColor('color', 'rgba( 0 , 0 , 0, 1)'));
    shouldSucceed(() => check.rgbColor('color', 'rgba(255,255,255,0.9)'));
    shouldSucceed(() => check.rgbColor('color', 'rgba(255,0,0,0.9)'));
    shouldSucceed(() => check.rgbColor('color', 'rgba(0,255,0,0.9)'));
    shouldSucceed(() => check.rgbColor('color', 'rgba(0,0,255,0.9)'));
    shouldSucceed(() => check.rgbColor('color', 'rgba(0,0,0,0)'));
    shouldSucceed(() => check.rgbColor('color', 'rgba(1,1,1,1)'));

    const msg = '"color" must be an rgb/rgba color ' +
      '(e.g., "rgb(0, 170, 200)" or "rgba(255, 30, 255, 0.5)").';

    shouldFail(() => check.rgbColor('color', null), '"color" must be a string.');
    shouldFail(() => check.rgbColor('color', ''), '"color" must be a non-empty string.');
    shouldFail(() => check.rgbColor('color', 'abc'), msg);
    shouldFail(() => check.rgbColor('color', 'rgb()'), msg);
    shouldFail(() => check.rgbColor('color', 'rgb(123)'), msg);
    shouldFail(() => check.rgbColor('color', 'rgb(1,2)'), msg);
    shouldFail(() => check.rgbColor('color', 'rgb(1,2,)'), msg);
    shouldFail(() => check.rgbColor('color', 'rgba(1,1,1)'), msg);
    shouldFail(() => check.rgbColor('color', 'rgba(1,1,1,.)'), msg);
    shouldFail(() => check.rgbColor('color', 'rgba(1,1,1,)'), msg);
    shouldFail(() => check.rgbColor('color', 'rgba(1,1,1,2)'), msg);
    shouldFail(() => check.rgbColor('color', 'rgba(1,1,1,3)'), msg);
    shouldFail(() => check.rgbColor('color', 'rgba(1,1,1,9)'), msg);
    shouldFail(() => check.rgbColor('color', 'rgba(1,1,1,5.)'), msg);
    shouldFail(() => check.rgbColor('color', 'rgba(1,1,1,0.)'), msg);
    shouldFail(() => check.rgbColor('color', 'rgba(1,1,1,)'), msg);
    shouldFail(() => check.rgbColor('color', 'rgba(1,1,1,0) '), msg);
    shouldFail(() => check.rgbColor('color', 'rgb(1,1,1,0)'), msg);
    shouldFail(() => check.rgbColor('color', ' rgb(1,1,1)'), msg);
    shouldFail(() => check.rgbColor('color', 'rgba( 0 , 0 , 0, 1.0)'), msg);
    shouldFail(() => check.rgbColor('color', 'rgba( 0 , 0 , 0, 1.9)'), msg);
    shouldFail(() => check.rgbColor('color', 'rgba( 0 , 0 , 0, 99.0)'), msg);
    done();
  });

  it('Should check CSS colors', done => {
    shouldSucceed(() => check.cssColor('color', 'yellow'));
    shouldSucceed(() => check.cssColor('color', 'red'));
    shouldSucceed(() => check.cssColor('color', 'green'));
    shouldSucceed(() => check.cssColor('color', 'rgb(0,0,0)'));
    shouldSucceed(() => check.cssColor('color', 'rgb( 0 , 0 , 0 )'));
    shouldSucceed(() => check.cssColor('color', 'rgb( 0 , 0 , 0 )'));
    shouldSucceed(() => check.cssColor('color', 'rgba( 0 , 0 , 0, 0)'));
    shouldSucceed(() => check.cssColor('color', 'rgba( 0 , 0 , 0, 0.2 )'));
    shouldSucceed(() => check.cssColor('color', 'rgba( 0 , 0 , 0, 0.256 )'));
    shouldSucceed(() => check.cssColor('color', 'rgba( 0 , 0 , 0, .299)'));
    shouldSucceed(() => check.cssColor('color', 'rgba( 0 , 0 , 0, .0)'));
    shouldSucceed(() => check.cssColor('color', 'rgba( 0 , 0 , 0, 1)'));
    shouldSucceed(() => check.cssColor('color', 'rgba(255,255,255,0.9)'));
    shouldSucceed(() => check.cssColor('color', 'rgba(255,0,0,0.9)'));
    shouldSucceed(() => check.cssColor('color', 'rgba(0,255,0,0.9)'));
    shouldSucceed(() => check.cssColor('color', 'rgba(0,0,255,0.9)'));
    shouldSucceed(() => check.cssColor('color', 'rgba(0,0,0,0)'));
    shouldSucceed(() => check.cssColor('color', 'rgba(1,1,1,1)'));
    shouldSucceed(() => check.cssColor('color', '#fff'));
    shouldSucceed(() => check.cssColor('color', '#ffffff'));
    shouldSucceed(() => check.cssColor('color', '#000000'));
    shouldSucceed(() => check.cssColor('color', '#000'));
    shouldSucceed(() => check.cssColor('color', '#999'));
    shouldSucceed(() => check.cssColor('color', '#999999'));

    const msg = '"color" must be a CSS color ' +
      '(e.g., "#ff0081", "rgb(0, 170, 10)", "rgba(255, 30, 255, 0.5)" or "red").';

    shouldFail(() => check.cssColor('color', null), '"color" must be a string.');
    shouldFail(() => check.cssColor('color', ''), '"color" must be a non-empty string.');
    shouldFail(() => check.cssColor('color', 'abc'), msg);
    shouldFail(() => check.cssColor('color', 'rgb()'), msg);
    shouldFail(() => check.cssColor('color', 'rgb(123)'), msg);
    shouldFail(() => check.cssColor('color', 'rgb(1,2)'), msg);
    shouldFail(() => check.cssColor('color', 'rgb(1,2,)'), msg);
    shouldFail(() => check.cssColor('color', 'rgba(1,1,1)'), msg);
    shouldFail(() => check.cssColor('color', 'rgba(1,1,1,.)'), msg);
    shouldFail(() => check.cssColor('color', 'rgba(1,1,1,)'), msg);
    shouldFail(() => check.cssColor('color', 'rgba(1,1,1,2)'), msg);
    shouldFail(() => check.cssColor('color', 'rgba(1,1,1,3)'), msg);
    shouldFail(() => check.cssColor('color', 'rgba(1,1,1,9)'), msg);
    shouldFail(() => check.cssColor('color', 'rgba(1,1,1,5.)'), msg);
    shouldFail(() => check.cssColor('color', 'rgba(1,1,1,0.)'), msg);
    shouldFail(() => check.cssColor('color', 'rgba(1,1,1,)'), msg);
    shouldFail(() => check.cssColor('color', 'rgba(1,1,1,0) '), msg);
    shouldFail(() => check.cssColor('color', 'rgb(1,1,1,0)'), msg);
    shouldFail(() => check.cssColor('color', ' rgb(1,1,1)'), msg);
    shouldFail(() => check.cssColor('color', 'rgba( 0 , 0 , 0, 1.0)'), msg);
    shouldFail(() => check.cssColor('color', 'rgba( 0 , 0 , 0, 1.9)'), msg);
    shouldFail(() => check.cssColor('color', 'rgba( 0 , 0 , 0, 99.0)'), msg);
    shouldFail(() => check.cssColor('color', '#ffggff'), msg);
    shouldFail(() => check.cssColor('color', '#ggg'), msg);
    shouldFail(() => check.cssColor('color', '#0'), msg);
    shouldFail(() => check.cssColor('color', '#00'), msg);
    shouldFail(() => check.cssColor('color', '#ff'), msg);
    done();
  });

  it('Should check nulls', function(done) {
    const msg = '"null" must be null.';
    shouldFail(() => check.null('null', undefined), msg);
    shouldFail(() => check.null('null', 'null'), msg);
    shouldFail(() => check.null('null', 0), msg);
    shouldFail(() => check.null('null', false), msg);
    shouldFail(() => check.null('null', new RegExp('123')), msg);
    shouldFail(() => check.null('null', new Date(123)), msg);

    shouldSucceed(() => check.null('null value', null));
    done();
  });

  it('Should check objects', function(done) {
    const msg = '"object" must be an object.';
    shouldFail(() => check.object('object', undefined), msg);
    shouldFail(() => check.object('object', null), msg);
    shouldFail(() => check.object('object', []), msg);
    shouldFail(() => check.object('object', [1, 2, 3]), msg);
    shouldFail(() => check.object('object', [{a: 1}]), msg);

    shouldSucceed(() => check.object('object', {}));
    shouldSucceed(() => check.object('object', new Date()));
    shouldSucceed(() => check.object('object', new RegExp('123')));
    done();
  });

  it('Should check stringArrays', function(done) {
    const msg = '"sa" must be an array.';
    shouldFail(() => check.stringArray('sa', null), msg);
    shouldFail(() => check.stringArray('sa', undefined), msg);
    shouldFail(() => check.stringArray('sa', new RegExp('123')), msg);
    shouldFail(() => check.stringArray('sa', [1]), '"sa[0]" must be a string.');
    shouldFail(() => check.stringArray('sa', ['a', 1]), '"sa[1]" must be a string.');
    shouldFail(() => check.stringArray('sa', new Array(1)), '"sa[0]" must be a string.');
    shouldFail(() => check.stringArray('sa', new Array(2)), '"sa[0]" must be a string.');
    shouldFail(() => check.stringArray('sa', ['a'], 2), '"sa" length must be at least 2.');
    shouldFail(() => check.stringArray('sa', ['a', 'b', 'c'], undefined, 2),
      '"sa" length must be at most 2.'
    );
    shouldFail(() => check.stringArray('sa', ['a', 'b', 'c'], 1, 2),
      '"sa" length must be between 1 and 2.'
    );
    shouldFail(() => check.stringArray('sa', [''], 0, 3, true),
      '"sa[0]" must be a non-empty string.'
    );
    shouldFail(() => check.stringArray('sa', ['a', ''], 0, 3, true),
      '"sa[1]" must be a non-empty string.'
    );

    //noinspection JSPrimitiveTypeWrapperUsage
    shouldSucceed(() => check.stringArray('sa', new Array()));
    //noinspection JSPrimitiveTypeWrapperUsage
    shouldSucceed(() => check.stringArray('sa', new Array('a', 'b')));
    shouldSucceed(() => check.stringArray('sa', []));
    shouldSucceed(() => check.stringArray('sa', [], 0));
    shouldSucceed(() => check.stringArray('sa', [], 0, 0));
    shouldSucceed(() => check.stringArray('sa', ['a']));
    shouldSucceed(() => check.stringArray('sa', ['a'], 1));
    shouldSucceed(() => check.stringArray('sa', ['a'], 1, 1));
    shouldSucceed(() => check.stringArray('sa', ['a'], 0, 1));
    shouldSucceed(() => check.stringArray('sa', ['a'], undefined, 1));
    shouldSucceed(() => check.stringArray('sa', ['a', 'b']));
    shouldSucceed(() => check.stringArray('sa', ['a', 'b'], 2));
    shouldSucceed(() => check.stringArray('sa', ['a', 'b'], 2, 2));
    shouldSucceed(() => check.stringArray('sa', ['a', 'b'], 1, 2));
    shouldSucceed(() => check.stringArray('sa', ['a', 'b'], 0, 2));
    shouldSucceed(() => check.stringArray('sa', ['a', 'b'], undefined, 2));
    shouldSucceed(() => check.stringArray('sa', ['a', 'b'], 2, 2, true));
    done();
  });

  it('Should check legal values', function(done) {
    shouldFail(() => check.values('value', undefined, [1]), '"value" must be 1.');
    shouldFail(() => check.values('value', 2, [1, 3]), '"value" must be one of: 1, 3.');
    shouldFail(() => check.values('value', true, [1, 3]), '"value" must be one of: 1, 3.');
    shouldFail(() => check.values('value', 3, [1, undefined]),
      '"value" must be one of: 1, undefined.'
    );
    shouldFail(() => check.values('value', undefined, []),
      'Library usage error: values must be a non-empty array.'
    );

    shouldSucceed(() => check.values('value', Date, [Date, RegExp]));
    shouldSucceed(() => check.values('value', undefined, [undefined]));
    shouldSucceed(() => check.values('value', 1, [1, 2, 3]));
    shouldSucceed(() => check.values('value', 2, [1, 2, 3]));
    shouldSucceed(() => check.values('value', 3, [1, 2, 3]));
    shouldSucceed(() => check.values('value', null, [null]));
    shouldSucceed(() => check.values('value', NaN, [1, 2, NaN]));
    done();
  });

  it('Should check object keys', function(done) {
    const objMsg = '"object" must be an object.';
    shouldFail(() => check.objectKeys('object', [], []), objMsg);
    shouldFail(() => check.objectKeys('object', 1, []), objMsg);
    shouldFail(() => check.objectKeys('object', null, []), objMsg);
    shouldFail(() => check.objectKeys('object', undefined, []), objMsg);
    shouldFail(() => check.objectKeys('object', new Date(), [], ['getTime']),
      '"object" misses mandatory properties ("getTime").'
    );
    shouldFail(() => check.objectKeys('object', {a: 1}, ['b', 'c']),
      '"object" has unexpected properties ("a").'
    );
    shouldFail(() => check.objectKeys('object', {b: 1}, ['b', 'c'], ['c']),
      '"object" misses mandatory properties ("c").'
    );
    shouldFail(() => check.objectKeys('object', {b: 1}, ['b', 'c', 'd'], true),
      '"object" misses mandatory properties ("c", "d").'
    );

    shouldSucceed(() => check.objectKeys('object', {}, []));
    shouldSucceed(() => check.objectKeys('object', {}, [], []));
    shouldSucceed(() => check.objectKeys('object', {a: 1}, ['a']));
    shouldSucceed(() => check.objectKeys('object', {a: 1}, ['a'], ['a']));
    shouldSucceed(() => check.objectKeys('object', {a: 1, b: 2}, ['a', 'b']));
    shouldSucceed(() => check.objectKeys('object', {a: 1, b: 2}, ['a', 'b'], ['a']));
    shouldSucceed(() => check.objectKeys('object', {a: 1, b: 2}, ['a', 'b'], true));

    done();
  });

  it('Should check object properties', function(done) {
    // no checks, no properties
    shouldSucceed(() => check.properties('object', {}, {}));

    // wrong object
    shouldFail(
      () => check.properties('object', 123, {foo: {required: true}}),
      '"object" must be an object.'
    );

    // required
    shouldFail(
      () => check.properties('object', {}, {foo: {required: true}}),
      '"object.foo" must not be undefined.'
    );
    shouldSucceed(() => check.properties('object', {foo: 1}, {foo: {required: true}}));
    shouldSucceed(() => check.properties('object', {}, {foo: {type: 'number'}}));

    // requiredUnless
    let props = {foo: {requiredUnless: 'bar'}, bar: {}};
    shouldFail(
      () => check.properties('object', {}, props), '"object.foo" must not be undefined.'
    );
    shouldFail(
      () => check.properties('object', {bar: null}, props), '"object.foo" must not be undefined.'
    );
    shouldSucceed(() => check.properties('object', {foo: 'abc'}, props));
    shouldSucceed(() => check.properties('object', {bar: 123}, props));
    shouldSucceed(() => check.properties('object', {bar: false}, props));
    shouldSucceed(() => check.properties('object', {foo: 'abc', bar: 123}, props));

    // requiredIf
    props = {foo: {requiredIf: 'bar'}, bar: {}};
    shouldFail(
      () => check.properties('object', {bar: 'abc'}, props), '"object.foo" must not be undefined.'
    );
    shouldFail(
      () => check.properties('object', {bar: 123}, props), '"object.foo" must not be undefined.'
    );
    shouldSucceed(() => check.properties('object', {}, props));
    shouldSucceed(() => check.properties('object', {bar: null}, props));
    shouldSucceed(() => check.properties('object', {foo: 'abc'}, props));
    shouldSucceed(() => check.properties('object', {foo: 'abc', bar: 123}, props));

    // property type
    shouldFail(
      () => check.properties('object', {foo: 1}, {foo: {type: 'string'}}),
      '"object.foo" must be a string.'
    );
    shouldSucceed(() => check.properties('object', {foo: 1}, {foo: {type: 'number'}}));
    shouldSucceed(() => check.properties('object', {foo: []}, {foo: {type: 'array'}}));
    shouldSucceed(() => check.properties('object', {foo: undefined}, {foo: {type: 'undefined'}}));
    shouldSucceed(() => check.properties('object', {foo: null}, {foo: {type: 'null'}}));

    // property types
    shouldFail(
      () => check.properties('object', {foo: true}, {foo: {type: ['string', 'number']}}),
      '"object.foo" type must be one of: "string", "number".'
    );
    shouldSucceed(
      () => check.properties('object', {foo: 1}, {foo: {type: ['string', 'number']}})
    );
    shouldSucceed(
      () => check.properties('object', {foo: 'a'}, {foo: {type: ['string', 'number']}})
    );

    // property values
    shouldFail(() => check.properties('object', {foo: true}, {foo: {values: [1, 2]}}),
      '"object.foo" must be one of: 1, 2.'
    );
    shouldFail(() => check.properties('object', {foo: true}, {foo: {values: ['lol']}}),
      '"object.foo" must be "lol".'
    );
    shouldSucceed(() => check.properties('object', {foo: 1}, {foo: {values: [1, 2]}}));
    shouldSucceed(() => check.properties('object', {foo: 2}, {foo: {values: [1, 2]}}));

    // strict property policy
    shouldFail(
      () => check.properties('object', {bar: 1}, {foo: {type: 'boolean'}}),
      '"object" has unexpected properties ("bar").'
    );
    shouldSucceed(() => check.properties('object', {}, {bar: {type: 'boolean'}}));
    shouldSucceed(() => check.properties('object', {bar: true}, {bar: {type: 'boolean'}}));
    shouldSucceed(() => check.properties('object',
      {bar: 1, baz: true},
      {bar: {type: 'number'}, baz: {type: 'boolean'}}
    ));

    // strictExists property policy
    shouldFail(
      () => check.properties(
        'object', {foo: 1, baz: null}, {bar: {type: 'number'}, baz: {}}, 'strictExist'
      ),
      '"object" must have at least one of these properties defined ("bar", "baz").'
    );
    shouldSucceed(() => check.properties('object',
      {foo: 1},
      {bar: {type: 'number'}, foo: {type: 'number'}},
      'strictExist'
    ));

    // inclusive property policy
    shouldSucceed(() => check.properties(
      'object', {bar: 1}, {foo: {type: 'boolean'}}, 'inclusive'
    ));
    shouldFail(
      () => check.properties('object', {bar: 1, foo: 2}, {foo: {type: 'boolean'}}, 'inclusive'),
      '"object.foo" must be a boolean.'
    );

    // custom property check
    shouldSucceed(() => check.properties('object',
      {foo: '#fff'}, {foo: {check: (k, v) => check.hexColor(k, v)}}
    ));
    shouldFail(
      () => check.properties(
        'object',  {foo: '123'}, {foo: {check: (k, v) => check.hexColor(k, v)}}
      ),
      '"object.foo" must be an hexadecimal color (e.g., #aa00f8 or #a1f).'
    );

    // custom check (array form)
    shouldSucceed(() => check.properties('object', {foo: 123}, {foo: {check: ['integer']}}));
    shouldSucceed(() => check.properties('object', {foo: 123}, {foo: {check: 'integer'}}));
    shouldFail(
      () => check.properties('object',  {foo: 123}, {foo: {check: 123}}),
      'Library usage error: "definition.check" must be an array or a function.'
    );
    shouldFail(
      () => check.properties('object',  {foo: 123}, {foo: {check: []}}),
      'Library usage error: "definition.check[0]" must be a function name.'
    );
    shouldFail(
      () => check.properties('object',  {foo: 123}, {foo: {check: ['lol']}}),
      'Library usage error: "definition.check[0]" (lol) must be a valid Check function name.'
    );
    shouldFail(
      () => check.properties('object',  {foo: 123}, {foo: {check: ['integer', 124]}}),
      '"object.foo" must be at least 124.'
    );

    done();
  });

  it('Should check a single property', function(done) {
    // unexpected property field
    shouldFail(
      () => check.property('property', {}, {required: true, bla: 1, foo: 'bar'}),
      'Library usage error: "definition" has unexpected properties: "bla", "foo".'
    );

    // required
    shouldFail(
      () => check.property('property', 1, {required: true, type: 'string'}),
      '"property" must be a string.'
    );
    shouldFail(
      () => check.property('property', null, {required: true}),
      '"property" must not be null.'
    );
    shouldSucceed(() => check.property('property', null, {type: 'string'}));
    shouldSucceed(() => check.property('property', undefined, {type: 'string'}));

    // deprecated
    shouldFail(
      () => check.property('property', 1, {deprecated: 'This is the reason why I\'m deprecated'}),
      '"property" is deprecated: This is the reason why I\'m deprecated.'
    );
    shouldSucceed(() => check.property('property', null,
      {deprecated: 'This is the reason why I\'m deprecated'}));

    // sub properties (property is an object with knows keys)
    shouldFail(
      () => check.property('property', [], {properties: {}}),
      '"property" must be an object.'
    );
    shouldFail(
      () => check.property('property', {bar: 1}, {properties: {foo: {required: true}}}),
      '"property" has unexpected properties ("bar").'
    );
    shouldFail(
      () => check.property('property', {bar: 1},
        {properties: {foo: {required: true}}, policy: 'inclusive'}
      ),
      '"property.foo" must not be undefined.'
    );
    shouldSucceed(
      () => check.property('property', {foo: 1}, {properties: {foo: {required: true}}})
    );

    // any property (property is an object with unknown keys)
    shouldSucceed(
      () => check.property('property', {a: 2, b: 3, c: 456}, {anyProperty: {type: 'number'}})
    );
    shouldFail(
      () => check.property('property', {a: 2, b: '3', c: 456}, {anyProperty: {type: 'number'}}),
      '"property.b" must be a number.'
    );
    shouldFail(
      () => check.property('property', 'abc', {anyProperty: {type: 'string'}}),
      '"property" must be an object.'
    );

    // array properties (property is an array)
    shouldSucceed(
      () => check.property('property', [1, 2, 3], {arrayItem: {type: 'number'}})
    );
    shouldSucceed(() => check.property(
      'property', [1, undefined, null], {arrayItem: {type: 'number', required: false}}
    ));
    shouldFail(
      () => check.property('property', 'abc', {arrayItem: {type: 'string'}}),
      '"property" must be an array.'
    );
    shouldFail(
      () => check.property('property', [2, '3', 456], {arrayItem: {type: 'number'}}),
      '"property[1]" must be a number.'
    );
    shouldFail(
      () => check.property(
        'property', [2, null, 456], {arrayItem: {type: 'number', required: true}}
      ),
      '"property[1]" must not be null.'
    );

    // array size (property is an array)
    shouldSucceed(
      () => check.property('property', [1, 2, 3], {arraySize: 3})
    );
    shouldFail(
      () => check.property('property', [2, '3', 456], {arraySize: 2}),
      '"property" length must be 2.'
    );

    done();
  });

  it('Should check a string with a regexp', function(done) {
    shouldSucceed(() => check.regexp('string', '123', /^\d+$/));
    shouldFail(() => check.regexp('string', 123, /\d/), '"string" must be a string.');
    shouldFail(() => check.regexp('string', 'abc', /\d/), '"string" must match pattern /\\d/.');
    shouldFail(
      () => check.regexp('string', 'abc', /a\d/i), '"string" must match pattern /a\\d/i.'
    );
    done();
  });

  it('Should check values types', function(done) {
    shouldSucceed(() => check.type('value', true, 'boolean'));
    shouldSucceed(() => check.type('value', false, 'boolean'));
    shouldSucceed(() => check.type('value', null, 'null'));
    shouldSucceed(() => check.type('value', undefined, 'undefined'));
    shouldSucceed(() => check.type('value', -102, 'number'));
    shouldSucceed(() => check.type('value', 12, 'number'));
    shouldSucceed(() => check.type('value', 12.5, 'number'));
    shouldSucceed(() => check.type('value', Infinity, 'number'));
    shouldSucceed(() => check.type('value', NaN, 'NaN'));
    shouldSucceed(() => check.type('value', 'abc', 'string'));
    shouldSucceed(() => check.type('value', {}, 'object'));
    shouldSucceed(() => check.type('value', [], 'array'));
    shouldSucceed(() => check.type('value', new Array(12), 'array'));
    shouldSucceed(() => check.type('value', /a/, 'object'));
    shouldSucceed(() => check.type('value', new Date(), 'object'));

    shouldFail(
      () => check.type('value', 12, ['string', 'boolean']),
      '"value" type must be one of: "string", "boolean".'
    );
    shouldFail(() => check.type('value', 12, []),
      'Library usage error: check.type: type array must have at least one type.'
    );
    shouldFail(() => check.type('value', 12, undefined),
      'Library usage error: check.type: type array must have at least one type.'
    );

    done();
  });

  it('Should check booleans', function(done) {
    shouldSucceed(() => check.boolean('bool', true));
    shouldSucceed(() => check.boolean('bool', false));
    shouldSucceed(() => check.boolean('bool', undefined, true));
    shouldSucceed(() => check.boolean('bool', true, true, true));
    shouldSucceed(() => check.boolean('bool', undefined, true, undefined));

    shouldFail(() => check.boolean('bool', null), '"bool" must be a boolean.');
    shouldFail(() => check.boolean('bool', undefined), '"bool" must be a boolean.');
    shouldFail(
      () => check.boolean('bool', null, true),
      '"bool" type must be one of: "boolean", "undefined".'
    );

    done();
  });

  it('Should check exclusive object keys', function(done) {
    shouldSucceed(() => check.exclusive('obj', {a: 1, b: 2}, ['x', 'y']));
    shouldSucceed(() => check.exclusive('obj', {a: 1, b: 2}, ['b', 'c']));
    shouldFail(
      () => check.exclusive('obj', {a: 1, b: 2}, ['a', 'b']),
      '"obj" cannot have these properties set at the same time: "a", "b".'
    );
    shouldFail(
      () => check.exclusive('obj', {a: 1, b: 2}, ['x', 'y'], true),
      '"obj" must have one of these properties set: "x", "y".'
    );
    shouldFail(
      () => check.exclusive('obj', {a: null}, ['a', 'b'], true),
      '"obj.a" must not be null.'
    );
    shouldFail(
      () => check.exclusive('obj', {a: undefined}, ['a', 'b'], true),
      '"obj" must have one of these properties set: "a", "b".'
    );

    done();
  });

  it('Should check functions', function(done) {
    shouldSucceed(() => check.function('func', function() {}));
    shouldSucceed(() => check.function('func', () => 1));
    shouldSucceed(() => check.function('func', () => {}));
    shouldSucceed(() => check.function('func', Date));

    shouldFail(() => check.function('func', null), '"func" must be a function.');
    shouldFail(() => check.function('func', undefined), '"func" must be a function.');
    shouldFail(() => check.function('func', 123), '"func" must be a function.');
    shouldFail(() => check.function('func', new Date()), '"func" must be a function.');

    done();
  });

  it('Should check URLs', function(done) {
    shouldSucceed(() => check.url('url', 'http://google.com'));
    shouldSucceed(() => check.url('url', 'http://google.com/'));
    shouldSucceed(() => check.url('url', 'http://google.com/lol.html'));
    shouldSucceed(() => check.url('url', 'http://localhost'));
    shouldSucceed(() => check.url('url', 'http://localhost:8080'));
    shouldSucceed(() => check.url('url', 'https://google.com'));
    shouldSucceed(() => check.httpUrl('url', 'http://google.com'));
    shouldSucceed(() => check.httpUrl('url', 'https://google.com'));
    shouldSucceed(() => check.httpUrl('url', 'http://localhost:7474'));
    shouldSucceed(() => check.url('url', 'http://google.com', 'https?'));
    shouldSucceed(() => check.url('url', 'https://google.com', 'https?'));
    shouldSucceed(() => check.url('url', 'ws://google.com', 'ws'));
    shouldSucceed(() => check.url('url', 'ws://127.0.0.1', 'ws'));
    shouldSucceed(() => check.url('url', 'ws://127.0.0.1:8182', 'ws'));
    shouldSucceed(() => check.url('url', 'ws://localhost', 'ws'));
    shouldSucceed(() => check.url('url', 'mailto://la_maman_de_jean@hotmail.fr', 'mailto'));

    shouldFail(() => check.url('url', 'http://goog le.com/lol.html'), '"url" must be a valid URL.');
    shouldFail(() => check.url('url', null), '"url" must be a string.');
    shouldFail(() => check.url('url', ''), '"url" must be a non-empty string.');
    shouldFail(() => check.url('url', '123'), '"url" must be a valid URL.');
    shouldFail(
      () => check.url('url', 'http://google.fr', 'ws'),
      '"url" must be a valid URL (starting with ws://).'
    );
    shouldFail(
      () => check.url('url', 'ftp://free.fr', 'pifpaf'),
      '"url" must be a valid URL (starting with pifpaf://).'
    );
    shouldFail(
      () => check.httpUrl('url', 'ftp://free.fr'),
      '"url" must be a valid URL (starting with https?://).'
    );

    done();
  });

  it('Should check ports', function(done) {
    shouldSucceed(() => check.port('port', 123));
    shouldSucceed(() => check.port('port', 3000));
    shouldSucceed(() => check.port('port', 8080));
    shouldSucceed(() => check.port('port', 11));
    shouldSucceed(() => check.port('port', 65534));

    shouldFail(() => check.port('port', '123'), '"port" must be a number.');
    shouldFail(() => check.port('port', 12.5), '"port" must be an integer.');
    shouldFail(() => check.port('port', 10), '"port" must be between 11 and 65535.');
    shouldFail(() => check.port('port', 65536), '"port" must be between 11 and 65535.');

    done();
  });

  it('Should check files', function(done) {
    shouldFail(() => check.file('file', 123), '"file" must be a string.');
    shouldFail(() => check.file('file', ''), '"file" must be a non-empty string.');
    shouldFail(
      () => check.file('file', './lolilol_not_a_file'),
      '"file" must be an existing/readable file (./lolilol_not_a_file).'
    );
    shouldFail(
      () => check.file('file', __dirname), `"file" must be a file (${__dirname}).`
    );
    shouldFail(
      () => check.file('file', 'testFile.txt'),
      '"file" must be an existing/readable file (testFile.txt).'
    );
    shouldSucceed(() => check.file('file', 'testFile.txt', path.resolve(__dirname, 'testDir')));
    shouldSucceed(() => check.file('file', __filename));
    done();
  });

  it('Should check directories', function() {
    shouldFail(() => check.dir('dir', 123), '"dir" must be a string.');

    shouldFail(
      () => check.dir('dir', './lolilol_not_a_dir'),
      '"dir" must be an existing/readable directory (./lolilol_not_a_dir).'
    );
    shouldFail(
      () => check.dir('dir', __filename), `"dir" must be a directory (${__filename}).`
    );
    shouldSucceed(() => check.dir('dir', __dirname));
    shouldSucceed(() => check.dir('dir', 'testDir', __dirname));
    shouldFail(
      () => check.dir('dir', 'testDir'), `"dir" must be an existing/readable directory (testDir).`
    );
  });

  it('Should check date', function(done) {
    shouldSucceed(() => check.date('date', new Date()));
    shouldSucceed(() => check.date('date', new Date(0)));
    shouldSucceed(() => check.date('date', new Date('2016-06-09T12:14:25.078Z')));
    shouldSucceed(() => check.date('date', '2016-06-09T12:14:25.078Z', true));

    shouldFail(() => check.date('date', undefined), '"date" must be a valid date.');
    shouldFail(() => check.date('date', null), '"date" must be a valid date.');
    shouldFail(() => check.date('date', ''), '"date" must be a valid date.');
    shouldFail(() => check.date('date', 1), '"date" must be a valid date.');
    shouldFail(() => check.date('date', new Date('')), '"date" must be a valid date.');
    shouldFail(() => check.date('date', '2016-06-09T12:14:25.078Z'), '"date" must be a valid date.');

    done();
  });

});
