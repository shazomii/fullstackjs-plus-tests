/**
 *
 * @jest-environment node
 */

import resetPasswordValidator from '@validators/reset-password';
import Response from '@test/utils/response';
import { connect, disconnect } from '@test/utils/mongoose';
import User from '@models/User';
import PasswordReset from '@models/PasswordReset';
import randomString from 'randomstring';
import { ResetPasswordSchema } from '@server/validation-schemas';

describe('The reset password validator', () => {
    const user = {
        name: 'Test User',
        email: 'that@user.com',
        password: 'passwordg'
    }

    let createdUser;

    let token;

    beforeAll(async () => {
        await connect();

        await User.deleteMany({});

        await PasswordReset.deleteMany({});

        createdUser = await User.create(user);

        token = randomString.generate(32);
    })

    beforeEach(async () => {
        await PasswordReset.deleteMany({});
    })

    it('should call the next function if password reset token is valid', async () => {

        const email = createdUser.email;

        const password = createdUser.password;

        const req = {
            body: {
                email,
                token,
                password
            }
        }

        ResetPasswordSchema.validate = jest.fn();

        await PasswordReset.create({
            token,
            email,
            createdAt: new Date()
        });

        const next = jest.fn();

        const res = {};

        await resetPasswordValidator(req, res, next);

        expect(next).toHaveBeenCalled();
    })

    it('should return a 422 if password reset token validation fails', async () => {

        const email = createdUser.email;

        const password = createdUser.password;

        const req = {
            body: {
                email,
                token,
                password
            }
        }

        ResetPasswordSchema.validate = jest.fn();

        await PasswordReset.create({
            token,
            email: 'mike@user.com',
            createdAt: new Date()
        });

        const next = jest.fn();

        const res = new Response();

        const statusSpy = jest.spyOn(res, 'status');

        const jsonSpy = jest.spyOn(res, 'json');

        await resetPasswordValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();

        expect(statusSpy).toHaveBeenCalledWith(422);

        expect(jsonSpy).toHaveBeenCalledWith({
            message: 'Validation failed.',
            data: {
                errors: {
                    'email': 'Invalid password reset token.'
                }
            }
        });
    })

    afterAll(async () => {
        await disconnect();
    })
})
