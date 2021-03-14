export default class CasinoCard {
    constructor(card = CasinoCard.cards[0], suit = CasinoCard.suits[0]) {
        this.name = card.name;
        this.value = card.value;
        this.suit = suit;
    }

    static suits = ['spades', 'hearts', 'clubs', 'diamonds'];

    static cards = [
        {
            name: 'Ace',
            value: 1,
        },
        {
            name: 'Two',
            value: 2,
        },
        {
            name: 'Three',
            value: 3,
        },
        {
            name: 'Four',
            value: 4,
        },
        {
            name: 'Five',
            value: 5,
        },
        {
            name: 'Six',
            value: 6,
        },
        {
            name: 'Seven',
            value: 7,
        },
        {
            name: 'Eight',
            value: 8,
        },
        {
            name: 'Nine',
            value: 9,
        },
        {
            name: 'Ten',
            value: 10,
        },
        {
            name: 'Jack',
            value: 10,
        },
        {
            name: 'Queen',
            value: 10,
        },
        {
            name: 'King',
            value: 10,
        },
    ]
}
