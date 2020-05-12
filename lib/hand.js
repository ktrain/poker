const _ = require('lodash')

const { Card, Rank, Suit } = require('@lib/card')

const HAND_SIZE = 5


const Hand = {

    create: (cards) => _.map(cards, Card.create),

    contains: (hand, targetCard) => {
        return _.reduce(hand, (result, card) => {
            return result || Card.same(card, targetCard)
        }, false)
    },

    tallyRanks: (hand) => {
        return _.reduce(hand, (tally, card) => {
            const rank = card.rank.valueOf()
            if (!(rank in tally)) tally[rank] = 0
            tally[rank]++
            return tally
        }, {})
    },

    /**
     * `hand` must be sorted by descending rank.
     */
    getMostCommonRank: (hand) => {
        const rankTally = Hand.tallyRanks(hand)
        // ranks get converted to strings when used as object keys
        const ranks = _.map(_.keys(rankTally), Number)
        ranks.sort()
        const mostCommonRank = _.reduce(ranks, (mostCommon, rank) => {
            if (rankTally[rank] >= rankTally[mostCommon] && rank > mostCommon) return rank
            return mostCommon
        }, ranks[0])

        return Rank.create(mostCommonRank)
    },

    /**
     * Returns an array of all cards in `hand` with rank `rank`.
     */
    getAllCardsOfRank: (rank, hand) => {
        return _.reduce(hand, (result, card) => {
            if (card.rank == rank) result.push(card)
            return result
        }, [])
    },

    /**
     * Takes `hand` and, if it has less than `HAND_SIZE` cards, fills out the hand with the highest
     * remaining cards (i.e. "kickers") in `cards`, avoiding duplicates between `hand` and `cards`.
     *
     * `cards` must be sorted by descending rank.
     * Cards used to fill out the hand are appended to `hand` in a new array.
     *
     * Pseudocode example:
     * ```
     * hand = ['9h', '9c', '6d', '6c']
     * cards = ['Td', '9h', '9c', '8d', '6d', '6c', '3h']
     * Evaluator.fillOutHand(hand, cards) -> ['9h', '9c', '6d', '6c', 'Td']
     * ```
     */
    fillOut: (hand, cards) => {
        const cardsToAdd = _.reduce(cards, (result, card) => {
            // add cards that are not already in the hand until HAND_SIZE is reached
            if (result.length < HAND_SIZE && !Hand.contains(hand, card)) result.push(card)
            return result
        }, [])
        return hand + cardsToAdd
    },

    getFourOfAKind: (hand) => {
        hand = Card.sort(_.clone(hand))
        const mostCommonRank = Evaluator.getMostCommonRank(hand)
        let result = Evaluator.getAllCardsOfRank(mostCommonRank)
        if (result.length < 4) return null
        return Hand.fillOut(result, hand)
    },

    getFullHouse: (hand) => {
    },

    getFlush: (hand) => {
        hand = Card.sort(_.clone(hand))
        const suitTally = {}
        let mostCommonSuit = hand[0].suit

        _.each(hand, (card) => {
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
        if (suitTally[mostCommonSuit] < HAND_SIZE) {
            return null
        }

        // flush; get the 5 highest cards in that suit
        return _.reduce(hand, (hand, card) => {
            if (hand.length == 5) return hand
            if (card.suit == mostCommonSuit) hand.push(card)
            return hand
        }, [])
    },

    getStraight: (hand) => {
        hand = Card.sort(_.clone(hand))

        const straight = _.reduce(hand, (straight, card) => {
            const lastCard = straight[straight.length-1]
            if (lastCard.rank == card.rank - 1) {
                straight.push(card)
                return straight
            }
            return [card]
        }, [hand[0]])

        // check for low-A straight
        if (straight.length == HAND_SIZE - 1 && hand[0].rank == 'A') {
            straight.push(hand[0])
        }

        // no straight
        if (straight.length < HAND_SIZE) {
            return null
        }

        // straight; get the 5 highest cards in the sequence
        return straight.slice(0, HAND_SIZE)
    },

}

module.exports = Hand
