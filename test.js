const getScriptTagVars = require('./index.js')
const test = require('tape')

test('Extracting vars and objects', (t) => {
  t.plan(6)
  t.deepEqual(getScriptTagVars('<html><script>var foo="foo"</script></html>', 'foo'), {
    foo: 'foo',
  })
  t.deepEqual(getScriptTagVars('<html><script>var foo=null</script></html>', 'foo'), {
    foo: null,
  })
  t.deepEqual(getScriptTagVars('<html><script></script></html>', 'foo'), {
    foo: undefined,
  })
  t.deepEqual(getScriptTagVars('<html><script>var foo="foo"</script></html>', ['foo', 'bar']), {
    foo: 'foo',
    bar: undefined,
  })
  t.deepEqual(getScriptTagVars('<html><script>var foo={ bar: 42, baz: { qux: "qux" } }</script></html>', ['foo', 'bar']), {
    foo: { bar: 42, baz: { qux: 'qux' } },
    bar: undefined,
  })
  t.deepEqual(getScriptTagVars('<html><script>window.foo={ bar: 42, baz: { qux: "qux" } }</script></html>', ['window.foo', 'bar']), {
    'window.foo': { bar: 42, baz: { qux: 'qux' } },
    bar: undefined,
  })
})
