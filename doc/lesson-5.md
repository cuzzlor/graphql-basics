```ts
import axios from 'axios';

export default class DataService {
    private url: string;

    constructor(url: string, token: string, correlationId?: string) {
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
```

```
apollo-codegen introspect-schema http://localhost:3000/graphql --output schema.json
apollo-codegen generate artist-albums-tracks.graphql --schema schema.json --target typescript --output types/artist-albums-tracks.ts
```
