/**
 *
 * @jest-environment node
 */

import forgotPasswordValidator from '@validators/forgot-password';
import User from '@models/User';
import PasswordReset from '@models/PasswordReset'
import { connect, disconnect } from '@test/utils/mongoose';
import Response from '@test/utils/response';
import randomString from 'randomstring';

describe('The forgot password validator', () => {

    const user = {
        name: 'Test User',
        email: 'comp@user.com',
        password: 'password'
    }

    let createdUser;

    beforeAll(async () => {
        await connect();

        await User.deleteMany({});

        await PasswordReset.deleteMany({});

        createdUser = await User.create(user);
    })

    it('should call the next function if forgot password validation succeeds', async () => {

        let email = createdUser.email;

        const req = {
            body: {
                email
            }
        }

        const res = new Response();

        const next = jest.fn()

        await forgotPasswordValidator(req, res, next);

        expect(next).toHaveBeenCalled();
    })

    it('should return an error if user is not in the database', async () => {

        const req = {
            body: {
                email: 'mike@user.com'
            }
        }

        const res = new Response();

        const next = jest.fn();

        const statusSpy = jest.spyOn(res, 'status');

        const jsonSpy = jest.spyOn(res, 'json');

        await forgotPasswordValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();

        expect(statusSpy).toHaveBeenCalledWith(422);

        expect(jsonSpy).toHaveBeenCalledWith({
            message: 'Validation failed.',
            data: {
                errors: {
                    'email': 'No account was found with this email.'
                }
            }
        })
    })

    it('should return an error if password reset link already exists for a user', async () => {

        let email = createdUser.email;

        const req = {
            body: {
                email
            }
        }

        const token = randomString.generate(32);

        await PasswordReset.create({
            token,
            email,
            createdAt: new Date()
        });

        const res = new Response();

        const next = jest.fn();

        const statusSpy = jest.spyOn(res, 'status');

        const jsonSpy = jest.spyOn(res, 'json');

        await forgotPasswordValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();

        expect(statusSpy).toHaveBeenCalledWith(422);

        expect(jsonSpy).toHaveBeenCalledWith({
            message: 'Validation failed.',
            data: {
                errors: {
                    'email': 'Password reset link already sent.'
                }
            }
        })
    })

    it('should return a 422 if validation fails', async () => {

        const req = {
            body: {
                email: ''
            }
        };

        const res = new Response();

        const next = jest.fn();

        const statusSpy = jest.spyOn(res, 'status');

        const jsonSpy = jest.spyOn(res, 'json');

        await forgotPasswordValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();

        expect(statusSpy).toHaveBeenCalledWith(422);

        expect(jsonSpy).toHaveBeenCalledWith({
            message: 'Validation failed.',
            data: {
                errors: {
                    'email': 'email is a required field'
                }
            }
        })
    })

    afterAll(async () => {
        await disconnect();
    })
})