/**
 *
 * @jest-environment node
 */

import emailConfirmationValidator from '@validators/email-confirmation';
import Response from '@test/utils/response';
import { connect, disconnect } from '@test/utils/mongoose';
import User from '@models/User';
import { EmailConfirmationSchema } from '@server/validation-schemas';

describe('The email confirmation validator', () => {
    const user = {
        name: 'Test User',
        email: 'that@user.com',
        password: 'password'
    }

    let createdUser;
    let token;

    beforeAll(async () => {
        await connect();

        await User.deleteMany({});

        createdUser = await User.create(user);
    })


    it('should call the next function if email confirmation token is valid', async () => {

        token = createdUser.emailConfirmCode;

        const req = {
            body: { token }
        }

        const res = {};

        const next = jest.fn();

        EmailConfirmationSchema.validate = jest.fn();

        await emailConfirmationValidator(req, res, next);

        expect(next).toHaveBeenCalled();
    })

    it('should return a 422 if the email confirmation token is invalid', async () => {
        const req = {
            body: { token: 'ewjkq' }
        }

        const res = new Response();

        const next = jest.fn();

        const statusSpy = jest.spyOn(res, 'status');

        const jsonSpy = jest.spyOn(res, 'json');

        EmailConfirmationSchema.validate = jest.fn();

        await emailConfirmationValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();

        expect(statusSpy).toHaveBeenCalledWith(422);

        expect(jsonSpy).toHaveBeenCalledWith({
            message: 'Validation failed.',
            data: {
                errors: {
                    'email': 'Invalid email confirmation token.'
                }
            }
        })
    })

    afterAll(async () => {
        await disconnect();
    })
})