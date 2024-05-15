import { faker } from '@faker-js/faker';
import {CreatePostParams} from "../model";

export const randomPostData = (): CreatePostParams => ({
    title: faker.lorem.word({length: { min: 5, max: 7 }}),
    body: faker.lorem.paragraph(),
});
