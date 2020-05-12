require('../init')
const _ = require('lodash')
const test = require('tape')

const Helpers = require('@test/helpers')

const { Card, Rank } = require('@lib/card')
const Hand = require('@lib/hand')


test('Hand.sort()', function(t) {
    t.plan(2)
    let input, ranks, expectedResult

    input = Hand.create(['2c', 'Ad', '4h', 'Ts', 'Qc'])
    Hand.sort(input)
    ranks = _.map(input, (card) => card.rank.valueOf())
    t.deepLooseEqual(ranks, [14, 12, 10, 4, 2])

    input = Hand.create(['2c', 'Ad', '2h', '2s', '2d'])
    Hand.sort(input)
    expectedResult = Hand.create(['Ad', '2s', '2h', '2c', '2d'])
    t.assert(Helpers.sameHand(input, expectedResult))
})

test('Hand.contains()', function(t) {
    t.plan(3)
    const hand = Hand.create(['Ad', 'Ac'])

    t.assert(Hand.contains(hand, Card.create('Ad')))
    t.assert(!(Hand.contains(hand, Card.create('As'))))
    t.assert(!(Hand.contains(hand, Card.create('Tc'))))
})

test('Hand.tallyRanks()', function(t) {
    t.plan(1)
    const input = Hand.create(['As', 'Ac', 'Kd', 'Kh', 'Ks', '9d', '3c'])
    const output = Hand.tallyRanks(input)
    const expectedOutput = { 14: 2, 13: 3, 9: 1, 3: 1 }
    t.deepEqual(output, expectedOutput)
})

test('Hand.getMostCommonRank()', function(t) {
    t.plan(4)
    let input, output, expectedOutput

    input = Hand.create(['Tc', 'Td', 'Th', 'Ts'])
    output = Hand.getMostCommonRank(input)
    expectedOutput = Rank.create('T')
    t.assert(Rank.same(output, expectedOutput), 'Four cards of the same rank')

    input = Hand.create(['Tc', 'Td', 'Th', 'Qc', '2d', 'Kh', 'Kc'])
    output = Hand.getMostCommonRank(input)
    expectedOutput = Rank.create('T')
    t.assert(Rank.same(output, expectedOutput), 'Three cards of the same rank amongst others')

    input = Hand.create(['Tc', 'Td', 'Th', 'Ts', '9d', '9h', '9c', '9s'])
    output = Hand.getMostCommonRank(input)
    expectedOutput = Rank.create('T')
    t.assert(Rank.same(output, expectedOutput), 'Pick the higher of two four-of-a-kinds')

    input = Hand.create(['Ac', 'Td', '9c', '7s', '6c', '4c', '2c'])
    output = Hand.getMostCommonRank(input)
    expectedOutput = Rank.create('A')
    t.assert(Rank.same(output, expectedOutput), 'Pick the highest in a hand with unique ranks')
})

test('Hand.fill()', function(t) {
    t.plan(5)
    let input, output, expectedOutput

    input = Hand.create(['Ac', 'Ad', 'Ah', 'Qs', 'Qc'])
    output = Hand.fill(input, Hand.create(['Ac', 'Ad', 'Ah', 'Ks', 'Qs', 'Qc', '2h']))
    expectedOutput = Hand.create(['Ac', 'Ad', 'Ah', 'Qs', 'Qc'])
    t.assert(Helpers.sameHand(output, expectedOutput), 'Already have full hand')

    input = Hand.create(['Ac', 'Ad', 'Ah', 'As'])
    output = Hand.fill(input, Hand.create(['Ac', 'Ad', 'Ah', 'As', 'Ks', 'Qc', '2h']))
    expectedOutput = Hand.create(['Ac', 'Ad', 'Ah', 'As', 'Ks'])
    t.assert(Helpers.sameHand(output, expectedOutput))

    input = Hand.create(['Th', 'Ts', 'Td'])
    output = Hand.fill(input, Hand.create(['Ks', 'Qs', 'Th', 'Ts', 'Td', '7c', '2h']))
    expectedOutput = Hand.create(['Th', 'Ts', 'Td', 'Ks', 'Qs'])
    t.assert(Helpers.sameHand(output, expectedOutput))

    input = Hand.create(['2h', '2c'])
    output = Hand.fill(input, Hand.create(['Ac', 'Td', '9h', '8c', '4s', '2h', '2c']))
    expectedOutput = Hand.create(['2h', '2c', 'Ac', 'Td', '9h'])
    t.assert(Helpers.sameHand(output, expectedOutput))

    input = Hand.create([])
    output = Hand.fill(input, Hand.create(['Ac', 'Td', '9h', '8c', '4s', '3h', '2c']))
    expectedOutput = Hand.create(['Ac', 'Td', '9h', '8c', '4s'])
    t.assert(Helpers.sameHand(output, expectedOutput))
})

test('Hand.getFlush()', function(t) {
    t.plan(3)
    let input, output, expectedOutput

    // 5-card flush
    input = Hand.create(['Tc', 'Jc', 'Qc', 'Kc', 'Ac'])
    output = Hand.getFlush(input)
    expectedOutput = Hand.create(['Ac', 'Kc', 'Qc', 'Jc', 'Tc'])
    t.assert(Helpers.sameHand(output, expectedOutput), '5-card flush')

    // 6-card flush; should take the 5 highest cards
    input = Hand.create(['9c', '4h', 'Tc', 'Jc', 'Qc', 'Kc', 'Ac'])
    output = Hand.getFlush(input)
    expectedOutput = Hand.create(['Ac', 'Kc', 'Qc', 'Jc', 'Tc'])
    t.assert(Helpers.sameHand(output, expectedOutput), '6-card flush')

    // no flush
    input = Hand.create(['2c', 'Tc', 'Jc', 'Qc', 'Kh', 'Ah', 'Th'])
    output = Hand.getFlush(input)
    t.equal(output, null, 'no flush')
})

test('Hand.getStraight()', function(t) {
    t.plan(5)
    let input, output, expectedOutput

    // 5-card straight
    input = Hand.create(['Tc', 'Jd', 'Qh', 'Ks', 'Ac'])
    output = Hand.getStraight(input)
    expectedOutput = Hand.create(['Ac', 'Ks', 'Qh', 'Jd', 'Tc'])
    t.assert(Helpers.sameHand(output, expectedOutput), '5-card straight')

    // 6-card straight; should take the 5 highest cards
    input = Hand.create(['4s', '5c', '6d', '7h', '8s', '9c'])
    output = Hand.getStraight(input)
    expectedOutput = Hand.create(['9c', '8s', '7h', '6d', '5c'])
    t.assert(Helpers.sameHand(output, expectedOutput), '6-card straight')

    // 5-high straight
    input = Hand.create(['Ks', 'Tc', 'Ad', '2h', '3s', '4c', '5d'])
    output = Hand.getStraight(input)
    expectedOutput = Hand.create(['5d', '4c', '3s', '2h', 'Ad'])
    t.assert(Helpers.sameHand(output, expectedOutput), '5-high straight')

    // no 4-high straight
    input = Hand.create(['Ks', 'Ac', '2d', '3h', '4s'])
    output = Hand.getStraight(input)
    t.equal(output, null, 'no 4-high straight')

    // no straight
    input = Hand.create(['2s', '3c', '4d', '5h', '7s', '9c', '8d'])
    output = Hand.getStraight(input)
    t.equal(output, null, 'no straight')
})

test('Hand.getThreeOfAKind()', function(t) {
    t.plan(4)
    let input, output, expectedOutput

    input = Hand.create(['Ks', 'Tc', '8h', '8c', '8s', '6d', '4s'])
    output = Hand.getThreeOfAKind(input)
    expectedOutput = Hand.create(['8h', '8c', '8s', 'Ks', 'Tc'])
    t.assert(Helpers.sameHand(output, expectedOutput), 'three of a kind')

    input = Hand.create(['8s', '8c', '8h', '9c', '4s', '9d', '9s'])
    output = Hand.getThreeOfAKind(input)
    expectedOutput = Hand.create(['9s', '9d', '9c', '8s', '8c'])
    debugger
    t.assert(Helpers.sameHand(output, expectedOutput), 'greater three of a kind')

    input = Hand.create(['9s', '9c', '9h', '9d', '8s', '6d', '4s'])
    output = Hand.getThreeOfAKind(input)
    t.equal(output, null, 'no three of a kind, but four')

    input = Hand.create(['Ks', 'Qc', 'Jh', '8c', '8s', '6d', '4s'])
    output = Hand.getThreeOfAKind(input)
    t.equal(output, null, 'no three of a kind')
})
