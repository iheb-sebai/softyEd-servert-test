const jsonServer = require("json-server"); // Importing json-server library
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();
const port = process.env.PORT || 8080; // Choose port from here like 8080, 3001

// Use middlewares
server.use(middlewares);

// Add middleware to include metadata in the response
server.use((req, res, next) => {
    const originalSend = res.send; // Store the original res.send function
    res.send = function (body) {
        // Parse the body if it's a JSON string
        let responseBody = body;
        try {
            responseBody = JSON.parse(body);
        } catch (e) {
            // If it's not JSON, leave it as is
        }

        // Only modify the response if it's an array
        if (Array.isArray(responseBody)) {
            const page = parseInt(req.query._page) || 1;
            const limit = parseInt(req.query._limit) || responseBody.length;
            const totalRecords = router.db.get(req.path.substring(1)).size().value(); // Total records in the dataset
            const totalPages = Math.ceil(totalRecords / limit);

            responseBody = {
                data: responseBody,
                metadata: {
                    page,
                    totalPages,
                    totalRecords,
                },
            };
        }

        // Send the modified response
        return originalSend.call(this, JSON.stringify(responseBody));
    };
    next();
});

// Use the router
server.use(router);

// Start the server
server.listen(port, () => {
    console.log(`JSON Server is running on port ${port}`);
});
