require('../init.js')
const test = require('tape')

const { Suit, Rank, Card, SortFn } = require('@lib/card')


test('card creation', function(t) {
    t.plan(1)
    card = Card.create('T', 'c')
    t.assert(card.toString() == 'Tc')
})
