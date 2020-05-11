const _ = require('lodash')

const TestHelpers = {
    cardEquals: (cardA, cardB) => {
        return cardA.rank.valueOf() == cardB.rank.valueOf() && cardA.suit == cardB.suit
    },
    handEquals: (handA, handB) => {
        return _.reduce(handA, (result, card, index) => {
            return result && TestHelpers.cardEquals(card, handB[index])
        }, true)
    },
}

module.exports = TestHelpers
