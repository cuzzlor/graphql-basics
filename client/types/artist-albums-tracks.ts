/* tslint:disable */
//  This file was automatically generated and should not be edited.

export interface ArtistAlbumsTracksQueryVariables {
  artistId: number,
};

export interface ArtistAlbumsTracksQuery {
  // Finds an artist by id
  artist:  {
    name: string,
    albums:  Array< {
      title: string,
      tracks:  Array< {
        name: string,
        composer: string | null,
        milliseconds: number | null,
        bytes: number | null,
        unitPrice: number | null,
      } | null > | null,
    } | null > | null,
  } | null,
};
