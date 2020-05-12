require('./init')
const _ = require('lodash')

const { Card } = require('@lib/card')


const TestHelpers = {
    sameHand: (handA, handB) => {
        return _.reduce(handA, (result, card, index) => {
            return result && Card.same(card, handB[index])
        }, true)
    },
}

module.exports = TestHelpers
