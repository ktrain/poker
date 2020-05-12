const _ = require('lodash')

const { Card, Rank, Suit } = require('@lib/card')

const HAND_SIZE = 5


const Hand = {

    create: (cards) => _.map(cards, Card.create),

    sort: (hand) => {
        hand.sort(Card.SortFn)
        return hand
    },

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

    tallySuits: (hand) => {
        return _.reduce(hand, (tally, card) => {
            const suit = card.suit
            if (!(suit in tally)) tally[suit] = 0
            tally[suit]++
            return tally
        }, {})
    },

    getMostCommonRank: (hand) => {
        const tally = Hand.tallyRanks(hand)
        // ranks get converted to strings when used as object keys
        const ranks = _.map(_.keys(tally), Number)
        ranks.sort()
        const mostCommonRank = _.reduce(ranks, (mostCommon, rank) => {
            if (rank > mostCommon && tally[rank] >= tally[mostCommon]) return rank
            return mostCommon
        }, ranks[0])

        return Rank.create(mostCommonRank)
    },

    getMostCommonSuit: (hand) => {
        const tally = Hand.tallySuits(hand)
        const suits = _.keys(tally)
        suits.sort()
        return _.reduce(suits, (mostCommon, suit) => {
            if (tally[suit] > tally[mostCommon]) return suit
            return mostCommon
        }, suits[0])
    },

    getAllCardsOfRank: (rank, hand) => {
        return _.filter(hand, (card) => Rank.same(card.rank, rank))
    },

    getAllCardsOfSuit: (suit, hand) => {
        return _.filter(hand, (card) => card.suit == suit)
    },

    /**
     * Takes `hand` and, if it has less than `size` cards (defaults to HAND_SIZE), fills out the hand
     * with the highest remaining cards (i.e. "kickers") in `cards`, avoiding duplicates between
     * `hand` and `cards`.
     *
     * `cards` must be sorted by descending rank.
     * Cards used to fill out the hand are appended to `hand` in a new array.
     *
     * Pseudocode example:
     * ```
     * hand = ['9h', '9c', '6d', '6c']
     * cards = ['Td', '9h', '9c', '8d', '6d', '6c', '3h']
     * Hand.fill(hand, cards) -> ['9h', '9c', '6d', '6c', 'Td']
     * ```
     */
    fill: (hand, cards, size=HAND_SIZE) => {
        cards = Hand.sort(_.clone(cards))
        return _.reduce(cards, (result, card) => {
            // add cards that are not already in the hand until HAND_SIZE is reached
            if (result.length < size && !Hand.contains(result, card)) result.push(card)
            return result
        }, _.clone(hand))
    },

    getStraightFlush: (hand, length=HAND_SIZE) => {
        hand = Hand.sort(_.clone(hand))
        const suit = Hand.getMostCommonSuit(hand)
        const flush = Hand.getAllCardsOfSuit(suit, hand)
        if (flush.length < length) return null
        return Hand.getStraight(flush, length)
    },

    getFourOfAKind: (hand) => {
        hand = Hand.sort(_.clone(hand))
        const mostCommonRank = Hand.getMostCommonRank(hand)
        let result = Hand.getAllCardsOfRank(mostCommonRank)
        if (result.length < 4) return null
        return Hand.fill(result, hand)
    },

    getFullHouse: (hand) => {
        hand = Hand.sort(_.clone(hand))
        const threeOfAKind = Hand.getThreeOfAKind(hand)
        const pair = Hand.getPair(hand)
        if (!threeOfAKind || !pair) return null
        return threeOfAKind.concat(pair)
    },

    getFlush: (hand, size=HAND_SIZE) => {
        hand = Hand.sort(_.clone(hand))
        const suit = Hand.getMostCommonSuit(hand)
        const flush = Hand.getAllCardsOfSuit(suit, hand)

        if (flush.length < size) {
            return null
        }

        // flush; get the `size` highest cards in that suit
        return _.reduce(hand, (hand, card) => {
            if (hand.length == size) return hand
            if (card.suit == suit) hand.push(card)
            return hand
        }, [])
    },

    getStraight: (hand, length=HAND_SIZE) => {
        hand = Hand.sort(_.clone(hand))

        const straight = _.reduce(hand, (result, card) => {
            const lastCard = result[result.length - 1]
            // if card is the same rank as last card, continue on
            if (Rank.same(lastCard.rank, card.rank)) return result
            // looking for a card that is 1 less than the last one in the streak
            if (Rank.same(lastCard.rank, card.rank + 1)) {
                result.push(card)
                return result
            }
            return [card]
        }, [hand[0]])

        // check for low-A straight
        if (
            // one short of a straight
            straight.length == length - 1
            // straight would be `length`-high
            && Rank.same(straight[0].rank, Rank.create(length))
            // hand has an ace
            && Rank.same(hand[0].rank, Rank.create('A'))
        ) {
            // add the ace
            straight.push(hand[0])
        }

        // no straight
        if (straight.length < length) {
            return null
        }

        // straight; get the `length` highest cards in the sequence
        return straight.slice(0, length)
    },

    /**
     * Gets an array containing the highest-ranked cards of which there exist *exactly* three in
     * `hand`.
     *
     * If no such cards exist, returns `null`.
     */
    getThreeOfAKind: (hand) => {
        hand = Hand.sort(_.clone(hand))
        const rankTally = Hand.tallyRanks(hand)
        // ranks get converted to strings when used as object keys
        const ranks = _.map(_.keys(rankTally), Number)
        const tripRank = _.reduce(ranks, (trip, rank) => {
            if (rankTally[rank] === 3 && rank > trip) return Rank.create(rank)
            return trip
        }, null)

        if (!tripRank) return null

        const trips = Hand.getAllCardsOfRank(tripRank, hand)
        return Hand.fill(trips, hand)
    },

    /**
     * Gets an array containing the two pairs of the highest-ranked cards of which there exist
     * *exactly* two of each in `hand`.
     *
     * If no such cards exist, returns `null`.
     */
    getTwoPair: (hand) => {
        hand = Hand.sort(_.clone(hand))
        const rankTally = Hand.tallyRanks(hand)
        // ranks get converted to strings when used as object keys
        const ranks = _.map(_.keys(rankTally), Number)
        // pairA is the bigger one
        const [ rankA, rankB ] = _.reduce(ranks, ([rankA, rankB], rank) => {
            if (rankTally[rank] === 2) {
                if (rank > rankA) return [Rank.create(rank), rankA]
                if (rank > rankB) return [rankA, Rank.create(rank)]
            }
            return [rankA, rankB]
        }, [null, null])

        if (!rankA || !rankB) return null

        const pairA = Hand.getAllCardsOfRank(rankA, hand)
        const pairB = Hand.getAllCardsOfRank(rankB, hand)
        return Hand.fill(pairA.concat(pairB), hand)
    },

    /**
     * Gets an array containing the two highest-ranked cards of which there exist *exactly* two in
     * `hand`.
     *
     * If no such cards exist, returns `null`.
     */
    getPair: (hand) => {
        hand = Hand.sort(_.clone(hand))
        const rankTally = Hand.tallyRanks(hand)
        // ranks get converted to strings when used as object keys
        const ranks = _.map(_.keys(rankTally), Number)
        const pairRank = _.reduce(ranks, (pair, rank) => {
            if (rankTally[rank] === 2 && rank > pair) return Rank.create(rank)
            return pair
        }, null)

        if (!pairRank) return null

        const pair = Hand.getAllCardsOfRank(pairRank, hand)
        return Hand.fill(pair, hand)
    },

}

module.exports = Hand
