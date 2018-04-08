import Track from './Track';

export default interface Album {
    id: number;
    title: string;
    tracks: Track[];
};
