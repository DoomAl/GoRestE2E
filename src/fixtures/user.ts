import { faker } from '@faker-js/faker';
import {CreateUserParams} from "../model";

export const randomUserData = (): CreateUserParams => {
    const name = faker.person.fullName();
    return {
        name: faker.person.fullName(),
        email: faker.internet.email({firstName: name, lastName: Date.now().toString()}),
        gender: faker.helpers.arrayElement(['male', 'female']),
        status: faker.helpers.arrayElement(['active', 'inactive']),
    }
};