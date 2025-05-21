require("dotenv").config();

const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person.js"); // Assuming your Mongoose model is here

app.use(express.json());
app.use(cors());
app.use(express.static("dist"));

morgan.token("post", (req) => {
  return req.method === "POST" ? JSON.stringify(req.body) : " ";
});

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :post"),
);

const errorHandler = (err, req, res, next) => {
  console.error("Error name:", err.name);
  console.error("Error message:", err.message);

  if (err.name === "CastError") {
    return res.status(400).json({ error: "Unknown id" });
  } else if (err.name === "ValidationError") {
    return res.status(400).json({ error: err.message });
  } else if (err.name === "MongoServerError" && err.code === 11000) {
    return res
      .status(400)
      .json({ error: "Name must be unique or other unique field violation." });
  }

  return res.status(500).json({ error: "Internal server error" });
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "Unknown endpoint" });
};

app.get("/api/persons", (request, response, next) => {
  Person.find({})
    .then((persons) => {
      response.json(persons);
    })
    .catch((error) => next(error)); // Pass errors to the error handler
});

app.get("/info", (request, response, next) => {
  Person.countDocuments({}) // More efficient way to count documents
    .then((count) => {
      response.send(
        `<p>Phonebook has info for ${count} people</p>
         <p>${new Date()}</p>`,
      );
    })
    .catch((error) => next(error));
});

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).json({ error: "Person not found with this ID" });
      }
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", async (request, response, next) => {
  const id = request.params.id;

  try {
    const result = await Person.findByIdAndDelete(id);

    if (!result) {
      return response.status(404).json({ error: "Person not found" });
    }

    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.post("/api/persons", (request, response, next) => {
  const { name, number } = request.body;

  if (!name && !number) {
    return response.status(400).json({
      error: "name and number are missing",
    });
  }
  if (!name) {
    return response.status(400).json({
      error: "name is missing",
    });
  }
  if (!number) {
    return response.status(400).json({
      error: "number is missing",
    });
  }

  const person = new Person({
    name,
    number,
  });

  person
    .save()
    .then((savedPerson) => {
      response.status(201).json(savedPerson);
    })
    .catch((error) => {
      next(error); //
    });
});

app.put("/api/persons/:id", (request, response, next) => {
  const { number } = request.body;
  const id = request.params.id;

  if (!number) {
    return response.status(400).json({ error: "Number is missing" });
  }

  const personToUpdate = {
    number: number,
  };

  Person.findByIdAndUpdate(id, personToUpdate, {
    new: true,
    runValidators: true,
    context: "query",
  })
    .then((updatedPerson) => {
      if (updatedPerson) {
        response.json(updatedPerson);
      } else {
        response.status(404).json({ error: `Person with ID ${id} not found.` });
      }
    })
    .catch((error) => next(error));
});

app.use(unknownEndpoint);
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
