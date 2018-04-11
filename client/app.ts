import DataService from './DataService';
import * as fs from 'fs';

const dataService = new DataService('http://localhost:3000/graphql');

dataService
    .query(fs.readFileSync('queries/artist-albums-tracks.graphql', 'utf8'), { artistId: 1 })
    .then(console.log)
    .catch(console.log);
