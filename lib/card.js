

const Card = {
    create: (rank, suit) => {
        return {
            rank: rank,
            suit: suit,
            toString: () => {
                return rank.toString() + suit.toString()
            },
        }
    },
}

const Rank = {
    RANKS: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
    stringsByRank: {
        10: 'T', 11: 'J', 12: 'Q', 13: 'K', 14: 'A',
    },
    ranksByString: {
        'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14,
    },
    create: (value) => {
        // value could be a string
        value = Rank.ranksByString[value] || value
        return {
            value: value,
            toString: () => {
                return Rank.stringsByRank[value] || value.toString()
            },
        }
    },
}

const Suit = {
    SUITS: ['c', 'd', 'h', 's'],
    getSuits: () => _.clone(Suit.SUITS)
}

/**
 * Sorts cards by descending rank
 **/
const SortFn = (cardA, cardB) => {
    return cardB.rank - cardA.rank
}

module.exports = { Suit, Rank, Card, SortFn }
