const Card = {
    /**
     * Rank and suit can be provided either as a single string, e.g. 'Ac',
     * or as an array, e.g. ['A', 'c']. In the array case, rank can be either a number or a string.
     */
    create: ([rank, suit]) => {
        return {
            rank: Rank.create(rank),
            suit: suit,
            toString: function() { return this.rank.toString() + this.suit.toString() },
            valueOf: function() { return this.rank.valueOf() },
        }
    },
    // sorts by descending rank, then by suit
    SortFn: (cardA, cardB) => {
        const difference = cardB.rank.valueOf() - cardA.rank.valueOf()
        if (difference != 0) return difference
        return cardB.suit.localeCompare(cardA.suit)
    },
    same: (cardA, cardB) => {
        return Rank.same(cardA.rank, cardB.rank) && cardA.suit == cardB.suit
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
    /**
     * Rank value can be provided either as a number or a string.
     */
    create: (value) => {
        value = Rank.ranksByString[value] || Number(value)
        return {
            value: value,
            toString: function() { return Rank.stringsByRank[this.value] || this.value.toString() },
            valueOf: function() { return this.value },
        }
    },
    same: (rankA, rankB) => rankA.valueOf() == rankB.valueOf(),
}

const Suit = {
    SUITS: ['c', 'd', 'h', 's'],
    getSuits: () => _.clone(Suit.SUITS),
}


module.exports = { Suit, Rank, Card }
