import test from 'ava'
import { graphql } from 'graphql'
import schema from '../test-api/schema-basic'
import { partial } from 'lodash'
import { errCheck } from './_util'

const run = partial(graphql, schema)

test('it should allow multiple different aliases to the same relation', async t => {
  const { data, errors } = await run(`
    query {
      user(id: 3) {
        matts: following(name: "matt") { fullName }
        andrews: following(name: "andrew") { fullName }
      }
    }
  `)

  errCheck(t, errors)
  t.deepEqual(data.user, {
    matts: [
      { fullName: 'matt elder' }
    ],
    andrews: [
      { fullName: 'andrew carlson' },
    ]
  })
})

test('it should allow multiple different aliases to the same relation (via fragment)', async t => {
  const { data, errors } = await run(`
    fragment foo on User {
      matts: following(name: "matt") { fullName }
      andrews: following(name: "andrew") { fullName }
    }
    query {
      user(id: 3) {
        ...foo
      }
    }
  `)

  errCheck(t, errors)
  t.deepEqual(data.user, {
    matts: [
      { fullName: 'matt elder' }
    ],
    andrews: [
      { fullName: 'andrew carlson' },
    ]
  })
})