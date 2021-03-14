import CasinoDeck from "@/models/CasinoDeck";
import PlayerHand from "@/models/PlayerHand";

export default class Blackjack {
    /**
     * @param {number} decks
     * @param {number} players
     */
    constructor({
        decks = 1,
        players = 1,
    } = {}) {
        this.shoe = new CasinoDeck(decks);
        this.players = [...new Array(players)].map(() => new PlayerHand());
        this.dealer = new PlayerHand();
        this.shoe.shuffleDeck();
    }

    dealHands() {
        for (let cardIndex = 0; cardIndex < 2; cardIndex += 1) {
            for (let playerIndex = 0; playerIndex < this.players.length; playerIndex += 1) {
                this.dealCard(this.players[playerIndex]);
            }
            this.dealCard(this.dealer);
        }
    }

    dealCard(hand) {
        hand.addCard(this.shoe.cards[this.shoe.cards.length - 1]);
        this.shoe.cards.pop();
    }

    static getHandValues(hand) {
        const values = [];
        values.push(hand.cards
            .map((card) => card.value)
            .reduce((accumulator = 0, currentValue) => accumulator + currentValue));
        if (hand.cards.filter((card) => card.name === 'Ace').length > 0 && values[0] + 10 <= 21) {
            values.push(values[0] + 10);
        }
        return values;
    }
}
