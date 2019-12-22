/**
 *
 * @jest-environment node
 */

import registerValidator from '@validators/register';
import Response from '@test/utils/response';
import { connect, disconnect } from '@test/utils/mongoose';
import User from '@models/User';
import { RegisterSchema } from '@server/validation-schemas';

describe('The register validator', () => {
    beforeAll(async () => {
        await connect();

        await User.deleteMany({});
    })

    it('should call the next function if validation is successful', async () => {

        const req = {
            body: {
                name: 'Test User',
                email: 'user@test.com',
                password: 'password'
            }
        }

        RegisterSchema.validate = jest.fn();

        const res = {};

        const next = jest.fn();

        await registerValidator(req, res, next);

        expect(next).toHaveBeenCalled();
    })

    it('should return an error if user is already registered', async () => {
        await User.create({
            name: 'Some user',
            email: 'user@test.com',
            password: 'password'
        })

        const req = {
            body: {
                name: 'Some user',
                email: 'user@test.com',
                password: 'password'
            }
        }

        RegisterSchema.validate = jest.fn();

        const res = new Response();

        const next = jest.fn();

        const statusSpy = jest.spyOn(res, 'status');

        const jsonSpy = jest.spyOn(res, 'json');

        await registerValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();

        expect(statusSpy).toHaveBeenCalledWith(422);

        expect(jsonSpy).toHaveBeenCalledWith({
            message: 'Validation failed.',
            data: {
                errors: {
                    'email': 'This email has already been taken.'
                }
            }
        });
    })

    afterAll(async () => {
        await disconnect();
    })
})