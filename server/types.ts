export interface Room {
    id?: string;
    players?: PlayerType[];
    messages?: string[];
    state?: string;
    name?: string;
    playerCount?: number;
    maxPlayers?: number;
    addPlayer?: (playerId: string, playerName: string) => void;
    action?: (data: any) => void;
    toString?: () => string;
};
// The blobs themselves (rooms, user:x, room:x, etc.)
export type ChannelsList = Record<string, Room | undefined>;

export type PlayerType = {
    id: string;
    name: string;
    hp: number;
}