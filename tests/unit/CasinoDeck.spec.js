import CasinoDeck from '@/models/CasinoDeck';

describe('CasinoDeck', () => {
    const DECK_MAX_LENGTH = 52;
    it('can create a single deck', () => {
        const deck = new CasinoDeck();
        expect(deck.cards.length).toBe(DECK_MAX_LENGTH);
    });

    it('can create multiple decks', () => {
        const decksCount = 3;
        const deck = new CasinoDeck(decksCount);
        expect(deck.cards.length).toBe(decksCount * DECK_MAX_LENGTH);
    });

    it('can shuffle the deck', () => {
        const unshuffled = new CasinoDeck();
        const shuffled = new CasinoDeck();
        shuffled.shuffleDeck();
        expect(shuffled).not.toMatchObject(unshuffled);
    });

    it('can burn a card', () => {
        const deck = new CasinoDeck();
        deck.burnCard(deck.cards[0]);
        expect(deck.cards.length).toBe(51);
        expect(deck.burnPile.length).toBe(1);
    });

    it('resets the burn pile on shuffle', () => {
        const deck = new CasinoDeck();
        deck.burnCard(deck.cards[0]);
        deck.shuffleDeck();
        expect(deck.cards.length).toBe(52);
        expect(deck.burnPile.length).toBe(0);
    });
});
