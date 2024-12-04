const jsonServer = require("json-server"); // Importing json-server library
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();
const port = process.env.PORT || 8080; // Choose port like 8080, 3001

// Use middlewares
server.use(middlewares);

// Add middleware to handle pagination, limit, and metadata
server.use((req, res, next) => {
    const originalSend = res.send; // Store the original res.send function
    res.send = function (body) {
        let responseBody = body;

        try {
            responseBody = JSON.parse(body);
        } catch (e) {
            // If parsing fails, leave the response as-is
        }

        // Check if responseBody is an array and process pagination
        if (Array.isArray(responseBody)) {
            const page = parseInt(req.query._page, 10) || 1; // Default to page 1
            const limit = parseInt(req.query._limit, 10) || 10; // Default to limit 10
            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;

            const totalRecords = responseBody.length; // Total number of items
            const totalPages = Math.ceil(totalRecords / limit);

            // Slice the data for pagination
            const paginatedData = responseBody.slice(startIndex, endIndex);

            // Update the response with paginated data and metadata
            responseBody = {
                data: paginatedData,
                metadata: {
                    page,
                    totalPages,
                    totalRecords,
                    limit,
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
