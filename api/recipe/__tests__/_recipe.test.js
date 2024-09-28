"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const supertest_1 = tslib_1.__importDefault(require("supertest"));
const _app_1 = tslib_1.__importDefault(require("../../_app"));
const _authentication_controller_1 = tslib_1.__importDefault(require("../../authentication/_authentication.controller"));
const _recipe_controller_1 = tslib_1.__importDefault(require("../_recipe.controller"));
// let server: Express.Application;
let cookie;
let server;
beforeAll(async () => {
    // create server for test:
    server = new _app_1.default([new _authentication_controller_1.default(), new _recipe_controller_1.default()]);
    // connect and get cookie for authentication
    await server
        .connectToTheDatabase("5002")
        .then(msg => {
        console.log(msg);
    })
        .catch(err => {
        console.log(err);
    });
    const res = await (0, supertest_1.default)(server.getServer()).post("/auth/login").send({
        email: "student001@jedlik.eu",
        password: "student001",
    });
    // set cookie
    cookie = res.headers["set-cookie"][0];
});
describe("test recipes endpoints", () => {
    let id;
    it("GET /recipes", async () => {
        // get response with supertest-response:
        const response = await (0, supertest_1.default)(server.getServer()).get("/recipes").set("Cookie", cookie);
        // check response with jest:
        expect(response.statusCode).toEqual(200);
        expect(response.header["x-total-count"]).toEqual("10"); // basically 10
    });
    it("GET /recipes (missing cookie)", async () => {
        const response = await (0, supertest_1.default)(server.getServer()).get("/recipes");
        expect(response.statusCode).toEqual(401);
        expect(response.body.message).toEqual("Session id missing or session has expired, please log in!");
    });
    it("GET /:offset/:limit/:sortField/:filter? (search for 'filter')", async () => {
        const response = await (0, supertest_1.default)(server.getServer()).get("/recipes/0/5/description/paradicsom").set("Cookie", cookie);
        expect(response.statusCode).toEqual(200);
        // expect(response.body.count).toEqual(2);
        expect(response.headers["x-total-count"]).toEqual("2");
        expect(response.body[0].description).toContain("paradicsom");
        expect(response.body[0].description).toMatch(/^A tésztát a csomágolásán látható utasítás szerint forró/);
        expect(response.body[1].description).toContain("paradicsom");
        expect(response.body[1].description).toMatch(/^A világbajnok göngyölt csirkemellhez először/);
    });
    it("GET /:offset/:limit/:sortField/:filter? (search for missing 'keyword')", async () => {
        const response = await (0, supertest_1.default)(server.getServer()).get("/recipes/0/5/description/goesiéhgesouihg").set("Cookie", cookie);
        expect(response.statusCode).toEqual(200);
        expect(response.headers["x-total-count"]).toEqual("0");
    });
    it("GET /:offset/:limit/:sortField/:filter? (no last parameter 'filter')", async () => {
        const response = await (0, supertest_1.default)(server.getServer()).get("/recipes/0/5/description").set("Cookie", cookie);
        expect(response.statusCode).toEqual(200);
        expect(response.headers["x-total-count"]).toEqual("10");
    });
    it("GET /recipes/:id  (correct id)", async () => {
        id = "daaaaaaaaaaaaaaaaaaaaaaa";
        const response = await (0, supertest_1.default)(server.getServer()).get(`/recipes/${id}`).set("Cookie", cookie);
        expect(response.statusCode).toEqual(200);
        expect(response.body.recipeName).toEqual("KELKÁPOSZTA FŐZELÉK");
    });
    it("GET /recipes/:id  (missing, but valid id)", async () => {
        id = "6367f3038ae13010a4c9ab49";
        const response = await (0, supertest_1.default)(server.getServer()).get(`/recipes/${id}`).set("Cookie", cookie);
        expect(response.statusCode).toEqual(404);
        expect(response.body.message).toEqual(`Recipe with id ${id} not found`);
    });
    it("GET /recipes/:id  (not valid object id)", async () => {
        id = "61dc03c0e397a1e9cf988b3";
        const response = await (0, supertest_1.default)(server.getServer()).get(`/recipes/${id}`).set("Cookie", cookie);
        expect(response.statusCode).toEqual(404);
        expect(response.body.message).toEqual(`This ${id} id is not valid.`);
    });
    it("DELETE /recipes/:id  (not valid object id)", async () => {
        const response = await (0, supertest_1.default)(server.getServer()).delete(`/recipes/${id}`).set("Cookie", cookie);
        expect(response.statusCode).toEqual(404);
        expect(response.body.message).toEqual(`This ${id} id is not valid.`);
    });
    it("PATCH /recipes/:id  (not valid object id)", async () => {
        const response = await (0, supertest_1.default)(server.getServer()).patch(`/recipes/${id}`).set("Cookie", cookie);
        expect(response.statusCode).toEqual(404);
        expect(response.body.message).toEqual(`This ${id} id is not valid.`);
    });
    it("POST /recipes (with empty json object)", async () => {
        const response = await (0, supertest_1.default)(server.getServer()).post("/recipes").set("Cookie", cookie);
        expect(response.statusCode).toEqual(400);
        expect(response.body.message).toEqual("DTO error: recipeName must be a string, recipeName should not be empty; imageURL must be a string, imageURL must be a URL address, imageURL should not be empty; description must be a string, description should not be empty; ingredients should not be empty, ingredients must be an array");
    });
    it("POST /recipes", async () => {
        const response = await (0, supertest_1.default)(server.getServer())
            .post("/recipes")
            .set("Cookie", cookie)
            .send({
            recipeName: "Mock recipe by Ányos",
            imageURL: "https://jedlik.eu/images/Jedlik-logo-2020-200.png",
            description: "I'll be deleted soon",
            ingredients: ["asa", "sas"],
        });
        id = response.body._id; // this document will be modified and deleted in the following 2 tests:
        expect(response.statusCode).toEqual(200);
    });
    it("PATCH /recipes/:id", async () => {
        const response = await (0, supertest_1.default)(server.getServer()).patch(`/recipes/${id}`).set("Cookie", cookie).send({
            recipeName: "asdasd",
        });
        expect(response.statusCode).toEqual(200);
    });
    it("DELETE /recipes/:id", async () => {
        const response = await (0, supertest_1.default)(server.getServer()).delete(`/recipes/${id}`).set("Cookie", cookie);
        expect(response.statusCode).toEqual(200);
    });
    it("DELETE /recipes/:id (missing, but valid id)", async () => {
        id = "6367f3038ae13010a4c9ab49";
        const response = await (0, supertest_1.default)(server.getServer()).delete(`/recipes/${id}`).set("Cookie", cookie);
        expect(response.statusCode).toEqual(404);
        expect(response.body.message).toEqual(`Recipe with id ${id} not found`);
    });
    it("PATCH /recipes/:id (missing, but valid id)", async () => {
        const response = await (0, supertest_1.default)(server.getServer()).patch(`/recipes/${id}`).set("Cookie", cookie).send({
            recipeName: "asdasd",
        });
        expect(response.statusCode).toEqual(404);
        expect(response.body.message).toEqual(`Recipe with id ${id} not found`);
    });
});
//# sourceMappingURL=_recipe.test.js.map