import axios from 'axios';

export default class DataService {
    private url: string;

    constructor(url: string) {
        this.url = url;
    }

    public async query<T, TVariables>(query: string, variables?: TVariables): Promise<T> {
        return axios
            .post(this.url, { query, variables })
            .then(response => response.data as T)
            .catch(error => {
                throw error;
            });
    }
}