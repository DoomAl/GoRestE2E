import * as supertest from "supertest";


interface GoRestClient {
    get: (url: string) => Promise<supertest.Response>;
    post: (url: string, data: any) => Promise<supertest.Response>;
    put: (url: string, data: any) => Promise<supertest.Response>;
    patch: (url: string, data: any) => Promise<supertest.Response>;
    delete: (url: string) => Promise<supertest.Response>;
};

export const makeGoRestClient = (baseUrl: string, token?: string): GoRestClient => {
    const client = supertest.agent(baseUrl);
    const headers = token ? {Authorization: `Bearer ${token}`} : {};
    return {
        get: async (url: string) => await client.get(url).set(headers),
        post: async (url: string, data: any) => await client.post(url).set(headers).send(data),
        put: async (url: string, data: any) => await client.put(url).set(headers).send(data),
        patch: async (url: string, data: any) => await client.patch(url).set(headers).send(data),
        delete: async (url: string) => await client.delete(url).set(headers)
    }
};