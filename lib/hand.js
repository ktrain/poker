const _ = require('lodash')

const { Card, SortFn } = require('@lib/card')


const Evaluators = {
    getFlush: (cards) -> {
        cards = _.clone(cards).sort()
        const numEachSuit = {}
        const flush = [cards[0]]
        const flushIndex = 0

        for (const i = 1; i < cards.length, i++) {
            if (cards[i].suit == flush[flushIndex].suit) {
                flush.push(cards[i])
                flushIndex++
            }

        _.each(cards, (card) -> {
            if (!card.suit in numEachSuit) numEachSuits[card.suit] = 1
            else numEachSuit[card.suit]++
        })
    },
}

module.exports = Evaluators
