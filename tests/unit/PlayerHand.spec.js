import PlayerHand from "@/models/PlayerHand";
import CasinoCard from "@/models/CasinoCard";

describe('PlayerHand', () => {
    const hand = new PlayerHand();

    it('can add a card', () => {
        hand.addCard(new CasinoCard());
        expect(hand.cards.length).toBe(1);
    });

    it('can remove a card', () => {
        hand.removeCard(hand.cards[0]);
        expect(hand.cards.length).toBe(0);
    });
});
