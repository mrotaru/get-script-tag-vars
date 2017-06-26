# get-script-tag-vars

Intended use case is to help with integration testing server-rendered apps - more
specifically, to enable checking variables like `__INITIAL_STATE__`.

## Usage

This module exports a function, `getScriptTagVars`. First parameter is the HTML,
and the second one is either a string if you only want to check a single variable,
or an array if multiple.
```js
let vars = getScriptTagVars(html, 'foo') // one variable
let vars = getScriptTagVars(html, ['foo', 'bar']) // multiple
```

It always returns an object, with each requested variable being a key. It
will parse all `script` tags, looking for the variables. An object is
returned even if a single variable is requested:
```js
let vars = getScriptTagVars('<html><script>var foo=42</script></html>', 'foo')
assert.deepEqual(vars, { foo: 42 })
```

More examples in `./test.js`.

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