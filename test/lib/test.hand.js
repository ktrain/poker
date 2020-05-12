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
    t.plan(6)
    let input, output, expectedOutput

    input = Hand.create(['Ac', 'Ad', 'Ah', 'Qs', 'Qc'])
    output = Hand.fill(input, Hand.create(['Ac', 'Ad', 'Ah', 'Ks', 'Qs', 'Qc', '2h']))
    expectedOutput = Hand.create(['Ac', 'Ad', 'Ah', 'Qs', 'Qc'])
    t.assert(Helpers.sameHand(output, expectedOutput), 'Already have full hand')

    input = Hand.create(['Ac', 'Ad', 'Ah', 'As'])
    output = Hand.fill(input, Hand.create(['Ac', 'Ad', 'Ah', 'As', 'Ks', 'Qc', '2h']))
    expectedOutput = Hand.create(['Ac', 'Ad', 'Ah', 'As', 'Ks'])
    t.assert(Helpers.sameHand(output, expectedOutput), 'Fill 1 card')

    input = Hand.create(['Th', 'Ts', 'Td'])
    output = Hand.fill(input, Hand.create(['Ks', 'Qs', 'Th', 'Ts', 'Td', '7c', '2h']))
    expectedOutput = Hand.create(['Th', 'Ts', 'Td', 'Ks', 'Qs'])
    t.assert(Helpers.sameHand(output, expectedOutput), 'Fill 2 cards')

    input = Hand.create(['2h', '2c'])
    output = Hand.fill(input, Hand.create(['Ac', 'Td', '9h', '8c', '4s', '2h', '2c']))
    expectedOutput = Hand.create(['2h', '2c', 'Ac', 'Td', '9h'])
    t.assert(Helpers.sameHand(output, expectedOutput), 'Fill 3 cards')

    input = Hand.create(['Ac'])
    output = Hand.fill(input, Hand.create(['Ac', 'Td', '9h', '8c', '4s', '3h', '2c']))
    expectedOutput = Hand.create(['Ac', 'Td', '9h', '8c', '4s'])
    t.assert(Helpers.sameHand(output, expectedOutput), 'Fill 4 cards')

    input = Hand.create([])
    output = Hand.fill(input, Hand.create(['Ac', 'Td', '9h', '8c', '4s', '3h', '2c']))
    expectedOutput = Hand.create(['Ac', 'Td', '9h', '8c', '4s'])
    t.assert(Helpers.sameHand(output, expectedOutput), 'Fill 5 cards')
})

test('Hand.getStraightFlush()', function(t) {
    t.plan(12)
    let input, output, expectedOutput

    input = Hand.create(['Ac', 'Kc', 'Qc', 'Jc', 'Tc', '4s', '2d'])
    output = Hand.getStraightFlush(input)
    expectedOutput = Hand.create(['Ac', 'Kc', 'Qc', 'Jc', 'Tc'])
    t.assert(Helpers.sameHand(output, expectedOutput), 'Royal flush')

    input = Hand.create(['As', 'Tc', '9c', '8c', '7c', '6c', '4d'])
    output = Hand.getStraightFlush(input)
    expectedOutput = Hand.create(['Tc', '9c', '8c', '7c', '6c'])
    t.assert(Helpers.sameHand(output, expectedOutput), 'Straight flush')

    input = Hand.create(['Kd', 'Qd', 'Js', 'Jd', 'Td', '9d', '9c'])
    output = Hand.getStraightFlush(input)
    expectedOutput = Hand.create(['Kd', 'Qd', 'Jd', 'Td', '9d'])
    t.assert(Helpers.sameHand(output, expectedOutput), 'Straight flush with pairs present')

    input = Hand.create(['As', 'Kc', 'Qc', 'Jc', 'Tc', '9c', '8c'])
    output = Hand.getStraightFlush(input)
    expectedOutput = Hand.create(['Kc', 'Qc', 'Jc', 'Tc', '9c'])
    t.assert(Helpers.sameHand(output, expectedOutput), '6-card straight flush')

    input = Hand.create(['Ac', 'Kd', 'Jc', 'Tc', '9c', '8c', '7c'])
    output = Hand.getStraightFlush(input)
    expectedOutput = Hand.create(['Jc', 'Tc', '9c', '8c', '7c'])
    t.assert(Helpers.sameHand(output, expectedOutput), 'Higher flush than the straight flush')

    input = Hand.create(['Ah', 'Qc', 'Jc', 'Tc', '9c', '8c', '5d'])
    output = Hand.getStraightFlush(input)
    expectedOutput = Hand.create(['Qc', 'Jc', 'Tc', '9c', '8c'])
    t.assert(Helpers.sameHand(output, expectedOutput), 'Higher straight than the straight flush')

    input = Hand.create(['Ac', 'Ks', '9d', '5c', '4c', '3c', '2c'])
    output = Hand.getStraightFlush(input)
    expectedOutput = Hand.create(['5c', '4c', '3c', '2c', 'Ac'])
    t.assert(Helpers.sameHand(output, expectedOutput), '5-high straight flush')

    input = Hand.create(['As', 'Ac', 'Ad', '5c', '4c', '3c', '2c'])
    output = Hand.getStraightFlush(input)
    expectedOutput = Hand.create(['5c', '4c', '3c', '2c', 'Ac'])
    t.assert(Helpers.sameHand(output, expectedOutput), '5-high straight flush, multiple aces')

    input = Hand.create(['Ac', 'Kc', 'Qc', 'Jd', 'Tc', '7h', '2h'])
    output = Hand.getStraightFlush(input)
    t.equal(output, null, 'Separate straight and flush')

    input = Hand.create(['Ac', '8c', '7c', '6c', '5s', '3c', '2c'])
    output = Hand.getStraightFlush(input)
    t.equal(output, null, 'Flush only')

    input = Hand.create(['As', 'Jd', '8h', '7c', '6c', '5c', '4c', '2c'])
    output = Hand.getStraightFlush(input)
    t.equal(output, null, 'Straight only')

    input = Hand.create(['Ac', 'Kc', 'Qd', 'Jc', 'Js', '9c', '9h'])
    output = Hand.getStraightFlush(input)
    t.equal(output, null, 'No straight flush, flush, nor straight')
})

test('Hand.getFourOfAKind()', function(t) {
    t.plan(3)
    let input, output, expectedOutput

    input = Hand.create(['Ks', '8d', '8h', '8c', '8s', '6d', '4s'])
    output = Hand.getFourOfAKind(input)
    expectedOutput = Hand.create(['8s', '8h', '8d', '8c', 'Ks'])
    t.assert(Helpers.sameHand(output, expectedOutput), 'four of a kind')

    input = Hand.create(['8s', '8c', '8h', '8d', '9d', '9d', '9s'])
    output = Hand.getFourOfAKind(input)
    expectedOutput = Hand.create(['8s', '8h', '8d', '8c', '9s'])
    t.assert(Helpers.sameHand(output, expectedOutput), 'four of a kind with three of a kind present')

    input = Hand.create(['Ks', 'Qc', 'Jh', '8c', '8s', '6d', '4s'])
    output = Hand.getFourOfAKind(input)
    t.equal(output, null, 'No four of a kind')
})

test('Hand.getFullHouse()', function(t) {
    t.end()
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
    t.plan(6)
    let input, output, expectedOutput

    input = Hand.create(['Tc', 'Jd', 'Qh', 'Ks', 'Ac'])
    output = Hand.getStraight(input)
    expectedOutput = Hand.create(['Ac', 'Ks', 'Qh', 'Jd', 'Tc'])
    t.assert(Helpers.sameHand(output, expectedOutput), '5-card straight')

    input = Hand.create(['Tc', 'Jd', 'Qs', 'Qh', 'Ks', 'Ac', 'Ts'])
    output = Hand.getStraight(input)
    expectedOutput = Hand.create(['Ac', 'Ks', 'Qs', 'Jd', 'Ts'])
    t.assert(Helpers.sameHand(output, expectedOutput), '5-card straight with pairs present')

    input = Hand.create(['4s', '5c', '6d', '7h', '8s', '9c'])
    output = Hand.getStraight(input)
    expectedOutput = Hand.create(['9c', '8s', '7h', '6d', '5c'])
    t.assert(Helpers.sameHand(output, expectedOutput), '6-card straight')

    input = Hand.create(['Ks', 'Tc', 'Ad', '2h', '3s', '4c', '5d'])
    output = Hand.getStraight(input)
    expectedOutput = Hand.create(['5d', '4c', '3s', '2h', 'Ad'])
    t.assert(Helpers.sameHand(output, expectedOutput), '5-high straight')

    input = Hand.create(['Ks', 'Ac', '2d', '3h', '4s'])
    output = Hand.getStraight(input)
    t.equal(output, null, 'no 4-high straight allowed')

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
    expectedOutput = Hand.create(['9s', '9d', '9c', '8s', '8h'])
    t.assert(Helpers.sameHand(output, expectedOutput), 'greater three of a kind')

    input = Hand.create(['9s', '9c', '9h', '9d', '8s', '6d', '4s'])
    output = Hand.getThreeOfAKind(input)
    t.equal(output, null, 'no three of a kind, but four')

    input = Hand.create(['Ks', 'Qc', 'Jh', '8c', '8s', '6d', '4s'])
    output = Hand.getThreeOfAKind(input)
    t.equal(output, null, 'no three of a kind')
})

test('Hand.getTwoPair()', function(t) {
    t.plan(5)
    let input, output, expectedOutput

    input = Hand.create(['Ks', 'Tc', 'Th', '8c', '8s', '6d', '4s'])
    output = Hand.getTwoPair(input)
    expectedOutput = Hand.create(['Th', 'Tc', '8s', '8c', 'Ks'])
    t.assert(Helpers.sameHand(output, expectedOutput), 'two pair')

    input = Hand.create(['8s', '8c', 'Kh', 'Kc', 'Js', 'Jd', '5s'])
    output = Hand.getTwoPair(input)
    expectedOutput = Hand.create(['Kh', 'Kc', 'Js', 'Jd', '8s'])
    t.assert(Helpers.sameHand(output, expectedOutput), 'three pairs')

    input = Hand.create(['8s', '9s', '8h', '9c', 'Ts', 'Td', 'Th'])
    output = Hand.getTwoPair(input)
    expectedOutput = Hand.create(['9s', '9c', '8s', '8h', 'Ts'])
    t.assert(Helpers.sameHand(output, expectedOutput), 'two pair amongst three of a kind')

    input = Hand.create(['9s', '9c', '9h', '8s', '7s', '5d', '4s'])
    output = Hand.getTwoPair(input)
    t.equal(output, null, 'no pairs, but three of a kind')

    input = Hand.create(['Ks', 'Qc', 'Jh', '9c', '8s', '6d', '4s'])
    output = Hand.getTwoPair(input)
    t.equal(output, null, 'no pairs')
})

test('Hand.getPair()', function(t) {
    t.plan(5)
    let input, output, expectedOutput

    input = Hand.create(['Ks', 'Tc', '9h', '8c', '8s', '6d', '4s'])
    output = Hand.getPair(input)
    expectedOutput = Hand.create(['8s', '8c', 'Ks', 'Tc', '9h'])
    t.assert(Helpers.sameHand(output, expectedOutput), 'pair')

    input = Hand.create(['8s', '8c', 'Kh', '9c', '4s', 'Jd', '9s'])
    output = Hand.getPair(input)
    expectedOutput = Hand.create(['9s', '9c', 'Kh', 'Jd', '8s'])
    t.assert(Helpers.sameHand(output, expectedOutput), 'greater pair')

    input = Hand.create(['8s', '9s', '8h', '9c', '4s', '9d', '9h'])
    output = Hand.getPair(input)
    expectedOutput = Hand.create(['8s', '8h', '9s', '9h', '9d'])
    t.assert(Helpers.sameHand(output, expectedOutput), 'pair amongst four of a kind')

    input = Hand.create(['9s', '9c', '9h', '8s', '7s', '5d', '4s'])
    output = Hand.getPair(input)
    t.equal(output, null, 'no pair, but three of a kind')

    input = Hand.create(['Ks', 'Qc', 'Jh', '9c', '8s', '6d', '4s'])
    output = Hand.getPair(input)
    t.equal(output, null, 'no pair')
})
