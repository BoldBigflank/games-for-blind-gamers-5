import { PlayerType, Room } from '../types';
import { shuffle } from '../utils';
import { EventEmitter } from 'node:events';

type Card = {
    name: string;
    suit: string;
    value: number;
}

const HAND_SIZE = 6;
const POT_START_SIZE = 2

const cardStack: Card[] = [
    { name: "Aloe", suit: 'a', value: 1 },
    { name: "Aloe", suit: 'a', value: 1 },
    { name: "Aloe", suit: 'a', value: 1 },
    { name: "Aloe", suit: 'a', value: 1 },
    { name: "Aloe", suit: 'a', value: 1 },
    { name: "Aloe", suit: 'a', value: 1 },
    { name: "Aloe", suit: 'a', value: 2 },
    { name: "Aloe", suit: 'a', value: 2 },
    { name: "Aloe", suit: 'a', value: 2 },
    { name: "Belladonna", suit: 'b', value: 1 },
    { name: "Belladonna", suit: 'b', value: 1 },
    { name: "Belladonna", suit: 'b', value: 1 },
    { name: "Belladonna", suit: 'b', value: 1 },
    { name: "Belladonna", suit: 'b', value: 1 },
    { name: "Belladonna", suit: 'b', value: 1 },
    { name: "Belladonna", suit: 'b', value: 2 },
    { name: "Belladonna", suit: 'b', value: 2 },
    { name: "Belladonna", suit: 'b', value: 2 },
    { name: "Cactus", suit: 'c', value: 1 },
    { name: "Cactus", suit: 'c', value: 1 },
    { name: "Cactus", suit: 'c', value: 1 },
    { name: "Cactus", suit: 'c', value: 1 },
    { name: "Cactus", suit: 'c', value: 1 },
    { name: "Cactus", suit: 'c', value: 1 },
    { name: "Cactus", suit: 'c', value: 2 },
    { name: "Cactus", suit: 'c', value: 2 },
    { name: "Cactus", suit: 'c', value: 2 },
]

class Player implements PlayerType {
    id: string;
    name: string;
    state: string;
    hand: Card[];
    hp: number;

    constructor(playerId: string, playerName: string) {
        this.id = playerId

        this.name = playerName;
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
    messages: string[];
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
        this.messages = [];
        this.state = 'waiting';
        this.turn = 0;
    }

    addPlayer(playerId, playerName) {
        if (this.players.some(p => p.id === playerId)) {
            return;
        }
        const newPlayer = new Player(playerId, playerName);
        this.players.push(newPlayer);
        this.playerCount = this.players.length;
        this.messages.push(`${newPlayer.name} joined the game`);
        this.publishBlobs();
    }

    removePlayer(player) {
        this.players = this.players.filter(p => p !== player);
        this.messages.push(`${player.name} left the game`);
        this.publishBlobs();
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
            players: this.players.map(p => {
                return {
                    id: p.id,
                    name: p.name,
                    hp: p.hp,
                };
            }),
            messages: this.messages,
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
        blob.name = player.name;
        const playerIndex = this.players.indexOf(player);
        if (player) {
            player.state = 'wait';
            if (this.turn === playerIndex) {
                if (this.state === 'waiting') {
                    blob.state = 'choose'
                    blob.choices = [];
                    if (this.players.length > 1) {
                        blob.choices.push({ value: 'start', label: 'Start the game' });
                    }
                } else if (this.state === 'playing') {
                    blob.state = 'choose';
                    blob.choices = [
                        ...player.hand.map((c, i) => ({
                            value: `card:${i}`,
                            label: `${c.value} ${c.name}`,
                        })),
                    ]
                    if (this.pot.length > POT_START_SIZE) {
                        blob.choices.push({ value: 'challenge', label: 'Challenge the previous player to drink the potion' });
                    }
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
            case 'name':
                this.messages.push(`${player.name} changed their name to ${choiceValue}`);
                player.name = choiceValue;
                break;
            case 'start':
                this.setState('playing');
                this.messages.push(`The game has started!`);
                this.startGame();
                break;
            case 'challenge':
                // TODO: Challenge the previous player to drink the potion
                this.setState('challenging');
                const challenged = this.players[(this.turn - 1 + this.players.length) % this.players.length];
                this.messages.push(`${player.name} challenged ${challenged.name} to drink the potion`);
                this.turn = (this.turn - 1 + this.players.length) % this.players.length;
                break;
            case 'drink':
                // if their hand doesn't beat the pot, they lose an hp
                const challenger = this.players[(this.turn + 1) % this.players.length];
                if (!this.beatsPot(player)) {
                    this.messages.push(`${player.name} lost the challenge and lost 1 hp`);
                    player.removeHp(1);
                } else {
                    // if their hand beats the pot, the challenger loses an hp
                    this.messages.push(`${challenger.name} lost the challenge and lost 1 hp`);
                    challenger.removeHp(1);
                    this.turn = (this.turn + 1) % this.players.length;
                }

                if (player.hp <= 0 || challenger.hp <= 0) {
                    this.setState('gameover');
                    // The winner is the player with >0 hp
                    const winner = this.players.find(p => p.hp > 0);
                    this.messages.push(`Game over! ${winner?.name} wins!`)
                    this.setState('gameover');
                } else {
                    // Move the pot back to the deck
                    this.deck.push(...this.pot);
                    this.pot = [];
                    // Shuffle the deck
                    this.deck = shuffle(this.deck);
                    while (this.pot.length < POT_START_SIZE) {
                        this.addCardToPot(this.deck.shift() as Card);
                    }
                    // Fill the players hands up
                    this.players.forEach(player => {
                        while (player.hand.length < HAND_SIZE) {
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
                this.addCardToPot(card);
                this.messages.push(`${player.name} added a card to the pot.`);
                this.messages.push(`The pot is now at ${this.pot.length} cards.`);
                this.turn = (this.turn + 1) % this.players.length;
                break;
            case 'dare':
                break;
        }
        this.publishBlobs();
    }

    addCardToPot(card: Card) {
        this.pot.push(card);
    }
    startGame() {
        // Shuffle the deck
        this.deck = shuffle([...cardStack]);
        // Put cards in the pot
        for (let i = 0; i < POT_START_SIZE; i++) {
            this.addCardToPot(this.deck.shift() as Card);
        }
        // Deal 3 cards to each player
        this.players.forEach(player => {
            while (player.hand.length < HAND_SIZE) {
                this.drawCard(player);
            }
        });
    }

    drawCard(player: Player) {
        player.hand.push(this.deck.shift() as Card);
    }
}