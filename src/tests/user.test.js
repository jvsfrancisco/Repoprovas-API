import supertest from "supertest";

import app from "../index.js";
import prisma from "../configs/db.js";
import * as userFactory from "./factories/userFactory.js";

beforeEach(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE users;`;
});

describe("Sign Up tests", () => {
    it("Given email and password, should create a new user and return 201", async () => {
        const login = userFactory.createLogin();

        const response = await supertest(app).post("/signup").send(login);

        expect(response.statusCode).toBe(201);

        const user = await prisma.user.findFirst({
            where: { email: login.email },
        });

        expect(user.email).toEqual(login.email);
    });

    it("Given an invalid input, should return 422", async () => {
        const login = {};

        const response = await supertest(app).post("/signup").send(login);

        expect(response.statusCode).toBe(422);
    });

    it("Given an email already in use, should return 409", async () => {
        const login = userFactory.createLogin();
        await userFactory.createUser(login);

        const response = await supertest(app).post("/signup").send(login);
        expect(response.statusCode).toBe(409);
    });
});

describe("Sign In tests", () => {
    it("Given an valid email and password, should return a token and status 200", async () => {
        const login = userFactory.createLogin();
        await userFactory.createUser(login);

        const response = await supertest(app).post("/signin").send(login);

        expect(response.statusCode).toBe(200);
        expect(response.body.token).not.toBeNull();
    });

    it("Given and invalid input, should return status 422", async () => {
        const login = {};

        const response = await supertest(app).post("/signin").send(login);

        expect(response.statusCode).toBe(422);
    });

    it("Given an incorrect password, should return 401", async () => {
        const login = userFactory.createLogin();
        await userFactory.createUser(login);

        const response = await supertest(app).post("/signin").send({
            email: login.email,
            password: "anotherpassword",
        });

        expect(response.statusCode).toBe(401);
    });

    it("Given an incorrect email, should return 404", async () => {
        const login = userFactory.createLogin();
        await userFactory.createUser(login);

        const response = await supertest(app).post("/signin").send({
            email: "email@email.com",
            password: login.password,
        });

        expect(response.statusCode).toBe(404);
    });
});

afterAll(async () => {
    await prisma.$disconnect();
});