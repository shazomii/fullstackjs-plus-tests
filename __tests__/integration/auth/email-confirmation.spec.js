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

const EMAIL_CONFIRM_ENDPOINT = '/api/v1/auth/emails/confirm';

describe('The register process', () => {
    beforeEach(async () => {
        await User.deleteMany({})
    })

    it('should return a 422 if token is invalid', async () => {
        const response = await app().post(EMAIL_CONFIRM_ENDPOINT).send({ token: 'xxx' });

        expect(response.status).toBe(422);

        expect(response.body.message).toBe('Validation failed.')
    })

    it('should confirm a user email', async () => {
        const createdUser = await User.create(user);

        const response = await app().post(EMAIL_CONFIRM_ENDPOINT).send({ token: createdUser.emailConfirmCode });

        expect(response.status).toBe(200);

        expect(response.body.data.user.emailConfirmCode).toBeNull();

        expect(response.body.data.user.emailConfirmedAt).toBeDefined()

        const freshUser = await User.findOne({ email: createdUser.email });

        expect(freshUser.emailConfirmCode).toBeNull();

        expect(freshUser.emailConfirmedAt).toBeDefined();
    })

    afterAll(async () => {
        await disconnect();
    })
})
