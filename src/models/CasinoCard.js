export default class CasinoCard {
    constructor(card = CasinoCard.cards[0], suit = CasinoCard.suits[0]) {
        this.name = card.name;
        this.values = card.values;
        this.suit = suit;
    }

    static suits = ['spades', 'hearts', 'clubs', 'diamonds'];

    static cards = [
        {
            name: 'Ace',
            values: [1, 11],
        },
        {
            name: 'Two',
            values: [2],
        },
        {
            name: 'Three',
            values: [3],
        },
        {
            name: 'Four',
            values: [4],
        },
        {
            name: 'Five',
            values: [5],
        },
        {
            name: 'Six',
            values: [6],
        },
        {
            name: 'Seven',
            values: [7],
        },
        {
            name: 'Eight',
            values: [8],
        },
        {
            name: 'Nine',
            values: [9],
        },
        {
            name: 'Ten',
            values: [10],
        },
        {
            name: 'Jack',
            values: [10],
        },
        {
            name: 'Queen',
            values: [10],
        },
        {
            name: 'King',
            values: [10],
        },
    ]
}
