import {BASE_URL, TOKEN} from "../constants";
import {randomPostData, randomUserData} from "../fixtures";
import {Post} from "../model";
import {faker} from "@faker-js/faker";
import {makeGoRestClient} from "../client";

// sut = System Under Test
const sutPublicClient = makeGoRestClient(BASE_URL);
const sutAuthClient = makeGoRestClient(BASE_URL, TOKEN);

const postsSchema = (post?: Omit<Post, 'id'>) => expect.arrayContaining([expect.objectContaining({id: expect.any(Number), user_id: post?.user_id ?? expect.any(Number), title: post?.title ?? expect.any(String), body: post?.body ?? expect.any(String)})]);

describe('GoREST API - User/Posts', () => {

    let PUBLIC_USER_ID: number;
    beforeAll(async () => { PUBLIC_USER_ID = (await sutPublicClient.get(`/users`)).body[0].id;});

    describe('Operations with valid credentials', () => {
        let userId: number;
        const postData = randomPostData();
        const userData = randomUserData();

        beforeAll(async () => {
            const response = await sutAuthClient.post('/users', userData);
            userId = response.body.id;
        });

        it('should create a new post', async () => {
            const response = await sutAuthClient.post(`/users/${userId}/posts`, postData);
            expect(response.status).toBe(201);
            expect([response.body]).toEqual(postsSchema({...postData, user_id: userId}));
        });

        // Read the post information
        it('should read the private user posts', async () => {
            await sutAuthClient.post(`/users/${userId}/posts`, postData);
            const response = await sutAuthClient.get(`/users/${userId}/posts`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(postsSchema());
        });
    });

    describe('Operations without valid credentials', () => {
        const postData = randomPostData();

        it("should not create a new post", async () => {

            const response = await sutPublicClient.post(`/users/${PUBLIC_USER_ID}/posts`,postData);
            expect(response.status).toBe(401);
        });
    });

    describe('Retrieve information', () => {
        it('should return all public posts', async () => {
            const response = await sutPublicClient.get('/posts');
            expect(response.status).toBe(200);
            expect(response.body).toEqual(postsSchema());
        });

        it('should not return a private user post', async () => {
            const createdUserResponse = await sutAuthClient.post('/users', randomUserData());
            await sutAuthClient.post(`/users/${createdUserResponse.body.id}/posts`, randomPostData());
            const response = await sutPublicClient.get(`/users/${createdUserResponse.body.id}/posts`);
            expect(response.status).toBe(200);
            expect(response.body).toEqual([]);
        });
    });

    describe('Invalid parameters', () => {
        const userData = randomUserData();

        it.each([
            [
                {title: '', body: ''},
                [{field: 'title', message: "can't be blank"}, {field: 'body', message: "can't be blank"}]
            ],
            [
                {title: faker.lorem.words(201), body: 'asd'},
                [{field: 'title', message: "is too long (maximum is 200 characters)"}]
            ]
        ])('post fields error message', async (data, errorMessages) => {
            const userResponse = await sutAuthClient.post('/users', userData);
            const response = await sutAuthClient.post(`/users/${userResponse.body.id}/posts`, data);
            expect(response.status).toBe(422);
            expect(response.body).toEqual(expect.arrayContaining(errorMessages));
        });
    })
});
