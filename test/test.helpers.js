require('./init')
const test = require('tape')
const _ = require('lodash')

const Helpers = require('./helpers')

const { Card } = require('@lib/card')


test('TestHelpers.sameHand', function(t) {
    t.plan(2)

    t.assert(Helpers.sameHand(
        _.map(['Ac', 'Kc', 'Qc', 'Jc', 'Tc'], Card.create),
        _.map(['Ac', 'Kc', 'Qc', 'Jc', 'Tc'], Card.create)
    ))
    t.assert(!Helpers.sameHand(
        _.map(['Ad', 'Kc', 'Qc', 'Jc', 'Tc'], Card.create),
        _.map(['Ac', 'Kc', 'Qc', 'Jc', 'Tc'], Card.create)
    ))
})
