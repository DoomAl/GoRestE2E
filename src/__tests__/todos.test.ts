import request from "supertest";
import {BASE_URL, PUBLIC_USER_ID, TOKEN} from "../constants";
import {randomTodoData, randomUserData} from "../fixtures";
import {Todo} from "../model";
import {faker} from "@faker-js/faker";

describe('GoREST API - User/Todos', () => {

    const sut = request(BASE_URL);

    const todosSchema = (todo?: Partial<Omit<Todo, 'id'>>) =>
        expect.arrayContaining([expect.objectContaining({id: expect.any(Number), user_id: todo?.user_id ?? expect.any(Number), title: todo?.title ?? expect.any(String), status: todo?.status ?? expect.any(String)})])

    describe('Operations with valid credentials', () => {
        let userId: number;
        const todoData = randomTodoData();
        const userData = randomUserData();

        beforeAll(async () => {
            const response = await sut.post('/users').set('Authorization', `Bearer ${TOKEN}`).send(userData);
            userId = response.body.id;
        });

        it('should create a new todo', async () => {
            const response = await sut.post(`/users/${userId}/todos`).set('Authorization', `Bearer ${TOKEN}`).send(todoData);
            expect(response.status).toBe(201);
            expect([response.body]).toEqual(todosSchema({...todoData, user_id: userId}));
        });

        // Read the post information
        it('should read the private user todo', async () => {
            await sut.post(`/users/${userId}/todos`).set('Authorization', `Bearer ${TOKEN}`).send(todoData);
            const response = await sut.get(`/users/${userId}/todos`).set('Authorization', `Bearer ${TOKEN}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(todosSchema());
        });
    });

    describe('Operations without valid credentials', () => {
        const todoData = randomTodoData();

        it("should not create a new todo", async () => {

            const response = await sut.post(`/users/${PUBLIC_USER_ID}/posts`).send(todoData);
            expect(response.status).toBe(401);
        });
    });

    describe('Retrieve public information', () => {
        it('should return all public todo', async () => {
            const response = await sut.get('/todos');
            expect(response.status).toBe(200);
            expect(response.body).toEqual(todosSchema());
        });

        it('should return a public user todo', async () => {
            const response = await sut.get(`/users/${PUBLIC_USER_ID}/todos`);
            expect(response.status).toBe(200);
            expect(response.body).toEqual([]);
        });

        it('should not return a private user todo', async () => {
            const createdUserResponse = await sut.post('/users').set('Authorization', `Bearer ${TOKEN}`).send(randomUserData());
            await sut.post(`/users/${createdUserResponse.body.id}/todos`).set('Authorization', `Bearer ${TOKEN}`).send(randomTodoData());
            const response = await sut.get(`/users/${createdUserResponse.body.id}/todos`);
            expect(response.status).toBe(200);
            expect(response.body).toEqual([]);
        });
    });

    describe('Invalid parameters', () => {
        const userData = randomUserData();
        const todoData = {title: '', body: ''};

        it.each([
            [
                {title: '', body: '', status: ''},
                [{field: 'title', message: "can't be blank"}, {field: 'status', message: "can't be blank, can be pending or completed"}]
            ],
            [
                {title: faker.lorem.words(201), body: 'asd'},
                [{field: 'title', message: "is too long (maximum is 200 characters)"}]
            ]
        ])('todo fields error message', async (data, errorMessages) => {
            const userResponse = await sut.post('/users').set('Authorization', `Bearer ${TOKEN}`).send(userData);
            const response = await sut.post(`/users/${userResponse.body.id}/todos`).set('Authorization', `Bearer ${TOKEN}`).send(data);
            expect(response.status).toBe(422);
            expect(response.body).toEqual(expect.arrayContaining(errorMessages));
        });
    })
});
