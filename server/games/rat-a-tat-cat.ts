import { PlayerType, Room } from '../types';
import { shuffle } from '../utils';
import { EventEmitter } from 'node:events';

type Card = {
    name: string;
    value: number;
}

const HAND_SIZE = 4;
const MAX_ROUNDS = 4;

const cardStack: Card[] = [
    { name: "Aloe", value: 1 },
    { name: "Aloe", value: 2 },
    { name: "Aloe", value: 3 },
    { name: "Aloe", value: 4 },
    { name: "Aloe", value: 5 },
    { name: "Aloe", value: 6 },
    { name: "Aloe", value: 7 },
    { name: "Aloe", value: 8 },
    { name: "Aloe", value: 9 },

    { name: "Aloe", value: 1 },
    { name: "Aloe", value: 2 },
    { name: "Aloe", value: 3 },
    { name: "Aloe", value: 4 },
    { name: "Aloe", value: 5 },
    { name: "Aloe", value: 6 },
    { name: "Aloe", value: 7 },
    { name: "Aloe", value: 8 },
    { name: "Aloe", value: 9 },

    { name: "Aloe", value: 1 },
    { name: "Aloe", value: 2 },
    { name: "Aloe", value: 3 },
    { name: "Aloe", value: 4 },
    { name: "Aloe", value: 5 },
    { name: "Aloe", value: 6 },
    { name: "Aloe", value: 7 },
    { name: "Aloe", value: 8 },
    { name: "Aloe", value: 9 },

    { name: "Aloe", value: 1 },
    { name: "Aloe", value: 2 },
    { name: "Aloe", value: 3 },
    { name: "Aloe", value: 4 },
    { name: "Aloe", value: 5 },
    { name: "Aloe", value: 6 },
    { name: "Aloe", value: 7 },
    { name: "Aloe", value: 8 },
    { name: "Aloe", value: 9 },
]

class Player implements PlayerType {
    id: string;
    name: string;
    state: string;
    hand: Card[];
    chosenCard: Card | null;
    score: number;

    constructor(playerId: string, playerName: string) {
        this.id = playerId

        this.name = playerName;
        this.state = 'wait';
        this.hand = [];
        this.chosenCard = null;
        this.score = 0;
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
        this.score += amount;
    }
    removeHp(amount: number) {
        this.score -= amount;
    }
}

// Create a class for the game
export class RatATatCat implements Room {
    eventEmitter: EventEmitter;
    name: string;
    id: string;
    playerCount: number;
    maxPlayers: number;
    players: Player[];
    deck: Card[];
    discard: Card[];
    messages: string[];
    state: string;
    turn: number;
    lastTurn: number | null;
    round: number;


    constructor(eventEmitter: EventEmitter, { name, id, playerCount, maxPlayers = 2 }) {
        this.eventEmitter = eventEmitter;
        this.name = name;
        this.id = id;
        this.playerCount = playerCount;
        this.maxPlayers = maxPlayers;
        this.players = [];
        this.deck = [];
        this.discard = [];
        this.messages = [];
        this.state = 'waiting';
        this.turn = 0;
        this.lastTurn = null;
        this.round = 0;
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

    sumCards(cards: Card[]): number {
        return cards.reduce((acc, card) => acc + card.value, 0);
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
                    hp: p.score,
                };
            }),
            messages: this.messages,
            deck: this.deck,
            discard: this.discard,
            round: this.round,
            lastTurn: this.lastTurn,
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
        blob.hp = player.score;
        blob.name = player.name;
        const playerIndex = this.players.indexOf(player);
        if (player) {
            player.state = 'wait';
            if (this.turn === playerIndex) {
                if (this.state === 'waiting') {
                    blob.state = 'choose'
                    blob.prompt = 'Waiting for more players to join';
                    blob.choices = [];
                    if (this.players.length > 1) {
                        blob.prompt = 'When everyone is ready, start the game';
                        blob.choices.push({ value: 'start', label: 'Start the game' });
                    }
                } else if (this.state === 'playing') {
                    // Has a card chosen
                    if (player.chosenCard) {
                        blob.state = 'choose';
                        blob.prompt = 'Place a card in the discard pile';
                        blob.choices = player.hand.map((c, i) => ({
                            class: `card ${c.name}`,
                            value: `hand:${i}`,
                            label: `${i == 1 || i == 2 ? 'Card' : c.value} in position ${i + 1}`,
                        }))
                        blob.choices.push({ value: 'chosenCard', label: `${player.chosenCard.value} from discard` });
                    } else {
                        blob.state = 'choose';
                        blob.prompt = 'It\'s your turn to choose a card';
                        if (this.lastTurn !== null) blob.prompt += ` (this is your last turn)`;
                        // Draw from the deck or the discard pile
                        blob.choices = [
                            { value: 'draw', label: 'Draw from the deck' },
                            { value: 'discard', label: `Draw ${this.discard[0].value} from the discard pile` },
                        ]
                    }
                    if (this.lastTurn === null) {
                        blob.choices.push({ value: 'challenge', label: 'Call to end the round' });
                    }
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
        // a player can draw a card from the deck
        // a player can draw the top card from the discard pile
        // a player can call to end the round

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
                this.setState('challenging');
                this.messages.push(`${player.name} called to end the round`);
                this.lastTurn = (this.turn - 1 + this.players.length) % this.players.length;
                break;
            case 'draw':
                player.chosenCard = this.deck.shift() as Card;
                this.messages.push(`${player.name} drew a card from the deck`);
                break;
            case 'discard':
                player.chosenCard = this.discard.shift() as Card;
                this.messages.push(`${player.name} drew a ${player.chosenCard.value} from the discard pile`);
                break;
            case 'chosenCard':
                if (!player.chosenCard) {
                    return;
                }
                this.discard.push(player.chosenCard);
                this.messages.push(`${player.name} discarded ${player.chosenCard.value}.`);
                player.chosenCard = null;
                this.turn = (this.turn + 1) % this.players.length;
                break;
            case 'hand':
                // put the card in the discard pile
                const card = player.removeCardFromHand(parseInt(choiceValue));
                this.discard.push(card);
                this.messages.push(`${player.name} discarded ${card.value}.`);
                this.turn = (this.turn + 1) % this.players.length;
                break;
        }
        this.publishBlobs();
    }

    startGame() {
        // Shuffle the deck
        this.deck = shuffle([...cardStack]);
        // Add one card to the discard pile
        this.discard.push(this.deck.shift() as Card);
        // Deal cards to each player
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