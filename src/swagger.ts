import { config } from "dotenv";
import swaggerJsdoc from "swagger-jsdoc";

config();

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: "3.1.0",
        info: {
            title: "Jedlik API docs",
            version: "0.0.1",
            description: "<img alt='DB_diagram' height='700px' src='https://nits68.github.io/static/session/db_diagram_new_new.jpg' />",
        },
        servers: [
            {
                url: process.env.BACKEND_API,
            },
        ],
    },
    apis: [`${__dirname}/**/*.{dto,controller,model,exception}.{ts,js,yml}`],
};

export default swaggerJsdoc(options);
