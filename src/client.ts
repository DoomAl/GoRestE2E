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
        get: (url: string) => client.get(url).set(headers),
        post: (url: string, data: any) => client.post(url).set(headers).send(data),
        put: (url: string, data: any) => client.put(url).set(headers).send(data),
        patch: (url: string, data: any) => client.patch(url).set(headers).send(data),
        delete: (url: string) => client.delete(url).set(headers)
    }
};