const Card = {
    create: (...args) => {
        let rank, suit
        if (args.length == 1) {
            // could pass [rank, suit] as an array, or `${rank}${suit}` as a string
            [rank, suit] = args[0]
        } else {
            [rank, suit] = args
        }
        return {
            rank: Rank.create(rank),
            suit: suit,
            toString: function() { return this.rank.toString() + this.suit.toString() },
            valueOf: function() { return this.rank.valueOf() },
        }
    },
    sort: (cards) => {
        cards.sort(Card.SortFn)
        return cards
    },
    // sort by descending rank
    SortFn: (cardA, cardB) => cardB.rank.valueOf() - cardA.rank.valueOf()
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
        value = Rank.ranksByString[value] || Number(value)
        return {
            value: value,
            toString: function() { return Rank.stringsByRank[this.value] || this.value.toString() },
            valueOf: function() { return this.value },
        }
    },
}

const Suit = {
    SUITS: ['c', 'd', 'h', 's'],
    getSuits: () => _.clone(Suit.SUITS),
}


module.exports = { Suit, Rank, Card }
