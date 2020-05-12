require('../init')
const _ = require('lodash')
const test = require('tape')

const { Suit, Rank, Card } = require('@lib/card')


test('Card.create()', function(t) {
    let card

    // array args
    card = Card.create(['J', 's'])
    t.looseEqual(card.rank, 11)
    t.equal(card.suit, 's')
    t.equal(card.toString(), 'Js')

    // string arg
    card = Card.create('Qh')
    t.looseEqual(card.rank, 12)
    t.equal(card.suit, 'h')
    t.equal(card.toString(), 'Qh')

    t.end()
})

test('Card comparison', function(t) {

    t.test('gt', function(st) {
        st.plan(5)
        st.assert(Card.create('5c') > Card.create('3s'))
        st.assert(Card.create('Td') > Card.create('9c'))
        st.assert(Card.create('Qh') > Card.create('9d'))
        st.assert(Card.create('Ks') > Card.create('Jh'))
        st.assert(Card.create('Ah') > Card.create('2s'))
    })

    t.test('lt', function(st) {
        st.plan(5)
        st.assert(Card.create('2c') < Card.create('Ad'))
        st.assert(Card.create('Qd') < Card.create('Kh'))
        st.assert(Card.create('9h') < Card.create('Js'))
        st.assert(Card.create('5s') < Card.create('8c'))
        st.assert(Card.create('2c') < Card.create('3d'))
    })

    t.test('Card.same()', function(st) {
        st.plan(4)

        st.assert(
            Card.same(Card.create('Qh'), Card.create('Qh'))
        )
        st.assert(
            !Card.same(Card.create('Qh'), Card.create('Qc'))
        )
        st.assert(
            !Card.same(Card.create('Qh'), Card.create('2h'))
        )
        st.assert(
            !Card.same(Card.create('Qh'), Card.create('2c'))
        )
    })

})

test('Card.sort()', function(t) {
    t.plan(1)
    let cards, ranks

    cards = _.map(['2c', 'Ad', '4h', 'Ts', 'Qc'], Card.create)
    Card.sort(cards)
    ranks = _.map(cards, (card) => card.rank.valueOf())
    t.deepLooseEqual(ranks, [14, 12, 10, 4, 2])
})
