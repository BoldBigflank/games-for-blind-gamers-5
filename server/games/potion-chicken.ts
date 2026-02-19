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
        const cardToRemove = { ...this.hand[index] };
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
        if (this.players.some(p => p.id === playerId)) {
            return;
        }
        const newPlayer = new Player(playerId);
        this.players.push(newPlayer);
        this.playerCount = this.players.length;
        this.publishBlobs();
    }

    removePlayer(player) {
        this.players = this.players.filter(p => p !== player);
    }


    beatsPot(player: Player) {
        const potCounts = this.sumCards(this.pot, true);
        const playerCounts = this.sumCards(player.hand, false);
        return playerCounts.a >= potCounts.b && playerCounts.b >= potCounts.c && playerCounts.c >= potCounts.a;
    }
    sumCards(cards: Card[], reduce: boolean = true): { a: number, b: number, c: number } {
        // a beats b, b beats c, c beats a
        let counts = {
            a: 0,
            b: 0,
            c: 0,
        }
        cards.forEach(card => {
            counts[card.suit] += card.value;
        });
        if (reduce) {
            // While more than one suit has a count, reduce the counts
            while (Object.values(counts).filter(count => count > 0).length > 1) {
                let lowestCount = Infinity;
                Object.values(counts).forEach(count => {
                    if (count > 0 && count < lowestCount) {
                        lowestCount = count;
                    }
                });
                // Reduce the counts by the lowest count
                Object.keys(counts).forEach(suit => {
                    counts[suit] = Math.max(0, counts[suit] - lowestCount);
                });
            }
        }
        return counts;
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
            deck: this.deck,
            pot: this.pot,
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
                            value: `card:${i}`,
                            label: `${c.value} ${c.name}`,
                        })),
                        { value: 'challenge', label: 'Challenge the previous player to drink the potion' },
                    ]
                } else if (this.state === 'challenging') {
                    blob.state = 'choose';
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
        const [choiceType, choiceValue] = choice.split(':');
        const player = this.players.find(p => p.id === playerId);
        if (!player) {
            return;
        }
        // a player can add a card from their hand to the pot
        // a player can challenge the previous player to drink the potion
        // A player can start the next round

        switch (choiceType) {
            case 'start':
                this.setState('playing');
                this.startGame();
                break;
            case 'challenge':
                // TODO: Challenge the previous player to drink the potion
                this.setState('challenging');
                this.turn = (this.turn - 1 + this.players.length) % this.players.length;
                break;
            case 'drink':
                // if their hand doesn't beat the pot, they lose an hp
                const challenger = this.players[(this.turn + 1) % this.players.length];
                if (!this.beatsPot(player)) {
                    player.removeHp(1);
                } else {
                    // if their hand beats the pot, the challenger loses an hp
                    challenger.removeHp(1);
                    this.turn = (this.turn + 1) % this.players.length;
                }

                if (player.hp <= 0 || challenger.hp <= 0) {
                    this.setState('gameover');
                    return;
                } else {
                    // Fill the players hands up to 3 cards
                    this.players.forEach(player => {
                        while (player.hand.length < 3) {
                            this.drawCard(player);
                        }
                    });
                    this.setState('playing');
                }
                break;
            case 'card':
                const cardIndex = parseInt(choiceValue);
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
        this.pot.push(card);
    }
    startGame() {
        // Shuffle the deck
        this.deck = shuffle([...cardStack]);
        // Deal 3 cards to each player
        this.players.forEach(player => {
            for (let i = 0; i < 3; i++) {
                this.drawCard(player);
            }
        });
    }

    drawCard(player: Player) {
        player.hand.push(this.deck.shift() as Card);
    }
}