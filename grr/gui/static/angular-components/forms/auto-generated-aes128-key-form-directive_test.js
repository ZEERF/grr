'use strict';

goog.module('grrUi.forms.autoGeneratedAes128KeyFormDirectiveTest');

const {formsModule} = goog.require('grrUi.forms');
const {generateRandomBytes} = goog.require('grrUi.forms.autoGeneratedAes128KeyFormDirective');
const {stubDirective, testsModule} = goog.require('grrUi.tests');


describe('grr-form-auto-generated-aes128key form directive', () => {
  beforeEach(() => {
    let i = 0;
    const step = 1.0 / 16;

    spyOn(Math, 'random').and.callFake(() => {
      const result = step * i + step / 2;

      if (++i >= 16) {
        i = 0;
      }

      return result;
    });
  });

  describe('generateRandomBytes()', function() {

    it('correctly generates 4-bytes string', () => {
      expect(generateRandomBytes(4)).toBe('01234567');
    });

    it('correctly generates 16 bytes string', () => {
      expect(generateRandomBytes(16)).toBe(
          '0123456789abcdef0123456789abcdef');
    });
  });

  let $compile;
  let $rootScope;

  beforeEach(module('/static/angular-components/forms/' +
      'auto-generated-aes128-key-form.html'));
  beforeEach(module(formsModule.name));
  beforeEach(module(testsModule.name));

  stubDirective('grrFormPrimitive');

  beforeEach(inject(($injector) => {
    $compile = $injector.get('$compile');
    $rootScope = $injector.get('$rootScope');
  }));

  const renderTestTemplate = (value) => {
    $rootScope.value = value;

    const template = '<grr-form-auto-generated-aes128-key value="value" />';
    const element = $compile(template)($rootScope);
    $rootScope.$apply();

    return element;
  };

  it('delegates rendering to grr-form-primitive', () => {
    const element = renderTestTemplate({
      type: 'AutoGeneratedAES128Key',
      value: '',
    });

    const directive = element.find('grr-form-primitive');
    expect(directive.length).toBe(1);
  });

  it('prefills auto-generated key if value is empty', () => {
    renderTestTemplate({
      type: 'AutoGeneratedAES128Key',
      value: '',
    });
    expect($rootScope.value.value).toBe('0123456789abcdef0123456789abcdef');
  });

  it('preserves value if it\'s set', () => {
    renderTestTemplate({
      type: 'AutoGeneratedAES128Key',
      value: 'blah',
    });
    expect($rootScope.value.value).toBe('blah');
  });
});


exports = {};
