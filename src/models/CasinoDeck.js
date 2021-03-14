import CasinoCard from './CasinoCard';

export default class CasinoDeck {
    /**
     * @param {number} decksCount
     */
    constructor(decksCount = 1) {
        this.createDeck(decksCount);
        this.burnPile = [];
    }

    /**
     * @param {number} decksCount
     */
    createDeck(decksCount = 1) {
        this.cards = [];
        for (let i = 0; i < decksCount; i += 1) {
            CasinoCard.suits.forEach((suit) => {
                CasinoCard.cards.forEach((card) => {
                    this.cards.push(new CasinoCard(card, suit));
                });
            });
        }
    }

    /**
     * Shuffle the cards, will shuffle the burn pile back into the deck
     */
    shuffleDeck() {
        this.cards = [...this.cards, ...this.burnPile];
        this.burnPile = [];
        for (let i = this.cards.length - 1; i > 0; i -= 1) {
            const newPosition = Math.floor(Math.random() * (i + 1));
            const tempItem = this.cards[i];
            this.cards[i] = this.cards[newPosition];
            this.cards[newPosition] = tempItem;
        }
    }

    /**
     * @param {CasinoCard} cardToBurn
     */
    burnCard(cardToBurn) {
        this.burnPile.push(cardToBurn);
        this.cards = this.cards.filter((card) => card !== cardToBurn);
    }
}
