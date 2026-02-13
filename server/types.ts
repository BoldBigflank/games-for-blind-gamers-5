
export type ActionResponse = {
    channel: string;
    data: Record<string, any>;
}

export interface Room {
    id?: string;
    state?: string;
    name?: string;
    playerCount?: number;
    maxPlayers?: number;
    addPlayer?: (playerId: string) => void;
    action?: (data: any) => ActionResponse[];
    toString?: () => string;
};
// The blobs themselves (rooms, user:x, room:x, etc.)
export type ChannelsList = Record<string, Room | undefined>;

export type PlayerType = {
    id: string;
    name: string;
    hp: number;
}