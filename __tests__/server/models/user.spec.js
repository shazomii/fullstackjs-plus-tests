/**
 *
 * @jest-environment node
 */


import User from '@models/User';
import { connect, disconnect } from '@test/utils/mongoose';
import Bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '@config';

describe('The User model', () => {

    const user = {
        name: 'Test User',
        email: 'test@user.com',
        password: 'password'
    }

    let createdUser;

    beforeAll(async () => {
        await connect();

        createdUser = await User.create(user);
    })

    it('should hash the user password before saving to the database', async () => {

        expect(Bcrypt.compareSync(user.password, createdUser.password)).toBe(true);

    })

    it('should set the email confirm code before saving to the database', async () => {

        expect(createdUser.emailConfirmCode).toEqual(expect.any(String));

    })

    describe('The generateToken method', () => {
        it('should generate a valid jwt for a user', () => {

            const token = createdUser.generateToken();

            const { id } = jwt.verify(token, config.jwtSecret);

            expect(id).toEqual(JSON.parse(JSON.stringify(createdUser._id)));
        })
    })

    describe('The comparePasswords function', () => {
        it('should return true/false if the given user password and the password stored on file are same/different', async () => {
            expect(createdUser.comparePasswords('password')).toBe(true);

            expect(createdUser.comparePasswords('passwords')).toBe(false);
        })

    })

    afterAll(async () => {
        await disconnect();
    })
})