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

const LOGIN_ENDPOINT = '/api/v1/auth/login';

describe('The login process', () => {
    beforeEach(async () => {
        await User.deleteMany({})
    })

    it('should login a user if credentials entered are correct', async () => {

        await User.create(user);

        const response = await app().post(LOGIN_ENDPOINT).send({
            email: 'test@user.com',
            password: 'password'
        });

        const failureResponse = jest.fn();

        expect(failureResponse).not.toHaveBeenCalled();

        expect(response.status).toBe(200);

        expect(response.body.data.token).toBeDefined();

        expect(response.body.message).toBe('Login successful.')

    })

    it('should return a 401 error if the email is incorrect', async () => {

        await User.create(user);

        const response = await app().post(LOGIN_ENDPOINT).send({
            email: 'tester@user.com',
            password: 'password'
        });

        expect(response.status).toBe(401);

        expect(response.body.message).toBe('These credentials do not match our records.');
    })

    it('should return a 401 error if the password is incorrect', async () => {

        await User.create(user);

        const response = await app().post(LOGIN_ENDPOINT).send({
            email: 'test@user.com',
            password: 'passwords'
        });

        expect(response.status).toBe(401);

        expect(response.body.message).toBe('These credentials do not match our records.');
    })

    afterAll(async () => {
        await disconnect();
    })
})
