require('../init')
const test = require('tape')
const _ = require('lodash')

const Helpers = require('@test/helpers')

const { Card } = require('@lib/card')
const { Evaluator } = require('@lib/hand')


test('hand evaluation', function(t) {

    t.test('flush', function(st) {
        let input, output, expectedOutput
        st.plan(3)

        // 5-card flush
        input = _.map(['Tc', 'Jc', 'Qc', 'Kc', 'Ac'], Card.create)
        output = Evaluator.getFlush(input)
        expectedOutput = _.map(['Ac', 'Kc', 'Qc', 'Jc', 'Tc'], Card.create)
        st.assert(Helpers.handEquals(output, expectedOutput), '5-card flush')

        // 6-card flush; should take the 5 highest cards
        input = _.map(['9c', '4h', 'Tc', 'Jc', 'Qc', 'Kc', 'Ac'], Card.create)
        output = Evaluator.getFlush(input)
        expectedOutput = _.map(['Ac', 'Kc', 'Qc', 'Jc', 'Tc'], Card.create)
        st.assert(Helpers.handEquals(output, expectedOutput), '6-card flush')

        // no flush
        input = _.map(['2c', 'Tc', 'Jc', 'Qc', 'Kh', 'Ah', 'Th'], Card.create)
        output = Evaluator.getFlush(input)
        st.equal(output, null, 'no flush')
    })

    t.test('straight', function(st) {
        let input, output, expectedOutput
        st.plan(4)

        // 5-card straight
        input = _.map(['Tc', 'Jd', 'Qh', 'Ks', 'Ac'], Card.create)
        output = Evaluator.getStraight(input)
        expectedOutput = _.map(['Ac', 'Ks', 'Qh', 'Jd', 'Tc'], Card.create)
        st.assert(Helpers.handEquals(output, expectedOutput), '5-card straight')

        // 6-card straight; should take the 5 highest cards
        input = _.map(['4s', '5c', '6d', '7h', '8s', '9c'], Card.create)
        output = Evaluator.getStraight(input)
        expectedOutput = _.map(['9c', '8s', '7h', '6d', '5c'], Card.create)
        st.assert(Helpers.handEquals(output, expectedOutput), '6-card straight')

        // 5-high straight
        input = _.map(['Ks', 'Tc', 'Ad', '2h', '3s', '4c', '5d'], Card.create)
        output = Evaluator.getStraight(input)
        expectedOutput = _.map(['5d', '4c', '3s', '2h', 'Ad'], Card.create)
        st.assert(Helpers.handEquals(output, expectedOutput), '5-high straight')

        // no straight
        input = _.map(['2s', '3c', '4d', '5h', '7s', '9c', '8d'], Card.create)
        output = Evaluator.getStraight(input)
        st.equal(output, null, 'no straight')
    })

})
