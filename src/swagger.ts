import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: "3.1.0",
        info: {
            title: "Jedlik API docs",
            version: "0.0.1",
            description: "<img alt='DB_diagram' height='700px' src='https://nitslaszlo.github.io/static/session/db_diagram_new.jpg' />",
        },
        servers: [
            {
                url: "http://localhost:5000",
            },
            {
                url: "https://jedliksession.cyclic.app",
            },
        ],
    },
    apis: [`${__dirname}/**/*.{dto,controller,model,exception}.{ts,js,yml}`],
};

export default swaggerJsdoc(options);
