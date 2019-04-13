/*
  The MIT License

  Copyright (c) 2017-2019 EclipseSource Munich
  https://github.com/eclipsesource/jsonforms

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
*/
import React from 'react';
import { Provider } from 'react-redux';

import Enzyme, { mount, ReactWrapper } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import {
  Actions,
  ControlElement,
  jsonformsReducer,
  JsonFormsState,
  JsonSchema,
  UISchemaElement
} from '@jsonforms/core';
import {
  materialRenderers, MaterialSimpleAnyOfControl, materialSimpleAnyOfControlTester
} from '../../src';
import { combineReducers, createStore, Store } from 'redux';

Enzyme.configure({ adapter: new Adapter() });

const schema: JsonSchema = {
  anyOf: [{ type: 'string' }, { enum: ['foo', 'bar'] }]
};

const uischema: ControlElement = {
  type: 'Control',
  scope: '#'
};

describe('Material simple any of control tester', () => {
  it('should only be applicable for simple any of cases', () => {
    expect(materialSimpleAnyOfControlTester({ type: 'Foo' }, schema)).toBe(-1);
    expect(materialSimpleAnyOfControlTester(uischema, schema)).toBe(5);

    const nestedSchema: JsonSchema = {
      properties: {
        foo: { anyOf: [{ type: 'string' }, { enum: ['foo', 'bar'] }] }
      }
    };
    const nestedUischema: ControlElement = {
      type: 'Control',
      scope: '#/properties/foo'
    };
    expect(materialSimpleAnyOfControlTester(nestedUischema, nestedSchema)).toBe(
      5
    );
    const schemaNoEnum: JsonSchema = {
      anyOf: [{ type: 'string' }]
    };
    const schemaConflictTypes: JsonSchema = {
      anyOf: [{ type: 'string' }, { type: 'integer', enum: [1, 2] }]
    };
    const schemaAdditionalProps: JsonSchema = {
      anyOf: [{ type: 'string' }, { enum: ['foo', 'bar'] }, { maxLength: 5 }]
    };
    const schemaNoString: JsonSchema = {
      anyOf: [{ type: 'integer' }, { enum: [1, 2] }]
    };
    expect(materialSimpleAnyOfControlTester(uischema, schemaNoEnum)).toBe(-1);
    expect(
      materialSimpleAnyOfControlTester(uischema, schemaConflictTypes)
    ).toBe(-1);
    expect(
      materialSimpleAnyOfControlTester(uischema, schemaAdditionalProps)
    ).toBe(5);
    expect(materialSimpleAnyOfControlTester(uischema, schemaNoString)).toBe(-1);
  });
});

const initJsonFormsStore = (
    testData: any,
    testSchema: JsonSchema,
    testUiSchema: UISchemaElement
  ): Store<JsonFormsState> => {
    const s: JsonFormsState = {
      jsonforms: {
        renderers: materialRenderers
      }
    };
    const store: Store<JsonFormsState> = createStore(
      combineReducers({ jsonforms: jsonformsReducer() }),
      s
    );
    store.dispatch(Actions.init(testData, testSchema, testUiSchema));
    return store;
  };

describe('Material input control', () => {
    let wrapper: ReactWrapper;

    afterEach(() => {
      wrapper.unmount();
    });

    it('render', () => {
      const store = initJsonFormsStore('foo', schema, uischema);
      wrapper = mount(
        <Provider store={store}>
          <MaterialSimpleAnyOfControl schema={schema} uischema={uischema} />
        </Provider>
      );
      const inputs = wrapper.find('input');
      expect(inputs).toHaveLength(1);

      const datalist = wrapper.find('datalist');
      expect(datalist).toHaveLength(1);
      expect(datalist.children()).toHaveLength(2);

      const validation = wrapper.find('p').first();
      expect(validation.props().className).toContain('MuiFormHelperText-root');
      expect(validation.children()).toHaveLength(0);
    });
});
