import DataService from './DataService';
import * as fs from 'fs';
import { ArtistAlbumsTracksQuery, ArtistAlbumsTracksQueryVariables } from './types/artist-albums-tracks';

const dataService = new DataService('http://localhost:3000/graphql');

dataService
.query<ArtistAlbumsTracksQuery, ArtistAlbumsTracksQueryVariables>(
    fs.readFileSync("queries/artist-albums-tracks.graphql", "utf8"),
    {
      artistId: 1
    })
    .then(console.log)
    .catch(console.log);
