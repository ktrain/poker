require('./init')
const _ = require('lodash')

const { Card } = require('@lib/card')
const Hand = require('@lib/hand')


const TestHelpers = {
    sameHand: (handA, handB, sort=true) => {
        if (!handA || !handB) return false
        if (sort) {
            handA = Hand.sort(_.clone(handA))
            handB = Hand.sort(_.clone(handB))
        }
        return _.reduce(handA, (result, card, index) => {
            return result && Card.same(card, handB[index])
        }, true)
    },
}

module.exports = TestHelpers
