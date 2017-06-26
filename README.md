# get-script-tag-vars

Intended use case is to help with integration testing server-rendered apps - more
specifically, to enable checking variables like `__INITIAL_STATE__`.

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