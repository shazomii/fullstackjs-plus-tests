/**
 *
 * @jest-environment node
 */

import User from '@models/User';
import PasswordReset from '@models/PasswordReset';
import server from '@server/app';
import supertest from 'supertest';
import { disconnect } from '@test/utils/mongoose';

const app = () => supertest(server);

const user = {
    name: 'Test User',
    email: 'test@user.com',
    password: 'password'
};

const FORGOT_PASSWORD_ENDPOINT = '/api/v1/auth/passwords/email';

describe('The password reset process', () => {
    beforeAll(async () => {
        await User.deleteMany({});

        await PasswordReset.deleteMany({});

        await User.create(user);
    })

    it('should send a password reset email to the user', async () => {
        const response = await app().post(FORGOT_PASSWORD_ENDPOINT).send({ email: 'test@user.com' });

        expect(response.status).toBe(200);

        expect(response.body.message).toBe('Forgot password email sent.')
    })

    afterAll(async () => {
        await disconnect();
    })
})