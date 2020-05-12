const _ = require('lodash')

const { Card, Rank, Suit } = require('@lib/card')


const Hand = {

    Defaults: {
        HAND_SIZE: 5,
        FULL_HOUSE_UPPER_SIZE: 3,
        FULL_HOUSE_LOWER_SIZE: 2,
    },

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
     * Takes `hand` and, if it has less than `size` cards (defaults to Hand.Defaults.HAND_SIZE),
     * fills out the hand with the highest remaining cards (i.e. "kickers") in `cards`, avoiding
     * duplicates between `hand` and `cards`.
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
    fill: (hand, cards, size=Hand.Defaults.HAND_SIZE) => {
        cards = Hand.sort(_.clone(cards))
        return _.reduce(cards, (result, card) => {
            // add cards that are not already in the hand until `size` is reached
            if (result.length < size && !Hand.contains(result, card)) result.push(card)
            return result
        }, _.clone(hand))
    },

    getStraightFlush: (hand, length=Hand.Defaults.HAND_SIZE, aceHighOnly=false) => {
        hand = Hand.sort(_.clone(hand))
        const suit = Hand.getMostCommonSuit(hand)
        const flush = Hand.getAllCardsOfSuit(suit, hand)
        if (flush.length < length) return null
        return Hand.getStraight(flush, length, aceHighOnly)
    },

    /**
     * Returns an array containing the highest-ranked cards of which there are *exactly* `n` in
     * `hand`.
     *
     * If no such cards exist, returns null.
     */
    getNOfAKind: (hand, n) => {
        hand = Hand.sort(_.clone(hand))
        const rankTally = Hand.tallyRanks(hand)
        // ranks get converted to strings when used as object keys
        const ranks = _.map(_.keys(rankTally), Number)
        const nRank = _.reduce(ranks, (nRank, rank) => {
            if (rankTally[rank] === n && rank > nRank) return Rank.create(rank)
            return nRank
        }, null)

        if (!nRank) return null

        return Hand.getAllCardsOfRank(nRank, hand)
    },

    /**
     * Gets an array containing the highest-ranked card of which there exist *exactly* four in
     * `hand`.
     *
     * If no such cards exist, returns `null`.
     */
    getFourOfAKind: (hand) => {
        const quads = Hand.getNOfAKind(hand, 4)
        if (!quads) return null
        return Hand.fill(quads, hand)
    },

    /**
     * Gets an array containing the highest-ranked cards of which there exist *exactly* `upperSize`,
     * and the highest-ranked cards of which there exist *exactly* `lowerSize`, in `hand`.
     *
     * The upper and lower sizes default to 3 and 2, respectively.
     * If no such cards exist, returns `null`.
     */
    getFullHouse: (
        hand,
        upperSize=Hand.Defaults.FULL_HOUSE_UPPER_SIZE,
        lowerSize=Hand.Defaults.FULL_HOUSE_LOWER_SIZE,
    ) => {
        hand = Hand.sort(_.clone(hand))
        const upper = Hand.getNOfAKind(hand, upperSize)
        const lower = Hand.getNOfAKind(hand, lowerSize)
        if (!upper || !lower) return null
        return upper.concat(lower)
    },

    /**
     * Gets an array containing the `size` highest cards that are all the same suit in `hand`.
     *
     * `size` defaults to 5.
     * If no such cards exist, returns `null`.
     */
    getFlush: (hand, size=Hand.Defaults.HAND_SIZE) => {
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

    /**
     * Gets an array containing the `length` highest cards of consecutive rank in `hand`. Aces can be
     * high or low unless `aceHighOnly` is passed truthy.
     *
     * `length` defaults to 5.
     * `aceHighOnly` defaults to `false`.
     * If no such cards exist, returns `null`.
     */
    getStraight: (hand, length=Hand.Defaults.HAND_SIZE, aceHighOnly=false) => {
        hand = Hand.sort(_.clone(hand))

        const straight = _.reduce(hand, (result, card) => {
            if (result.length >= length) return result
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
            !aceHighOnly
            // one short of a straight
            && straight.length == length - 1
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

        return straight
    },

    /**
     * Gets an array containing the highest-ranked cards of which there exist *exactly* three in
     * `hand`.
     *
     * If no such cards exist, returns `null`.
     */
    getThreeOfAKind: (hand) => {
        const trips = Hand.getNOfAKind(hand, 3)
        if (!trips) return null
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
        const pair = Hand.getNOfAKind(hand, 2)
        if (!pair) return null
        return Hand.fill(pair, hand)
    },

}

module.exports = Hand
