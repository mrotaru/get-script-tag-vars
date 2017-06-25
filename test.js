const getScriptTagVars = require('./index.js')
const assert = require('assert')

assert.deepEqual(getScriptTagVars('<html><script>var foo="foo"</script></html>', 'foo'), {
  foo: 'foo',
})

assert.deepEqual(getScriptTagVars('<html><script>var foo=null</script></html>', 'foo'), {
  foo: null,
})

assert.deepEqual(getScriptTagVars('<html><script></script></html>', 'foo'), {
  foo: undefined,
})

assert.deepEqual(getScriptTagVars('<html><script>var foo="foo"</script></html>', ['foo', 'bar']), {
  foo: 'foo',
  bar: undefined,
})

assert.deepEqual(getScriptTagVars('<html><script>var foo={ bar: 42, baz: { qux: "qux" } }</script></html>', ['foo', 'bar']), {
  foo: { bar: 42, baz: { qux: 'qux' } },
  bar: undefined,
})

assert.deepEqual(getScriptTagVars('<html><script>window.foo={ bar: 42, baz: { qux: "qux" } }</script></html>', ['window.foo', 'bar']), {
  'window.foo': { bar: 42, baz: { qux: 'qux' } },
  bar: undefined,
})
