import request from "supertest";
import {BASE_URL, TOKEN} from "../constants";
import {randomPostData, randomUserData} from "../fixtures";
import {Post} from "../model";
import {faker} from "@faker-js/faker";

const sut = request(BASE_URL);
const postsSchema = (post?: Omit<Post, 'id'>) => expect.arrayContaining([expect.objectContaining({id: expect.any(Number), user_id: post?.user_id ?? expect.any(Number), title: post?.title ?? expect.any(String), body: post?.body ?? expect.any(String)})]);

describe('GoREST API - User/Posts', () => {

    // actual implementation overwrites the public users everyday
    let PUBLIC_USER_ID: number;
    beforeAll(async () => { PUBLIC_USER_ID = (await sut.get(`/users`)).body[0].id;});

    describe('Operations with valid credentials', () => {
        let userId: number;
        const postData = randomPostData();
        const userData = randomUserData();

        beforeAll(async () => {
            const response = await sut.post('/users').set('Authorization', `Bearer ${TOKEN}`).send(userData);
            userId = response.body.id;
        });

        it('should create a new post', async () => {
            const response = await sut.post(`/users/${userId}/posts`).set('Authorization', `Bearer ${TOKEN}`).send(postData);
            expect(response.status).toBe(201);
            expect([response.body]).toEqual(postsSchema({...postData, user_id: userId}));
        });

        // Read the post information
        it('should read the private user posts', async () => {
            await sut.post(`/users/${userId}/posts`).set('Authorization', `Bearer ${TOKEN}`).send(postData);
            const response = await sut.get(`/users/${userId}/posts`).set('Authorization', `Bearer ${TOKEN}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(postsSchema());
        });
    });

    describe('Operations without valid credentials', () => {
        const postData = randomPostData();

        it("should not create a new post", async () => {

            const response = await sut.post(`/users/${PUBLIC_USER_ID}/posts`).send(postData);
            expect(response.status).toBe(401);
        });
    });

    describe('Retrieve information', () => {
        it('should return all public posts', async () => {
            const response = await sut.get('/posts');
            expect(response.status).toBe(200);
            expect(response.body).toEqual(postsSchema());
        });

        it('should not return a private user post', async () => {
            const createdUserResponse = await sut.post('/users').set('Authorization', `Bearer ${TOKEN}`).send(randomUserData());
            await sut.post(`/users/${createdUserResponse.body.id}/posts`).set('Authorization', `Bearer ${TOKEN}`).send(randomPostData());
            const response = await sut.get(`/users/${createdUserResponse.body.id}/posts`);
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
            const userResponse = await sut.post('/users').set('Authorization', `Bearer ${TOKEN}`).send(userData);
            const response = await sut.post(`/users/${userResponse.body.id}/posts`).set('Authorization', `Bearer ${TOKEN}`).send(data);
            expect(response.status).toBe(422);
            expect(response.body).toEqual(expect.arrayContaining(errorMessages));
        });
    })
});
