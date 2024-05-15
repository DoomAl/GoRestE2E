import {CreateUserParams, User} from "../model";
import {randomUserData} from "../fixtures";
import {BASE_URL, TOKEN} from "../constants";
import { makeGoRestClient} from "../client";

// sut = System Under Test
const sutPublicClient = makeGoRestClient(BASE_URL);
const sutAuthClient = makeGoRestClient(BASE_URL, TOKEN);

describe('GoREST API - User CRUD', () => {

    let PUBLIC_USER_ID: number;
    beforeAll(async () => { PUBLIC_USER_ID = (await sutPublicClient.get(`/users`)).body[0].id;});

    describe('Operations with valid credentials', () => {
        let userId: number;
        const userData: CreateUserParams = randomUserData();

        // Create a new user
        it('should create a new user', async () => {

            const response = await sutAuthClient.post('/users', userData);
            expect(response.status).toBe(201);
            expect(response.body).toEqual(expect.objectContaining(userData));
            userId = response.body.id;
        });

        // Read the user information
        it('should read the user information', async () => {
            const response = await sutAuthClient.get(`/users/${userId}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(expect.objectContaining({...userData, id: userId}));
        });

        // Update the user information
        it('should update the user information - put', async () => {
            const updatedData: Partial<User> = {
                name: 'Updated Test User',
                status: 'inactive'
            };

            // const response = await sut.put(`/users/${userId}`).set('Authorization', `Bearer ${TOKEN}`).send(updatedData);
            const response = await sutAuthClient.put(`/users/${userId}`, updatedData);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(expect.objectContaining({...userData, ...updatedData, id: userId}));
        });

        it('should update private user information - patch', async () => {
            const updatedData: Partial<User> = {
                name: 'Updated Test User2',
                status: 'inactive'
            };

            // const response = await sut.patch(`/users/${userId}`).set('Authorization', `Bearer ${TOKEN}`).send(updatedData);
            const response = await sutAuthClient.patch(`/users/${userId}`, updatedData);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(expect.objectContaining({...userData, ...updatedData, id: userId}));
        });

        // Delete the user
        it('should delete the user', async () => {
            // const deleteResponse = await sut.delete(`/users/${userId}`).set('Authorization', `Bearer ${TOKEN}`);
            const deleteResponse = await sutAuthClient.delete(`/users/${userId}`);
            expect(deleteResponse.status).toBe(204);
        });

        // // Verify the user has been deleted
        it('should return 404 for deleted user', async () => {
            // const response = await sut.get(`/users/${userId}`).set('Authorization', `Bearer ${TOKEN}`);
            const response = await sutAuthClient.get(`/users/${userId}`);

            expect(response.status).toBe(404);
        });
    });

    describe('Operations without valid credentials', () => {
        const userData: CreateUserParams = randomUserData();
        // Create a new user
        it("should not create a new user", async () => {

            // const response = await sut.post('/users').send(userData);
            const response = await sutPublicClient.post('/users', userData);
            expect(response.status).toBe(401);
        });

        // // Update the user information
        it('should not update the user information', async () => {
            const updatedData: Partial<User> = {
                name: 'Updated Test User',
                status: 'inactive'
            };

            const response = await sutPublicClient.put(`/users/${PUBLIC_USER_ID}`, updatedData);

            expect(response.status).toBe(401);
        });

        // // Delete the user
        it('should not delete the user', async () => {
            const deleteResponse = await sutPublicClient.delete(`/users/${PUBLIC_USER_ID}`);
            expect(deleteResponse.status).toBe(401);
        });
    });

    describe('Retrieve public information', () => {

        it('should return all public users', async () => {
            const response = await sutPublicClient.get('/users');
            expect(response.status).toBe(200);
        });

        it('should return a public user', async () => {
            const response = await sutPublicClient.get(`/users/${PUBLIC_USER_ID}`);
            expect(response.status).toBe(200);
        });

        it('should not return a private user', async () => {
            const createUserResponse = await sutAuthClient.post('/users',randomUserData());
            const response = await sutPublicClient.get(`/users/${createUserResponse.body.id}`);
            expect(response.status).toBe(404);
        });
    });

    describe('Invalid parameters', () => {
        const user: CreateUserParams = {
            name: 'Test User',
            email: `test+${Date.now()}@gmail.com`,
            gender: 'male',
            status: 'active'
        };
        beforeAll(async () => {
            // await sut.post('/users').set('Authorization', `Bearer ${TOKEN}`).send(user);
            await sutAuthClient.post('/users', user);
        });

        it.each([
            [{email: `test+${Date.now()}@example.com`}, [{
                field: "name",
                message: "can't be blank"
            },
                {
                    field: "gender",
                    message: "can't be blank, can be male of female"
                },
                {
                    field: "status",
                    message: "can't be blank"
                }]],
            [{...user, email: 'a@.com'}, [{field: 'email', message: 'is invalid'}]],
            [{...user}, [{field: 'email', message: 'has already been taken'}]]
        ])('user fields error message', async (userData, expected) => {
            // const response = await sut.post('/users').set('Authorization', `Bearer ${TOKEN}`).send(a);
            const response = await sutAuthClient.post('/users', userData);
            expect(response.status).toBe(422);
            expect(response.body).toEqual(expect.arrayContaining(expected));
        });
    })
});
