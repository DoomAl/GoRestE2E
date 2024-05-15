import {BASE_URL, TOKEN} from "../constants";
import {randomTodoData, randomUserData} from "../fixtures";
import {Todo} from "../model";
import {faker} from "@faker-js/faker";
import {makeGoRestClient} from "../client";


// sut = System Under Test
const sutPublicClient = makeGoRestClient(BASE_URL);
const sutAuthClient = makeGoRestClient(BASE_URL, TOKEN);

const todosSchema = (todo?: Partial<Omit<Todo, 'id'>>) =>
    expect.arrayContaining([expect.objectContaining({id: expect.any(Number), user_id: todo?.user_id ?? expect.any(Number), title: todo?.title ?? expect.any(String), status: todo?.status ?? expect.any(String)})])

describe('GoREST API - User/Todos', () => {

    // actual implementation overwrites the public users everyday
    let PUBLIC_USER_ID: number;
    beforeAll(async () => { PUBLIC_USER_ID = (await sutPublicClient.get(`/users`)).body[0].id;});

    describe('Operations with valid credentials', () => {
        let userId: number;
        const todoData = randomTodoData();
        const userData = randomUserData();

        beforeAll(async () => {
            const response = await sutAuthClient.post('/users', userData);
            userId = response.body.id;
        });

        it('should create a new todo', async () => {
            const response = await sutAuthClient.post(`/users/${userId}/todos`, todoData);
            expect(response.status).toBe(201);
            expect([response.body]).toEqual(todosSchema({...todoData, user_id: userId}));
        });

        // Read the post information
        it('should read the private user todo', async () => {
            await sutAuthClient.post(`/users/${userId}/todos`, todoData);
            const response = await sutAuthClient.get(`/users/${userId}/todos`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(todosSchema());
        });
    });

    describe('Operations without valid credentials', () => {
        const todoData = randomTodoData();

        it("should not create a new todo", async () => {

            const response = await sutPublicClient.post(`/users/${PUBLIC_USER_ID}/posts`, todoData);
            expect(response.status).toBe(401);
        });
    });

    describe('Retrieve information', () => {
        it('should return all public todo', async () => {
            const response = await sutAuthClient.get('/todos');
            expect(response.status).toBe(200);
            expect(response.body).toEqual(todosSchema());
        });

        it('should not return a private user todo', async () => {
            const createdUserResponse = await sutAuthClient.post('/users', randomUserData());
            await sutAuthClient.post(`/users/${createdUserResponse.body.id}/todos`, randomTodoData());
            const response = await sutPublicClient.get(`/users/${createdUserResponse.body.id}/todos`);
            expect(response.status).toBe(200);
            expect(response.body).toEqual([]);
        });
    });

    describe('Invalid parameters', () => {
        const userData = randomUserData();

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
            const userResponse = await sutAuthClient.post('/users', userData);
            const response = await sutAuthClient.post(`/users/${userResponse.body.id}/todos`, data);
            expect(response.status).toBe(422);
            expect(response.body).toEqual(expect.arrayContaining(errorMessages));
        });
    })
});
