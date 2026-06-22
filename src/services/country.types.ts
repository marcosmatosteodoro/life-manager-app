/** País retornado pela API. */
export interface Country {
  id: number;
  name: string;
  code: string;
  createdAt: string;
  updatedAt: string;
  creatorId: number | null;
}

export interface CountryInput {
  name: string;
  code: string;
}

export interface CountryListResponse {
  count: number;
  rows: Country[];
}
