const getScriptTagVars = require('./index.js')
const test = require('tape')

test('Extracting vars and objects', t => {
  t.plan(8)
  t.equal(
    getScriptTagVars('<html><script>var foo="foo"</script></html>', 'foo'),
    'foo'
  )
  t.equal(
    getScriptTagVars('<html><script>var foo=null</script></html>', 'foo'),
    null
  )
  t.equal(
    getScriptTagVars('<html><script></script></html>', 'foo'),
    undefined
  )
  t.equal(
    getScriptTagVars('<html><script>window.foo=42</script></html>', 'window.foo'),
    42
  )
  t.deepEqual(
    getScriptTagVars('<html><script>var foo="foo"</script></html>', [
      'foo',
      'bar'
    ]),
    {
      'foo': 'foo',
      'bar': undefined
    }
  )
  t.deepEqual(
    getScriptTagVars(
      '<html><script>var foo={ bar: 42, baz: { qux: "qux" } }</script></html>',
      ['foo', 'bar']
    ),
    {
      'foo': { bar: 42, baz: { qux: 'qux' } },
      'bar': undefined
    }
  )
  t.deepEqual(
    getScriptTagVars(
      '<html><script>window.foo={ bar: 42, baz: { qux: "qux" } }</script></html>',
      ['window.foo', 'bar']
    ),
    {
      'window.foo': { bar: 42, baz: { qux: 'qux' } },
      'bar': undefined
    }
  )
  t.deepEqual(
    getScriptTagVars(
      '<html><script>window.foo=42; var bar="bar"</script></html>',
      ['window.foo', 'bar', 'baz']
    ),
    {
      'window.foo': 42,
      'bar': 'bar',
      'baz': undefined
    }
  )
})
