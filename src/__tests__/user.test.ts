import {CreateUserParams, User} from "../model";
import {randomUserData} from "../fixtures";
import request from "supertest";
import {BASE_URL, TOKEN} from "../constants";

const sut = request(BASE_URL);

describe('GoREST API - User CRUD', () => {

    let PUBLIC_USER_ID: number;
    beforeAll(async () => { PUBLIC_USER_ID = (await sut.get(`/users`)).body[0].id;});

    describe('Operations with valid credentials', () => {
        let userId: number;
        const userData: CreateUserParams = randomUserData();

        // Create a new user
        it('should create a new user', async () => {

            const response = await sut.post('/users').set('Authorization', `Bearer ${TOKEN}`).send(userData);
            expect(response.status).toBe(201);
            expect(response.body).toEqual(expect.objectContaining(userData));
            userId = response.body.id;
        });

        // Read the user information
        it('should read the user information', async () => {
            const response = await sut.get(`/users/${userId}`).set('Authorization', `Bearer ${TOKEN}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(expect.objectContaining({...userData, id: userId}));
        });

        // Update the user information
        it('should update the user information - put', async () => {
            const updatedData: Partial<User> = {
                name: 'Updated Test User',
                status: 'inactive'
            };

            const response = await sut.put(`/users/${userId}`).set('Authorization', `Bearer ${TOKEN}`).send(updatedData);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(expect.objectContaining({...userData, ...updatedData, id: userId}));
        });

        it('should update private user information - patch', async () => {
            const updatedData: Partial<User> = {
                name: 'Updated Test User2',
                status: 'inactive'
            };

            const response = await sut.patch(`/users/${userId}`).set('Authorization', `Bearer ${TOKEN}`).send(updatedData);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(expect.objectContaining({...userData, ...updatedData, id: userId}));
        });

        // Delete the user
        it('should delete the user', async () => {
            const deleteResponse = await sut.delete(`/users/${userId}`).set('Authorization', `Bearer ${TOKEN}`);
            expect(deleteResponse.status).toBe(204);
        });

        // // Verify the user has been deleted
        it('should return 404 for deleted user', async () => {
            const response = await sut.get(`/users/${userId}`).set('Authorization', `Bearer ${TOKEN}`);

            expect(response.status).toBe(404);
        });
    });

    describe('Operations without valid credentials', () => {
        const userData: CreateUserParams = randomUserData();
        // Create a new user
        it("should not create a new user", async () => {

            const response = await sut.post('/users').send(userData);
            expect(response.status).toBe(401);
        });

        // // Update the user information
        it('should not update the user information', async () => {
            const updatedData: Partial<User> = {
                name: 'Updated Test User',
                status: 'inactive'
            };

            const response = await sut.put(`/users/${PUBLIC_USER_ID}`).send(updatedData);

            expect(response.status).toBe(401);
        });

        // // Delete the user
        it('should not delete the user', async () => {
            const deleteResponse = await sut.delete(`/users/${PUBLIC_USER_ID}`);
            expect(deleteResponse.status).toBe(401);
        });
    });

    describe('Retrieve public information', () => {

        it('should return all public users', async () => {
            const response = await sut.get('/users');
            expect(response.status).toBe(200);
        });

        it('should return a public user', async () => {
            const response = await sut.get(`/users/${PUBLIC_USER_ID}`);
            expect(response.status).toBe(200);
        });

        it('should not return a private user', async () => {
            const createUserResponse = await sut.post('/users').set('Authorization', `Bearer ${TOKEN}`).send(randomUserData());
            const response = await sut.get(`/users/${createUserResponse.body.id}`);
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
            await sut.post('/users').set('Authorization', `Bearer ${TOKEN}`).send(user);
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
        ])('user fields error message', async (a, expected) => {
            const response = await sut.post('/users').set('Authorization', `Bearer ${TOKEN}`).send(a);
            expect(response.status).toBe(422);
            expect(response.body).toEqual(expect.arrayContaining(expected));
        });
    })
});
