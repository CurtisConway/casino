import Blackjack from "@/games/Blackjack";
import PlayerHand from "@/models/PlayerHand";
import CasinoCard from "@/models/CasinoCard";

describe('Blackjack', () => {
    const DECK_MAX_LENGTH = 52;
    const HAND_MAX_LENGTH = 2;
    let playerCount = 1;
    let decksCount = 1;
    let game;

    function getCardCountAfterHandsAreDealt() {
        return (DECK_MAX_LENGTH * decksCount) - (HAND_MAX_LENGTH * (playerCount + 1));
    }

    it('can create a shoe', () => {
        game = new Blackjack();
        expect(game.shoe.cards.length).toBe(52);
    });

    it('can deal hands', () => {
        game = new Blackjack();
        game.dealHands();

        expect(game.dealer.cards.length).toBe(2);
        expect(game.players.length).toBe(1);
        expect(game.players[0].cards.length).toBe(2);
        expect(game.shoe.cards.length).toBe(getCardCountAfterHandsAreDealt());
    });

    it('can deal hands with multiple decks and players', () => {
        playerCount = 2;
        decksCount = 2;
        game = new Blackjack({
            players: playerCount,
            decks: decksCount,
        });
        game.dealHands();

        expect(game.dealer.cards.length).toBe(2);
        expect(game.players.length).toBe(playerCount);
        for (let i = 0; i < playerCount; i++) {
            expect(game.players[i].cards.length).toBe(2);
        }
        expect(game.shoe.cards.length).toBe(getCardCountAfterHandsAreDealt());
    });

    it('can get a hands value', () => {
        const hand = new PlayerHand();
        hand.addCard(new CasinoCard());
        hand.addCard(new CasinoCard());

        console.log(Blackjack.getHandValues(hand));
    });
});
