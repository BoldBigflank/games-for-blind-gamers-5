import { PlayerType, Room } from '../types';

type Card = {
    name: string;
    values: string[];
}


const cardStack: Card[] = [
    { name: "Aloe", values: ['1-a'] },
    { name: "Aloe", values: ['1-a'] },
    { name: "Aloe", values: ['1-a'] },
    { name: "Aloe", values: ['1-a'] },
    { name: "Aloe", values: ['1-a'] },
    { name: "Aloe", values: ['1-a'] },
    { name: "Belladonna", values: ['1-b'] },
    { name: "Belladonna", values: ['1-b'] },
    { name: "Belladonna", values: ['1-b'] },
    { name: "Belladonna", values: ['1-b'] },
    { name: "Belladonna", values: ['1-b'] },
    { name: "Belladonna", values: ['1-b'] },
    { name: "Cactus", values: ['1-c'] },
    { name: "Cactus", values: ['1-c'] },
    { name: "Cactus", values: ['1-c'] },
    { name: "Cactus", values: ['1-c'] },
    { name: "Cactus", values: ['1-c'] },
    { name: "Cactus", values: ['1-c'] },
]

class Player implements PlayerType {
    id: string;
    name: string;
    hand: Card[];
    hp: number;

    constructor(name: string) {
        this.id = crypto.randomUUID();
        this.name = name;
        this.hand = [];
        this.hp = 3;
    }
    addCardToHand(card: Card) {
        this.hand.push(card);
    }
    removeCardFromHand(index: number): Card {
        const cardToRemove = this.hand[index];
        if (!cardToRemove) {
            throw new Error(`Card not found at index ${index}`);
        }
        this.hand = this.hand.filter((_, i) => i !== index);
        return cardToRemove;
    }
    addHp(amount: number) {
        this.hp += amount;
    }
    removeHp(amount: number) {
        this.hp -= amount;
    }
}

const shuffle = (array: any[]) => {
    // Fisher-Yates shuffle
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Create a class for the game
export class PotionChicken implements Room {
    name: string;
    id: string;
    playerCount: number;
    maxPlayers: number;
    players: Player[];
    deck: Card[];
    pot: Card[];
    state: string;
    turn: number;

    constructor({ name, id, playerCount, maxPlayers = 2 }) {
        this.name = name;
        this.id = id;
        this.playerCount = playerCount;
        this.maxPlayers = maxPlayers;
        this.players = [];
        this.deck = [];
        this.pot = [];
        this.state = 'lobby';
        this.turn = 0;
    }
    toString() {
        return JSON.stringify({
            name: this.name,
            id: this.id,
            playerCount: this.playerCount,
            maxPlayers: this.maxPlayers,
            players: this.players.map(p => p.name),
            deck: this.deck.map(c => c.name),
            pot: this.pot.map(c => c.name)
        })
    }

    addPlayer(name) {
        const player = new Player(name);
        if (this.players.some(p => p.id === player.id)) {
            return;
        }
        this.players.push(player);
        if (this.players.length === 2) {
            this.startGame();
        }
    }

    removePlayer(player) {
        this.players = this.players.filter(p => p !== player);
    }

    setState(state) {
        this.state = state;
    }

    action({ playerId, action }) {
        const player = this.players.find(p => p.id === playerId);
        if (!player) {
            return [];
        }
        const cardIndex = action.index
        // a player can add a card from their hand to the pot
        // a player can challenge the previous player to drink the potion
        // A player can start the next round

        const response = [];
        switch (action) {
            case 'start':
                this.setState('playing');
                break;
            case 'play':
                // TODO: Validate the play
                // Add the card to the pot
                const card = player.removeCardFromHand(cardIndex);
                this.addCardToPot(player, card);

                this.turn = (this.turn + 1) % this.players.length;
                break;
            case 'dare':
                break;
        }
        return response;
    }

    addCardToPot(player: Player, card: Card) {
        // Make sure the player 
    }
    startGame() {
        // Shuffle the deck
        this.deck = shuffle([...cardStack]);
        // Deal 3 cards to each player
        this.players.forEach(player => {
            player.hand = this.deck.slice(0, 3);
        });
    }
}