import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Trimium API",
            version: "1.0.0",
            description:
                "URL shortening & link management platform with analytics, workspace collaboration, linkhub profiles, and team management.",
        },
        servers: [
            {
                url: "http://localhost:5000",
                description: "Development server",
            },
        ],
        components: {
            securitySchemes: {
                cookieAuth: {
                    type: "apiKey",
                    in: "cookie",
                    name: "accessToken",
                },
            },
            schemas: {
                ErrorResponse: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: false },
                        message: { type: "string" },
                        statusCode: { type: "integer" },
                        reasonPhrase: { type: "string" },
                    },
                },
                SuccessResponse: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: true },
                        message: { type: "string" },
                        statusCode: { type: "integer", example: 200 },
                        reasonPhrase: { type: "string", example: "OK" },
                    },
                },
            },
        },
        security: [{ cookieAuth: [] }],
    },
    apis: ["./src/modules/**/routes.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
