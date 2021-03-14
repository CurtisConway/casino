import CasinoCard from './CasinoCard';

export default class CasinoDeck {
    constructor() {
        this.createDeck();
    }

    createDeck() {
        this.cards = [];
        CasinoCard.suits.forEach((suit) => {
            CasinoCard.cards.forEach((card) => {
                this.cards.push(new CasinoCard(card, suit));
            });
        });
    }

    shuffleDeck() {
        for (let i = this.cards.length - 1; i > 0; i -= 1) {
            const newPosition = Math.floor(Math.random() * (i + 1));
            const tempItem = this.cards[i];
            this.cards[i] = this.cards[newPosition];
            this.cards[newPosition] = tempItem;
        }
    }
}
