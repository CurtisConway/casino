import CasinoDeck from '@/models/CasinoDeck';

describe('CasinoDeck', () => {
    it('can create the deck', () => {
        const deck = new CasinoDeck();
        expect(deck.cards.length).toBe(52);
    });

    it('can shuffle the deck', () => {
        const unshuffled = new CasinoDeck();
        const shuffled = new CasinoDeck();
        shuffled.shuffleDeck();
        expect(shuffled).not.toMatchObject(unshuffled);
    });
});
