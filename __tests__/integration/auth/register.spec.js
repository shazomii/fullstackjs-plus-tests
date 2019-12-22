/**
 *
 * @jest-environment node
 */

import User from '@models/User';
import server from '@server/app';
import supertest from 'supertest';
import { disconnect } from '@test/utils/mongoose';

const app = () => supertest(server);

const user = {
    name: 'Test User',
    email: 'test@user.com',
    password: 'password'
};

const REGISTER_ENDPOINT = '/api/v1/auth/register';

describe('The register process', () => {
    beforeEach(async () => {
        await User.deleteMany({})
    })
    it('should register a new user', async () => {
        const response = await app().post(REGISTER_ENDPOINT).send(user)

        expect(response.status).toBe(200);

        expect(response.body.data.token).toBeDefined();

        expect(response.body.message).toBe('Account registered.');
    })

    it('should return a 422 if registeration fails', async() => {
        await User.create(user);

        const response = await app().post(REGISTER_ENDPOINT).send(user);

        expect(response.status).toBe(422);

        expect(response.body.message).toBe('Validation failed.');

        expect(response.body.data.errors).toEqual({
            email: 'This email has already been taken.'
        })


    })



    afterAll(async () => {
        await disconnect();
    })
})
