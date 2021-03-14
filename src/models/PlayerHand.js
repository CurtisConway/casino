export default class PlayerHand {
    constructor() {
        this.cards = [];
    }

    /**
     * @param {CasinoCard} card
     */
    addCard(card) {
        this.cards.push(card);
    }

    /**
     * @param {CasinoCard} cardToRemove
     */
    removeCard(cardToRemove) {
        this.cards = this.cards.filter((card) => card !== cardToRemove);
    }
}
