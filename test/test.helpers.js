require('./init')
const test = require('tape')
const _ = require('lodash')

const Helpers = require('./helpers')

const { Card } = require('@lib/card')


test('TestHelpers.handEquals', function(t) {
    t.plan(4)

    t.assert(Helpers.cardEquals(
        Card.create('Qh'), Card.create('Qh')
    ))
    t.assert(!Helpers.cardEquals(
        Card.create('Qh'), Card.create('Qc')
    ))
    t.assert(!Helpers.cardEquals(
        Card.create('Qh'), Card.create('2h')
    ))
    t.assert(!Helpers.cardEquals(
        Card.create('Qh'), Card.create('2c')
    ))
})


test('TestHelpers.handEquals', function(t) {
    t.plan(2)

    t.assert(Helpers.handEquals(
        _.map(['Ac', 'Kc', 'Qc', 'Jc', 'Tc'], Card.create),
        _.map(['Ac', 'Kc', 'Qc', 'Jc', 'Tc'], Card.create)
    ))
    t.assert(!Helpers.handEquals(
        _.map(['Ad', 'Kc', 'Qc', 'Jc', 'Tc'], Card.create),
        _.map(['Ac', 'Kc', 'Qc', 'Jc', 'Tc'], Card.create)
    ))
})
