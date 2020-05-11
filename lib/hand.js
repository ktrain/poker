const _ = require('lodash')

const { Card, Suit } = require('@lib/card')

const NUM_CARDS_IN_A_HAND = 5


const Evaluator = {

    getFlush: (cards) => {
        cards = Card.sort(_.clone(cards))
        const suitTally = {}
        let mostCommonSuit = cards[0].suit

        _.each(cards, (card) => {
            if (!(card.suit in suitTally)) {
                suitTally[card.suit] = 1
            } else {
                suitTally[card.suit]++
                if (suitTally[card.suit] > suitTally[mostCommonSuit]) {
                    mostCommonSuit = card.suit
                }
            }
        })

        // no flush
        if (suitTally[mostCommonSuit] < NUM_CARDS_IN_A_HAND) {
            return null
        }

        // flush; get the 5 highest cards in that suit
        return _.reduce(cards, (hand, card) => {
            if (hand.length == 5) return hand
            if (card.suit == mostCommonSuit) hand.push(card)
            return hand
        }, [])
    },

    getStraight: (cards) => {
        cards = Card.sort(_.clone(cards))

        const straight = _.reduce(cards, (straight, card) => {
            const lastCard = straight[straight.length-1]
            if (lastCard.rank == card.rank - 1) {
                straight.push(card)
                return straight
            }
            return [card]
        }, [cards[0]])

        // check for low-A straight
        if (straight.length == NUM_CARDS_IN_A_HAND - 1 && cards[0].rank == 'A') {
            straight.push(cards[0])
        }

        // no straight
        if (straight.length < NUM_CARDS_IN_A_HAND) {
            return null
        }

        // straight; get the 5 highest cards in the sequence
        return straight.slice(0, NUM_CARDS_IN_A_HAND)
    },

}

module.exports = { Evaluator }
