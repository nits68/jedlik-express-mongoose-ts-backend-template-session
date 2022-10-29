import "dotenv/config";
import App from "../../app";
import AuthenticationController from "../../authentication/authentication.controller";
import RecipeController from "../../recipe/recipe.controller";
import request from "supertest";

let server: Express.Application;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cookie: string | any;

beforeAll(async () => {
    server = new App([new AuthenticationController(), new RecipeController()]).getServer();
    const res = await request(server).post("/auth/login").send({
        email: "student001@jedlik.eu",
        password: "student001",
    });
    cookie = res.headers["set-cookie"];
});

describe("test recipes endpoints", () => {
    let id: string, count: number;

    it("GET /recipes", async () => {
        const response = await request(server).get("/recipes").set("Cookie", cookie);
        count = response.body.count;
        expect(response.statusCode).toEqual(200);
        expect(response.body.count).toEqual(count); // basically 10
    });

    it("GET /recipes (search for 'keyword')", async () => {
        const response = await request(server).get("/recipes/0/5/discription/1/paradicsom").set("Cookie", cookie);
        expect(response.statusCode).toEqual(200);
        expect(response.body.count).toBeLessThan(count);
    });

    it("GET /recipes (search for wrong 'keyword')", async () => {
        const response = await request(server).get("/recipes/0/5/discription/1/goesiéhgesouihg").set("Cookie", cookie);
        expect(response.statusCode).toEqual(200);
        expect(response.body.count).toEqual(0);
    });

    it("GET /recipes/:id  (wrong id)", async () => {
        id = "uogawagfhianwoigaahnwg";
        const response = await request(server).get(`/recipes/${id}`).set("Cookie", cookie);
        expect(response.statusCode).toEqual(404);
        expect(response.body.message).toEqual(`This ${id} id is not valid.`);
    });

    it("DELETE /recipes/:id  (wrong id)", async () => {
        const response = await request(server).delete(`/recipes/${id}`).set("Cookie", cookie);
        expect(response.statusCode).toEqual(404);
        expect(response.body.message).toEqual(`This ${id} id is not valid.`);
    });

    it("PATCH /recipes/:id  (wrong id)", async () => {
        const response = await request(server).patch(`/recipes/${id}`).set("Cookie", cookie);
        expect(response.statusCode).toEqual(404);
        expect(response.body.message).toEqual(`This ${id} id is not valid.`);
    });

    it("POST /recipes (empty)", async () => {
        const response = await request(server).post("/recipes").set("Cookie", cookie);
        expect(response.statusCode).toEqual(400);
        expect(response.body.message).toEqual("recipeName must be a string,recipeName should not be empty, imageURL must be a string,imageURL must be an URL address,imageURL should not be empty, description must be a string,description should not be empty, ingredients should not be empty,ingredients must be an array");
    });

    it("POST /recipes", async () => {
        const response = await request(server)
            .post("/recipes")
            .set("Cookie", cookie)
            .send({
                recipeName: "Mock recipe by Ányos",
                imageURL: "https://jedlik.eu/images/Jedlik-logo-2020-200.png",
                description: "I'll be deleted soon",
                ingredients: ["asa", "sas"],
            });
        id = response.body._id;
        expect(response.statusCode).toEqual(200);
    });

    it("PATCH /recipes/:id", async () => {
        const response = await request(server).patch(`/recipes/${id}`).set("Cookie", cookie).send({
            recipeName: "asdasd",
        });
        expect(response.statusCode).toEqual(200);
    });

    it("DELETE /recipes/:id", async () => {
        const response = await request(server).delete(`/recipes/${id}`).set("Cookie", cookie);
        expect(response.statusCode).toEqual(200);
    });
});
