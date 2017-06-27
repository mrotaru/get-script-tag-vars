# get-script-tag-vars [![Build Status](https://travis-ci.org/mrotaru/get-script-tag-vars.svg?branch=master)](https://travis-ci.org/mrotaru/get-script-tag-vars)

Parse given HTML, look for `script` tags and extract values for given variables.

Intended use case is to help with integration testing server-rendered apps - more
specifically, to enable checking variables like `__INITIAL_STATE__`.

## How it works

Uses `cheerio` to grab all the `script` tags, parses them with `esprima`, and then
uses `estraverse` to find variable declarations and assignments. When such a node
is found, uses `escodegen` to generate a string, which is then evaluated with
[Node's `vm`](https://nodejs.org/api/vm.html).

## Usage

This module exports a function, `getScriptTagVars`. First parameter is the HTML,
and the second one is either a string if you only want to check a single variable,
or an array if multiple.

```js
const getScriptTagVars = require('get-script-tag-vars')
let html = '<html><script>window.foo=42; var bar="bar"</script></html>'

let foo = getScriptTagVars(html, 'window.foo') // => 42
let bar = getScriptTagVars(html, 'bar') // => 'bar'
let obj = getScriptTagVars(html, ['window.foo', 'bar', 'baz'])
// => { 'window.foo': 42, 'bar': 'bar', 'baz': undefined }
```

More examples in [`./test.js`](./test.js).

## Example

```js
const getScriptTagVars = require('get-script-tag-vars')
const assert = require('assert')
const request = require('request-promise-native')

describe('Server-side rendering - initial state', () => {
  it('should have "foo" set', (done) => {
    request('foo/home').then(html => {
      let initialState = getScriptTagVars(html, '__INITIAL_STATE__')
      assert.deepEqual(initialState.foo, {
        foo: 'some value'
      })
      done()
    }).catch(ex => done(ex))
  })
})
```