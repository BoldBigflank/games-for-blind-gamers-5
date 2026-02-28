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
    hidden: boolean;

    constructor(playerId: string, playerName: string) {
        this.id = playerId

        this.name = playerName;
        this.state = 'wait';
        this.hand = [];
        this.chosenCard = null;
        this.score = 0;
        this.hidden = false;
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

    endRound() {
        // Sum the players' hands and add it to the score
        this.players.forEach(player => {
            player.score += this.sumCards(player.hand);
            this.messages.push(`${player.name} scored ${player.score} points (${player.hand.map(c => c.value).join(', ')}) and now has${player.score} points`);
            // Move all the cards to the discard pile
            this.discard.push(...player.hand);
            player.hand = [];
        })
        // Increment the round
        this.round++;
        // Shuffle the discard pile
        this.discard = shuffle(this.discard);
        // Move the discard pile to the bottom of the deck
        this.deck.unshift(...this.discard);
        this.discard = [];
        // Deal cards to each player
        this.players.forEach(player => {
            while (player.hand.length < HAND_SIZE) {
                this.drawCard(player);
            }
            player.hidden = false;
        });
        this.setState('waiting');
        this.lastTurn = null;
        if (this.round >= MAX_ROUNDS) {
            const winner = this.players.sort((a, b) => b.score - a.score)[0];
            this.setState('ended');
            this.messages.push(`The game has ended! The winner is ${winner.name } with ${winner.score} points`);
        }
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

        // Layout

        // [Game Name, Player Count/Max Players]
        // [Round #/Max Rounds]
        // [Player 0(turn), Player 1(lastTurn), Player 2(self), Player 3]
        // [Draw pile, Discard Pile]

        return {
            layout: [
                [
                    {
                        type: 'text',
                        text: this.name,
                    },
                    {
                        type: 'text',
                        text: `${this.playerCount}/${this.maxPlayers} Players`,
                    },
                ],
                [
                    {
                        type: 'text',
                        text: `Round ${this.round + 1} of ${MAX_ROUNDS}`,
                    },
                ],
                [
                    ...this.players.map((p, index) => {
                        const attributes: string[] = [];
                        if (this.turn === index) {
                            attributes.push('turn');
                        }
                        if (this.lastTurn === index) {
                            attributes.push('lastTurn');
                        }
                        return {
                            type: 'player',
                            id: p.id,
                            name: p.name,
                            score: p.score,
                            attributes
                        }
                    }),
                ],
                [
                    {
                        type: 'pile',
                        name: 'Draw Pile',
                        cards: this.deck,
                        attributes: ['hidden'],
                    },
                    {
                        type: 'pile',
                        name: 'Discard Pile',
                        cards: this.discard,
                        attributes: ['visible'],
                    },
                ],
            ],
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
            if (!player.hidden && this.state === 'playing') { // If the player hasn't hidden their cards
                blob.state = 'choose';
                blob.prompt = "Memorize your cards"
                blob.choices = [
                    { value: 'hide', label: 'Hide your hand' }
                ];
            } else if (this.turn === playerIndex) {
                if (this.state === 'waiting') {
                    blob.state = 'choose'
                    blob.prompt = 'Waiting for more players to join';
                    blob.choices = [];
                    if (this.players.length > 1) {
                        blob.prompt = 'When everyone is ready, start the game';
                        blob.choices.push({ value: 'start', label: 'Start the round' });
                    }
                } else if (this.state === 'playing') {
                    if (player.chosenCard) { // Has a card chosen
                        blob.state = 'choose';
                        blob.prompt = 'Choose a card to discard.';
                        blob.choices = [
                            { value: 'chosenCard', class: `card ${player.chosenCard.name}`, label: `Drawn ${player.chosenCard.value}` },
                            ...player.hand.map((c, i) => ({
                                class: `card ${c.name}`,
                                value: `hand:${i}`,
                                label: `${i == 1 || i == 2 ? '???' : c.value}`,
                                ariaLabel: `${i == 1 || i == 2 ? 'Card' : c.value} in position ${i + 1}`,
                            })),
                        ]
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
            blob.hand = player.hand.map((c, i) => {
                let value = (i == 1 || i == 2) && player.hidden ? '???' : c.value;
                let ariaValue = (i == 1 || i == 2) && player.hidden ? 'Hidden Value' : c.value;
                return {
                    value,
                    name: c.name,
                    ariaLabel: `${ariaValue} in position ${i + 1}`,
                }
            })
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
                this.messages.push(`${player.name} called to end the round`);
                this.lastTurn = (this.turn - 1 + this.players.length) % this.players.length;
                break;
            case 'hide':
                player.hidden = true;
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
                this.discard.unshift(player.chosenCard);
                this.messages.push(`${player.name} discarded ${player.chosenCard.value}.`);
                player.chosenCard = null;
                // If it's the last turn, end the round
                if (this.lastTurn === this.turn) {
                    this.setState('challenging');
                }
                this.turn = (this.turn + 1) % this.players.length;
                break;
            case 'hand':
                // put the card in the discard pile
                // Put the chosen card in the position of the discarded card
                const card = player.removeCardFromHand(parseInt(choiceValue));
                player.hand.splice(parseInt(choiceValue), 0, player.chosenCard as Card);
                this.discard.unshift(card);
                player.chosenCard = null;
                this.messages.push(`${player.name} discarded ${card.value}.`);
                // If it's the last turn, end the round
                if (this.lastTurn === this.turn) {
                    this.endRound(); 
                }
                this.turn = (this.turn + 1) % this.players.length;
                break;
        }
        this.publishBlobs();
    }

    startGame() {
        // Shuffle the deck
        this.deck = shuffle([...cardStack]);
        // Add one card to the discard pile
        this.discard.unshift(this.deck.shift() as Card);
        // Deal cards to each player
        this.players.forEach(player => {
            player.hidden = false;
            while (player.hand.length < HAND_SIZE) {
                this.drawCard(player);
            }
        });
    }

    drawCard(player: Player) {
        player.hand.push(this.deck.shift() as Card);
    }
}