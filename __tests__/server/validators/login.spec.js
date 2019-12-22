/**
 *
 * @jest-environment node
 */

import loginValidator from '@validators/login';
import Response from '@test/utils/response';

describe('The login validator', () => {
    it('should call the next function when validation succeeds', async () => {

        const req = {
            body: {
                email: 'a@b.com',
                password: 'password'
            }
        }

        const res = {}

        const next = jest.fn();


        await loginValidator(req, res, next);

        expect(next).toHaveBeenCalled()
    })

    it('should return a 422 if validation fails', async () => {

        const req = {
            body: {
                email: 'a@b.com'
            }
        }

        const next = jest.fn();

        const res = new Response();

        const statusSpy = jest.spyOn(res, 'status');

        const jsonSpy = jest.spyOn(res, 'json');

        await loginValidator(req, res, next);

        expect(statusSpy).toHaveBeenCalledWith(422);
        expect(jsonSpy).toHaveBeenCalledWith({
            message: 'Validation failed.',
            data: {
                errors: {
                    'password': 'password is a required field'
                }
            }
        });
    })
})