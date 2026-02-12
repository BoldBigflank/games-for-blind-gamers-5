
export type ActionResponse = {
    channel: string;
    data: Record<string, any>;
}

export interface Room {
    id: string;
    name: string;
    playerCount: number;
    maxPlayers: number;
    action?: (data: any) => ActionResponse[];
    toString: () => string;
};
// The blobs themselves (rooms, user:x, room:x, etc.)
export type ChannelsList = {
    rooms: {
        public: Room[]
    }
}

export type PlayerType = {
    id: string;
    name: string;
    hp: number;
}