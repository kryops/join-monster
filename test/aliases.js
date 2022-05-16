import test from 'ava'
import { graphql } from 'graphql'
import schema from '../test-api/schema-basic'
import { partial } from 'lodash'
import { errCheck } from './_util'

const run = partial(graphql, schema)

test('it should resolve aliases on different nesting levels', async t => {
  const { data, errors } = await run(`
    query {
      aliasedUser: user(id: 1) {
        aliasedFullName: fullName
        aliasedPosts: posts {
          aliasedId: id
          aliasedAuthor: author {
            aliasedFullName: fullName
          }
        }
        aliasedFollowing: following(name: "matt") {
          aliasedFullName: fullName
        }
      }
    }
  `)

  errCheck(t, errors)

  t.deepEqual({
    aliasedFullName: 'andrew carlson',
    aliasedPosts: [
      {
        aliasedId: 2,
        aliasedAuthor: {
          aliasedFullName: 'andrew carlson'
        }
      }
    ],
    aliasedFollowing: [
      { aliasedFullName: 'matt elder' }
    ],
  }, data.aliasedUser)
})

test('it should allow an alias to the same relation (without args, same fields)', async t => {
  const { data, errors } = await run(`
    query {
      user(id: 3) {
        following1: following { fullName }
        following2: following { fullName }
      }
    }
  `)

  errCheck(t, errors)
  t.deepEqual({
    following1: [
      { fullName: 'andrew carlson' },
      { fullName: 'matt elder' }
    ],
    following2: [
      { fullName: 'andrew carlson' },
      { fullName: 'matt elder' }
    ],
  }, data.user)
})

test.only('it should handle different args nested within aliases to the same relation', async t => {
  const { data, errors } = await run(`
    query {
      user(id: 3) {
        following1: following {
          fullName
          comments {
            id
          }
        }
        following2: following {
          fullName
          comments(active: true) {
            id
          }
        }
      }
    }
  `)

  errCheck(t, errors)
  t.deepEqual({
    following1: [
      {
        fullName: 'andrew carlson',
        comments: [{ id: 1 }, { id: 4 }, { id: 6 }, { id: 8 }],
      },
      {
        fullName: 'matt elder',
        comments: [{ id: 7 }],
      }
    ],
    following2: [
      {
        fullName: 'andrew carlson',
        comments: [{ id: 1 }, { id: 4 }, { id: 6 }, { id: 8 }]
      },
      {
        fullName: 'matt elder',
        comments: []
      }
    ],
  }, data.user)
})

test('it should allow an alias to the same relation (without args, different fields)', async t => {
  const { data, errors } = await run(`
    query {
      user(id: 3) {
        following1: following { id, fullName }
        following2: following { fullName }
      }
    }
  `)

  errCheck(t, errors)
  t.deepEqual({
    following1: [
      { id: 1, fullName: 'andrew carlson' },
      { id: 2, fullName: 'matt elder' }
    ],
    following2: [
      { fullName: 'andrew carlson' },
      { fullName: 'matt elder' }
    ],
  }, data.user)
})

test('it should allow an alias to the same relation (one with args)', async t => {
  const { data, errors } = await run(`
    query {
      user(id: 3) {
        following { fullName }
        andrews: following(name: "andrew") { fullName }
      }
    }
  `)

  errCheck(t, errors)
  t.deepEqual({
    following: [
      { fullName: 'andrew carlson' },
      { fullName: 'matt elder' }
    ],
    andrews: [
      { fullName: 'andrew carlson' },
    ]
  }, data.user)
})

test('it should allow an alias to the same relation (both with args)', async t => {
  const { data, errors } = await run(`
    query {
      user(id: 3) {
        following(name: "matt") { fullName }
        andrews: following(name: "andrew") { fullName }
      }
    }
  `)

  errCheck(t, errors)
  t.deepEqual({
    following: [
      { fullName: 'matt elder' }
    ],
    andrews: [
      { fullName: 'andrew carlson' },
    ]
  }, data.user)
})

test('it should allow multiple different aliases to the same relation (one with args)', async t => {
  const { data, errors } = await run(`
    query {
      user(id: 3) {
        follow: following { fullName }
        andrews: following(name: "andrew") { fullName }
      }
    }
  `)

  errCheck(t, errors)
  t.deepEqual({
    follow: [
      { fullName: 'andrew carlson' },
      { fullName: 'matt elder' }
    ],
    andrews: [
      { fullName: 'andrew carlson' },
    ]
  }, data.user)
})

test('it should allow multiple different aliases to the same relation (both with args)', async t => {
  const { data, errors } = await run(`
    query {
      user(id: 3) {
        matts: following(name: "matt") { fullName }
        andrews: following(name: "andrew") { fullName }
      }
    }
  `)

  errCheck(t, errors)
  t.deepEqual({
    matts: [
      { fullName: 'matt elder' }
    ],
    andrews: [
      { fullName: 'andrew carlson' },
    ]
  }, data.user)
})

test('it should allow multiple different aliases to the same relation with args (via fragment)', async t => {
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
  t.deepEqual({
    matts: [
      { fullName: 'matt elder' }
    ],
    andrews: [
      { fullName: 'andrew carlson' },
    ]
  }, data.user)
})

test('it should allow multiple different aliases to the same relation with args (via inline fragment)', async t => {
  const { data, errors } = await run(`
    query {
      user(id: 3) {
        ... on User {
          matts: following(name: "matt") { fullName }
          andrews: following(name: "andrew") { fullName }
        }
      }
    }
  `)

  errCheck(t, errors)
  t.deepEqual({
    matts: [
      { fullName: 'matt elder' }
    ],
    andrews: [
      { fullName: 'andrew carlson' },
    ]
  }, data.user)
})
