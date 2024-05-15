import { faker } from '@faker-js/faker';
import {CreateTodoParams} from "../model";

export const randomTodoData = (): CreateTodoParams => ({
    title: faker.lorem.word({length: { min: 5, max: 7 }}),
    status: faker.helpers.arrayElement(['pending', 'completed']),
});
