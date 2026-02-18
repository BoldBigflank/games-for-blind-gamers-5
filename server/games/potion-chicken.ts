import { PlayerType, Room } from '../types';
import { shuffle } from '../utils';
import { EventEmitter } from 'node:events';

type Card = {
    name: string;
    suit: string;
    value: number;
}


const cardStack: Card[] = [
    { name: "Aloe", suit: 'a', value: 1 },
    { name: "Aloe", suit: 'a', value: 1 },
    { name: "Aloe", suit: 'a', value: 1 },
    { name: "Aloe", suit: 'a', value: 1 },
    { name: "Aloe", suit: 'a', value: 1 },
    { name: "Aloe", suit: 'a', value: 1 },
    { name: "Belladonna", suit: 'b', value: 1 },
    { name: "Belladonna", suit: 'b', value: 1 },
    { name: "Belladonna", suit: 'b', value: 1 },
    { name: "Belladonna", suit: 'b', value: 1 },
    { name: "Belladonna", suit: 'b', value: 1 },
    { name: "Belladonna", suit: 'b', value: 1 },
    { name: "Cactus", suit: 'c', value: 1 },
    { name: "Cactus", suit: 'c', value: 1 },
    { name: "Cactus", suit: 'c', value: 1 },
    { name: "Cactus", suit: 'c', value: 1 },
    { name: "Cactus", suit: 'c', value: 1 },
    { name: "Cactus", suit: 'c', value: 1 },
]

class Player implements PlayerType {
    id: string;
    name: string;
    state: string;
    hand: Card[];
    hp: number;

    constructor(playerId: string) {
        this.id = playerId
        this.name = playerId;
        this.state = 'wait';
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

// Create a class for the game
export class PotionChicken implements Room {
    eventEmitter: EventEmitter;
    name: string;
    id: string;
    playerCount: number;
    maxPlayers: number;
    players: Player[];
    deck: Card[];
    pot: Card[];
    state: string;
    turn: number;

    constructor(eventEmitter: EventEmitter, { name, id, playerCount, maxPlayers = 2 }) {
        this.eventEmitter = eventEmitter;
        this.name = name;
        this.id = id;
        this.playerCount = playerCount;
        this.maxPlayers = maxPlayers;
        this.players = [];
        this.deck = [];
        this.pot = [];
        this.state = 'waiting';
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

    addPlayer(playerId) {
        const player = new Player(playerId);
        if (this.players.some(p => p.id === player.id)) {
            return;
        }
        this.players.push(player);
        this.playerCount++;
        this.publishBlobs();
    }

    removePlayer(player) {
        this.players = this.players.filter(p => p !== player);
    }

    publishBlobs = (): void => {
        this.eventEmitter.emit('publish', `room:${this.id}`, this.calculateRoomBlob());
        this.players.forEach(p => {
            this.eventEmitter.emit('publish', `user:${p.id}`, this.calculateUserBlob(p.id));
        });
    }

    calculateRoomBlob(): Record<string, any> {
        return {
            name: this.name,
            state: this.state,
            id: this.id,
            playerCount: this.playerCount,
            maxPlayers: this.maxPlayers,
            turn: this.turn,
            players: this.players.map(p => p.name),
            deck: this.deck.map(c => c.name),
            pot: this.pot.map(c => c.name),
        }
    }

    calculateUserBlob(playerId: string): Record<string, any> {
        const blob: Record<string, any> = {
            id: playerId,
        }
        const player = this.players.find(p => p.id === playerId);
        if (!player) {
            return blob;
        }
        blob.hp = player.hp;
        const playerIndex = this.players.indexOf(player);
        if (player) {
            player.state = 'wait';
            if (this.turn === playerIndex) {
                if (this.state === 'waiting') {
                    blob.state = 'choose'
                    blob.choices = [
                        { value: 'start', label: 'Start the game' },
                    ]
                } else if (this.state === 'playing') {
                    blob.state = 'choose';
                    blob.choices = [
                        ...player.hand.map((c, i) => ({
                            value: i,
                            label: `${c.name} of ${c.suit}`,
                        })),
                        { value: 'challenge', label: 'Challenge the previous player to drink the potion' },
                    ]
                } else if (this.state === 'challenging') {
                    blob.state = 'challenge';
                    blob.choices = [
                        { value: 'drink', label: 'Drink the potion' },
                    ]
                }
            } else {
                blob.state = 'wait';
            }
            blob.hand = player.hand
        }
        return blob;
    }

    setState(state) {
        this.state = state;
    }

    action({ playerId, choice }: { playerId: string, choice: string }) {
        console.log(`potion-chicken action: ${choice}`);
        const player = this.players.find(p => p.id === playerId);
        if (!player) {
            return;
        }
        // a player can add a card from their hand to the pot
        // a player can challenge the previous player to drink the potion
        // A player can start the next round

        switch (choice) {
            case 'start':
                this.setState('playing');
                this.startGame();
                break;
            case 'challenge':
                // TODO: Challenge the previous player to drink the potion
                this.setState('challenging');
                this.turn = (this.turn - 1 + this.players.length) % this.players.length;
                break;
            case 'card':
                const cardIndex = parseInt(choice);
                // TODO: Validate the play
                // Add the card to the pot
                const card = player.removeCardFromHand(cardIndex);
                this.addCardToPot(player, card);

                this.turn = (this.turn + 1) % this.players.length;
                break;
            case 'dare':
                break;
        }
        this.publishBlobs();
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